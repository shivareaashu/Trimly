import prisma from '../../config/db.js';
import * as bookingRepo from './booking.repository.js';
import { recalculateCustomerMetrics } from '../customers/customer.service.js';
import { emitBookingEvent } from './booking.events.js';
import { sendEmail, notificationTemplates } from '../../shared/services/notifications/notification.service.js';
import { activityEmitter } from '../../shared/services/activity/activityEmitter.js';

/**
 * Calculates available time slots for a given salon service on a specific date.
 * Implements the core scheduling availability engine.
 * 
 * @param {string} tenantId - Tenant ID context
 * @param {Object} query
 * @param {string} query.date - The date to check (YYYY-MM-DD)
 * @param {string} query.serviceId - The service being booked
 * @param {string} [query.staffId] - Optional specific staff ID
 * @returns {Promise<Array>} List of available slots with staff mappings
 */
export async function getAvailableSlots(tenantId, { date, serviceId, staffId }) {
  // 1. Fetch Service details via Repository
  const service = await bookingRepo.findServiceById(tenantId, serviceId);
  if (!service) {
    throw new Error('Service not found or inactive.');
  }

  const totalDuration = service.duration + service.bufferTime; // duration + buffer in minutes

  // 2. Fetch list of eligible Staff members via Repository
  const staffList = await bookingRepo.findEligibleStaff(tenantId, serviceId, staffId);

  // 3. Resolve day of week (0 = Sunday, 6 = Saturday)
  const [year, month, day] = date.split('-').map(Number);
  const targetDate = new Date(Date.UTC(year, month - 1, day));
  const dayOfWeek = targetDate.getUTCDay();

  // 4. Fetch Tenant-wide holidays via Repository
  const globalHolidays = await bookingRepo.findGlobalHolidays(tenantId, targetDate);
  if (globalHolidays.length > 0) {
    return []; // Salon is closed
  }

  const availableSlots = [];

  // 5. Generate slots for each staff practitioner
  for (const staff of staffList) {
    // A. Check for staff-specific holidays/vacation via Repository
    const staffHolidays = await bookingRepo.findStaffHolidays(tenantId, staff.id, targetDate);
    if (staffHolidays.length > 0) {
      continue; // Staff is on vacation/leave
    }

    // B. Get staff schedule for the day
    const schedule = staff.schedules.find(s => s.dayOfWeek === dayOfWeek);
    if (!schedule || !schedule.isWorkingDay) {
      continue; // Staff doesn't work this day
    }

    // C. Fetch existing bookings for this staff on this day via Repository
    const appointments = await bookingRepo.findStaffAppointmentsForDate(tenantId, staff.id, date);

    // D. Grid generation helper values
    const timeToMinutes = (timeStr) => {
      const [hours, minutes] = timeStr.split(':').map(Number);
      return hours * 60 + minutes;
    };

    const startMinutes = timeToMinutes(schedule.startTime);
    const endMinutes = timeToMinutes(schedule.endTime);

    // Parse breaks to minutes
    const breaks = schedule.breaks.map(b => ({
      start: timeToMinutes(b.startTime),
      end: timeToMinutes(b.endTime),
    }));

    // Parse appointments to minutes (relative to target date)
    const activeBookings = appointments.map(app => {
      const start = new Date(app.startTime);
      const end = new Date(app.endTime);
      const startMins = start.getUTCHours() * 60 + start.getUTCMinutes();
      const endMins = end.getUTCHours() * 60 + end.getUTCMinutes();
      return { start: startMins, end: endMins };
    });

    // E. Scan from startMinutes to endMinutes in 15m intervals
    for (let current = startMinutes; current + totalDuration <= endMinutes; current += 15) {
      const slotStart = current;
      const slotEnd = current + totalDuration;

      // Check break overlaps
      const overlapsBreak = breaks.some(b => 
        (slotStart >= b.start && slotStart < b.end) ||
        (slotEnd > b.start && slotEnd <= b.end) ||
        (slotStart <= b.start && slotEnd >= b.end)
      );

      if (overlapsBreak) continue;

      // Check appointment overlaps
      const overlapsBooking = activeBookings.some(b => 
        (slotStart >= b.start && slotStart < b.end) ||
        (slotEnd > b.start && slotEnd <= b.end) ||
        (slotStart <= b.start && slotEnd >= b.end)
      );

      if (overlapsBooking) continue;

      const formatTimePart = (mins) => {
        const hrs = Math.floor(mins / 60);
        const mns = mins % 60;
        return `${String(hrs).padStart(2, '0')}:${String(mns).padStart(2, '0')}:00.000Z`;
      };

      const startIso = `${date}T${formatTimePart(slotStart)}`;
      const endIso = `${date}T${formatTimePart(slotStart + service.duration)}`;

      availableSlots.push({
        staffId: staff.id,
        staffName: staff.name,
        startTime: startIso,
        endTime: endIso,
      });
    }
  }

  return availableSlots;
}

