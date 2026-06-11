import prisma from '../../config/db.js';
import * as publicBookingRepo from './publicBooking.repository.js';
import { emitBookingEvent } from './publicBooking.events.js';
import redisClient from '../../config/redis.js';
import { createActivityEvent, createBookingTimelineEvent } from '../../shared/services/activity/activity.service.js';
import { dispatchNotification } from '../../shared/services/notifications/notification.dispatcher.js';

/**
 * Calculates available public booking slots for a salon service on a date.
 * Queries staff schedules, leaves, and appointments, filtering out slots held in Redis.
 */
export async function getAvailableSlots(tenantId, { date, serviceId, staffId }) {
  // 1. Fetch service details
  const service = await publicBookingRepo.findServiceById(tenantId, serviceId);
  if (!service) {
    throw new Error('Service not found or inactive.');
  }

  const totalDuration = service.duration + service.bufferTime;

  // 2. Fetch eligible staff
  const staffList = await publicBookingRepo.findEligibleStaff(tenantId, serviceId, staffId);

  // 3. Resolve day of week
  const [year, month, day] = date.split('-').map(Number);
  const targetDate = new Date(Date.UTC(year, month - 1, day));
  const dayOfWeek = targetDate.getUTCDay();

  // 4. Check global holidays
  const globalHolidays = await publicBookingRepo.findGlobalHolidays(tenantId, targetDate);
  if (globalHolidays.length > 0) {
    return []; // Closed
  }

  const availableSlots = [];

  for (const staff of staffList) {
    // Check staff vacation
    const staffHolidays = await publicBookingRepo.findStaffHolidays(tenantId, staff.id, targetDate);
    if (staffHolidays.length > 0) {
      continue;
    }

    // Check staff schedule
    const schedule = staff.schedules.find(s => s.dayOfWeek === dayOfWeek);
    if (!schedule || !schedule.isWorkingDay) {
      continue;
    }

    // Fetch existing appointments
    const appointments = await publicBookingRepo.findStaffAppointmentsForDate(tenantId, staff.id, date);

    const timeToMinutes = (timeStr) => {
      const [hours, minutes] = timeStr.split(':').map(Number);
      return hours * 60 + minutes;
    };

    const startMinutes = timeToMinutes(schedule.startTime);
    const endMinutes = timeToMinutes(schedule.endTime);

    const breaks = schedule.breaks.map(b => ({
      start: timeToMinutes(b.startTime),
      end: timeToMinutes(b.endTime),
    }));

    const activeBookings = appointments.map(app => {
      const start = new Date(app.startTime);
      const end = new Date(app.endTime);
      const startMins = start.getUTCHours() * 60 + start.getUTCMinutes();
      const endMins = end.getUTCHours() * 60 + end.getUTCMinutes();
      return { start: startMins, end: endMins };
    });

    // Generate intervals
    for (let current = startMinutes; current + totalDuration <= endMinutes; current += 15) {
      const slotStart = current;
      const slotEnd = current + totalDuration;

      const overlapsBreak = breaks.some(b => 
        (slotStart >= b.start && slotStart < b.end) ||
        (slotEnd > b.start && slotEnd <= b.end) ||
        (slotStart <= b.start && slotEnd >= b.end)
      );

      if (overlapsBreak) continue;

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

  // 5. Filter out active Redis slot holds
  if (availableSlots.length > 0 && redisClient && redisClient.isOpen) {
    try {
      const holdKeys = availableSlots.map(slot => 
        `slot-hold:${tenantId}:${slot.staffId}:${slot.startTime}`
      );
      
      const holds = await redisClient.mGet(holdKeys);
      
      return availableSlots.filter((slot, idx) => !holds[idx]);
    } catch (err) {
      console.warn('⚠️ Failed to check slot holds from Redis. Showing all database-free slots.', err.message);
    }
  }

  return availableSlots;
}

/**
 * Places a temporary hold on an available slot.
 * Ensures the slot is not already booked or held.
 */
export async function holdSlot(tenantId, { serviceId, staffId, startTime }) {
  const service = await publicBookingRepo.findServiceById(tenantId, serviceId);
  if (!service) {
    throw new Error('Service not found or inactive.');
  }

  const duration = service.duration;
  const start = new Date(startTime);
  const end = new Date(start.getTime() + duration * 60 * 1000);

  // Check database overlap
  const isOverlapping = await publicBookingRepo.checkOverlappingBookings(
    tenantId,
    staffId,
    start,
    end
  );

  if (isOverlapping) {
    throw new Error('This slot is already booked.');
  }

  const key = `slot-hold:${tenantId}:${staffId}:${startTime}`;
  const holdToken = `hold_${Math.random().toString(36).substring(2, 10)}${Date.now().toString(36)}`;

  if (redisClient && redisClient.isOpen) {
    const existingHold = await redisClient.get(key);
    if (existingHold) {
      throw new Error('public_booking.hold_overlap');
    }

    await redisClient.set(key, holdToken, {
      EX: 300, // 5 minutes TTL
    });
  }

  return {
    holdToken,
    expiresAt: new Date(Date.now() + 300 * 1000).toISOString(),
  };
}

/**
 * Create a public guest booking.
 * Implements notice limit verification, transaction row-locking, CRM customer lookups,
 * and Redis hold releases.
 */
export async function createPublicBooking(tenantId, data) {
  // Honeypot check
  if (data.botField) {
    console.warn('🤖 Bot booking attempt blocked via honeypot botField.');
    throw new Error('public_booking.bot_detected');
  }

  // Lead time/notice limit check (2 hours in advance minimum)
  const leadTimeHours = 2;
  const earliestAllowed = new Date(Date.now() + leadTimeHours * 60 * 60 * 1000);
  const startTime = new Date(data.startTime);
  
  if (startTime < earliestAllowed) {
    throw new Error('public_booking.notice_limit');
  }

  const booking = await prisma.$transaction(async (tx) => {
    // 1. Lock selected staff row to serialize writes
    await publicBookingRepo.lockStaffRow(tx, data.staffId);

    // 2. Fetch service
    const service = await tx.service.findFirst({
      where: { id: data.serviceId, tenantId, isActive: true },
    });
    if (!service) {
      throw new Error('Service not found or inactive.');
    }

    const endTime = new Date(startTime.getTime() + service.duration * 60 * 1000);

    // 3. Double-check overlap in database inside transaction
    const isOverlapping = await publicBookingRepo.checkOverlappingBookings(
      tenantId,
      data.staffId,
      startTime,
      endTime,
      tx
    );
    if (isOverlapping) {
      throw new Error('This slot has already been booked. Please pick another time.');
    }

    // 4. Redis slot hold validation
    const key = `slot-hold:${tenantId}:${data.staffId}:${data.startTime}`;
    if (redisClient && redisClient.isOpen) {
      const existingHold = await redisClient.get(key);
      if (existingHold && existingHold !== data.holdToken) {
        throw new Error('public_booking.hold_overlap');
      }
    }

    // 5. Resolve Customer Profile
    const normalizedPhone = data.customer.phone ? data.customer.phone.replace(/\D/g, '') : null;
    const email = data.customer.email || null;

    let customer = await publicBookingRepo.findCustomerByEmailOrPhone(
      tenantId,
      { email, normalizedPhone },
      tx
    );

    if (!customer) {
      customer = await publicBookingRepo.createCustomer(tenantId, {
        firstName: data.customer.firstName,
        lastName: data.customer.lastName,
        email,
        phone: data.customer.phone,
        normalizedPhone,
      }, tx);
    }

    // 6. Generate unique booking reference
    const bookingReference = await publicBookingRepo.generateBookingReference(tx, tenantId);

    // 7. Write appointment booking record
    return await publicBookingRepo.createBooking(tenantId, {
      customerId: customer.id,
      staffId: data.staffId,
      serviceId: data.serviceId,
      startTime,
      endTime,
      notes: data.notes,
      bookingReference,
    }, tx);
  });

  // 8. Delete active Redis hold key and invalidate dashboard cache
  if (redisClient && redisClient.isOpen) {
    const key = `slot-hold:${tenantId}:${data.staffId}:${data.startTime}`;
    await redisClient.del(key).catch(() => {});
    
    // Invalidate analytics caches
    const pattern = `analytics:${tenantId}:*`;
    const keys = await redisClient.keys(pattern).catch(() => []);
    if (keys.length > 0) {
      await redisClient.del(keys).catch(() => {});
    }
  }

  // 9. Emit event for async notifications
  await emitBookingEvent('booking.created', booking);

  // 10. Create activity event for timelines, daily summary, and activity center
  const tenant = await prisma.tenant.findUnique({ where: { id: tenantId } });

  (async () => {
    try {
      await createActivityEvent(tenantId, {
        eventType: 'booking.created',
        title: `Booking ${booking.bookingReference} created`,
        description: `${booking.customer?.firstName} ${booking.customer?.lastName} booked ${booking.service?.name} with ${booking.staff?.name}`,
        sourceModule: 'public-booking',
        entityType: 'appointment',
        entityId: booking.id,
        customerId: booking.customerId,
        appointmentId: booking.id,
        actorStaffId: booking.staffId,
        branchId: booking.branchId || null,
        metadata: {
          bookingReference: booking.bookingReference,
          serviceName: booking.service?.name,
          staffName: booking.staff?.name,
          source: 'WEBSITE',
        },
      });

      // Create customer timeline event
      await createBookingTimelineEvent(tenantId, booking);

      // Dispatch notification via event-driven system
      await dispatchNotification(tenantId, {
        eventType: 'booking.created',
        channel: 'EMAIL',
        payload: {
          booking,
          customer: booking.customer,
          service: booking.service,
          tenant,
        },
      });
    } catch (err) {
      console.error('[Public Booking] Post-creation event/notification error:', err.message);
    }
  })();

  return booking;
}