/**
 * Place a new appointment booking.
 * Employs a SELECT FOR UPDATE row-level transaction lock on the Staff practitioner
 * to eliminate race conditions / double bookings under heavy concurrency.
 * 
 * @param {string} tenantId
 * @param {Object} data
 * @returns {Promise<Object>}
 */
export async function createBooking(tenantId, data) {
  // Execute transactional query containing row locking
  const booking = await prisma.$transaction(async (tx) => {
    let customerId = data.customerId;

    if (!customerId) {
      if (!data.customer) {
        throw new Error('Customer details are required for public booking.');
      }

      const customerWhere = {
        tenantId,
        OR: [],
      };

      if (data.customer.email) {
        customerWhere.OR.push({ email: data.customer.email });
      }
      if (data.customer.phone) {
        customerWhere.OR.push({ phone: data.customer.phone });
      }

      let customer = null;
      if (customerWhere.OR.length > 0) {
        customer = await tx.customer.findFirst({
          where: customerWhere,
        });
      }

      if (!customer) {
        customer = await tx.customer.create({
          data: {
            tenantId,
            firstName: data.customer.firstName,
            lastName: data.customer.lastName,
            email: data.customer.email || null,
            phone: data.customer.phone || null,
          },
        });
      }

      customerId = customer.id;
    }

    // 1. Lock the selected staff member's row for updates
    await bookingRepo.lockStaffRow(tx, data.staffId);

    // 2. Fetch service to calculate endTime inside transaction
    const service = await tx.service.findFirst({
      where: { id: data.serviceId, tenantId, isActive: true },
    });

    if (!service) {
      throw new Error('Service is invalid or not available.');
    }

    const startTime = new Date(data.startTime);
    const endTime = new Date(startTime.getTime() + service.duration * 60000);

    // 3. Validate overlaps (passing the transaction client)
    const isOverlapping = await bookingRepo.checkOverlappingBookings(
      tenantId,
      data.staffId,
      startTime,
      endTime,
      undefined,
      tx
    );

    if (isOverlapping) {
      throw new Error('This slot has already been booked. Please pick another time.');
    }

    const bookingReference = await bookingRepo.generateBookingReference(tx, tenantId);
    const serviceItems = [{
      serviceId: service.id,
      name: service.name,
      price: Number(service.price),
      duration: service.duration,
      addedAt: new Date().toISOString(),
      source: 'BOOKING',
    }];

    // 4. Save booking record inside transaction
    return await bookingRepo.createBooking(tenantId, {
      ...data,
      customerId,
      startTime,
      endTime,
      bookingReference,
      serviceItems,
      totalAmount: service.price,
      status: data.status || 'BOOKED',
    }, tx);
  });

  // 5. Emit event for async triggers (only after database transaction has committed successfully)
  await emitBookingEvent('booking.created', booking);
  activityEmitter.emit('booking.created', { tenantId, booking });

  // Send booking confirmation email asynchronously
  if (booking.customer && booking.customer.email) {
    (async () => {
      try {
        const tenant = await prisma.tenant.findUnique({ where: { id: tenantId } });
        const template = notificationTemplates.bookingCreated(booking, booking.customer, booking.service, tenant);
        await sendEmail({
          to: booking.customer.email,
          subject: template.subject,
          html: template.html,
          text: template.text
        });
      } catch (err) {
        console.error('[Notification Service] Failed to send email during booking creation:', err);
      }
    })();
  }

  return booking;
}

/**
 * Reschedule or update a booking.
 * 
 * @param {string} tenantId
 * @param {string} bookingId
 * @param {Object} data
 * @returns {Promise<Object>}
 */
export async function updateBooking(tenantId, bookingId, data) {
  const currentBooking = await bookingRepo.findBookingById(tenantId, bookingId);
  if (!currentBooking) {
    throw new Error('Appointment booking not found.');
  }

  const updatePayload = {};

  if (data.notes !== undefined) {
    updatePayload.notes = data.notes;
  }

  if (data.status) {
    updatePayload.status = data.status;
  }

  if (data.startTime) {
    const startTime = new Date(data.startTime);
    const service = currentBooking.service;
    const endTime = new Date(startTime.getTime() + service.duration * 60000);

    // Lock staff and validate overlaps inside transaction
    const updated = await prisma.$transaction(async (tx) => {
      await bookingRepo.lockStaffRow(tx, currentBooking.staffId);
      
      const isOverlapping = await bookingRepo.checkOverlappingBookings(
        tenantId,
        currentBooking.staffId,
        startTime,
        endTime,
        bookingId,
        tx
      );

      if (isOverlapping) {
        throw new Error('The updated slot is already booked.');
      }

      return bookingRepo.updateBooking(tenantId, bookingId, {
        startTime,
        endTime,
        ...updatePayload
      });
    });

    await emitBookingEvent('booking.updated', updated);
    return updated;
  }

  const updatedBooking = await bookingRepo.updateBooking(tenantId, bookingId, updatePayload);
  await emitBookingEvent('booking.updated', updatedBooking);
  
  return updatedBooking;
}

export async function transitionBooking(tenantId, bookingId, action, payload = {}) {
  const booking = await bookingRepo.findBookingById(tenantId, bookingId);
  if (!booking) {
    throw new Error('Appointment booking not found.');
  }

  const previousStatus = booking.status;
  const updateData = {};

  switch (action) {
    case 'check-in':
      updateData.status = 'CHECKED_IN';
      break;
    case 'assign':
      updateData.status = 'ASSIGNED';
      if (payload.staffId) updateData.staffId = payload.staffId;
      break;
    case 'accept':
      updateData.status = 'CONSULTATION';
      break;
    case 'request-reassignment':
      updateData.status = 'CHECKED_IN';
      updateData.notes = [booking.notes, payload.reason ? `Reassignment requested: ${payload.reason}` : 'Reassignment requested.']
        .filter(Boolean)
        .join('\n');
      break;
    case 'start':
      updateData.status = 'IN_SERVICE';
      updateData.serviceStartedAt = new Date();
      break;
    case 'complete':
      updateData.status = 'COMPLETED';
      updateData.serviceEndedAt = new Date();
      break;
    case 'bill':
      updateData.status = 'BILLED';
      break;
    case 'mark-paid':
      updateData.status = 'PAID';
      break;
    default:
      throw new Error('Unsupported appointment action.');
  }

  const updated = await bookingRepo.updateBooking(tenantId, bookingId, updateData);

  if (action === 'mark-paid') {
    const amount = Number(updated.totalAmount || updated.service?.price || 0);
    const existingPayment = await prisma.payment.findFirst({
      where: {
        tenantId,
        appointmentId: updated.id,
        paymentStatus: { in: ['PENDING', 'PARTIALLY_PAID', 'PAID'] },
      },
      orderBy: { createdAt: 'desc' },
    });

    if (existingPayment) {
      await prisma.payment.update({
        where: { id: existingPayment.id },
        data: {
          amount,
          paidAmount: amount,
          status: 'PAID',
          paymentStatus: 'PAID',
          paymentMethod: payload.paymentMethod || existingPayment.paymentMethod || 'CASH',
          method: payload.paymentMethod || existingPayment.method || 'CASH',
          paidAt: new Date(),
        },
      });
    } else {
      await prisma.payment.create({
        data: {
          tenantId,
          appointmentId: updated.id,
          customerId: updated.customerId,
          amount,
          paidAmount: amount,
          status: 'PAID',
          paymentStatus: 'PAID',
          paymentMethod: payload.paymentMethod || 'CASH',
          method: payload.paymentMethod || 'CASH',
          paidAt: new Date(),
          branchId: updated.branchId || null,
        },
      });
    }
  }

  if (['COMPLETED', 'BILLED', 'PAID'].includes(updated.status)) {
    await recalculateCustomerMetrics(tenantId, updated.customerId).catch((error) => {
      console.error('[Customer Metrics] Failed to recalculate after appointment transition:', error.message);
    });
  }

  await emitBookingEvent(`booking.${action}`, updated);
  activityEmitter.emit('booking.status_changed', {
    tenantId,
    booking: updated,
    previousStatus,
    newStatus: updated.status,
    actorUserId: payload.actorUserId,
  });
  return updated;
}

export async function addServiceToBooking(tenantId, bookingId, { serviceId }) {
  const booking = await bookingRepo.findBookingById(tenantId, bookingId);
  if (!booking) {
    throw new Error('Appointment booking not found.');
  }

  const service = await bookingRepo.findServiceById(tenantId, serviceId);
  if (!service) {
    throw new Error('Service is invalid or not available.');
  }

  const currentItems = Array.isArray(booking.serviceItems) ? booking.serviceItems : [{
    serviceId: booking.serviceId,
    name: booking.service?.name || 'Service',
    price: Number(booking.service?.price || 0),
    duration: booking.service?.duration || 0,
    addedAt: booking.createdAt?.toISOString?.() || new Date().toISOString(),
    source: 'BOOKING',
  }];

  const nextItems = [
    ...currentItems,
    {
      serviceId: service.id,
      name: service.name,
      price: Number(service.price),
      duration: service.duration,
      addedAt: new Date().toISOString(),
      source: 'CONSULTATION',
    },
  ];

  const totalAmount = nextItems.reduce((sum, item) => sum + Number(item.price || 0), 0);
  const totalDuration = nextItems.reduce((sum, item) => sum + Number(item.duration || 0), 0);
  const endTime = booking.serviceStartedAt
    ? new Date(new Date(booking.serviceStartedAt).getTime() + totalDuration * 60000)
    : booking.endTime;

  const updated = await bookingRepo.updateBooking(tenantId, bookingId, {
    status: booking.status === 'IN_SERVICE' ? 'IN_SERVICE' : 'CONSULTATION',
    serviceItems: nextItems,
    totalAmount,
    endTime,
  });

  await emitBookingEvent('booking.service_added', updated);
  return updated;
}

export function getFollowUpSuggestion(booking) {
  const revisitDays = booking.service?.revisitAfterDays || booking.customer?.expectedRevisitDays || 30;
  const baseDate = booking.serviceEndedAt || booking.endTime || new Date();
  const recommendedDate = new Date(new Date(baseDate).getTime() + revisitDays * 86400000);
  return {
    serviceId: booking.serviceId,
    serviceName: booking.service?.name,
    revisitAfterDays: revisitDays,
    recommendedDate,
  };
}

/**
 * Cancel a booking.
 * 
 * @param {string} tenantId
 * @param {string} bookingId
 * @returns {Promise<Object>}
 */
export async function cancelBooking(tenantId, bookingId) {
  const booking = await updateBooking(tenantId, bookingId, { status: 'CANCELLED' });
  await emitBookingEvent('booking.cancelled', booking);
  return booking;
}
