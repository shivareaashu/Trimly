import { EventEmitter } from 'events';
import prisma from '../../../config/db.js';
import { createActivityEvent } from './activity.service.js';

class ActivityEmitter extends EventEmitter {}

export const activityEmitter = new ActivityEmitter();

// Central Event Handler for Activity Logging & Timelines
activityEmitter.on('booking.created', async ({ tenantId, booking }) => {
  try {
    // Check if details are pre-loaded, otherwise fetch them
    const fullBooking = await prisma.appointment.findUnique({
      where: { id: booking.id },
      include: {
        customer: true,
        service: true,
        staff: true,
        branch: true
      }
    });

    if (!fullBooking) return;

    // Create central Activity Event
    await createActivityEvent(tenantId, {
      eventType: 'booking.created',
      title: `Booking ${fullBooking.bookingReference} created`,
      description: `${fullBooking.customer?.firstName} ${fullBooking.customer?.lastName} booked ${fullBooking.service?.name} with ${fullBooking.staff?.name}`,
      sourceModule: 'bookings',
      entityType: 'appointment',
      entityId: fullBooking.id,
      customerId: fullBooking.customerId,
      appointmentId: fullBooking.id,
      actorStaffId: fullBooking.staffId,
      branchId: fullBooking.branchId,
      metadata: {
        bookingReference: fullBooking.bookingReference,
        serviceName: fullBooking.service?.name,
        staffName: fullBooking.staff?.name,
        startTime: fullBooking.startTime,
        source: fullBooking.source
      }
    });

    // Create Customer Timeline Event
    await prisma.customerTimelineEvent.create({
      data: {
        tenantId,
        customerId: fullBooking.customerId,
        appointmentId: fullBooking.id,
        eventType: 'booking.created',
        title: `Booked ${fullBooking.service?.name || 'appointment'}`,
        description: `Scheduled with ${fullBooking.staff?.name || 'staff'} for ${new Date(fullBooking.startTime).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })} - Ref: ${fullBooking.bookingReference}`,
        amount: fullBooking.totalAmount,
        referenceId: fullBooking.bookingReference,
        metadata: {
          source: fullBooking.source,
          staffName: fullBooking.staff?.name,
          serviceName: fullBooking.service?.name
        }
      }
    });

  } catch (error) {
    console.error('Error in activityEmitter booking.created handler:', error);
  }
});

activityEmitter.on('booking.status_changed', async ({ tenantId, booking, previousStatus, newStatus, actorUserId }) => {
  try {
    const fullBooking = await prisma.appointment.findUnique({
      where: { id: booking.id },
      include: {
        customer: true,
        service: true,
        staff: true,
        branch: true
      }
    });

    if (!fullBooking) return;

    const statusLabels = {
      PENDING: 'Pending',
      CONFIRMED: 'Confirmed',
      CHECKED_IN: 'Checked In',
      ASSIGNED: 'Assigned',
      CONSULTATION: 'Consultation',
      IN_SERVICE: 'In Service',
      COMPLETED: 'Completed',
      BILLED: 'Billed',
      PAID: 'Paid',
      CANCELLED: 'Cancelled'
    };

    const newLabel = statusLabels[newStatus] || newStatus;
    const desc = `${fullBooking.customer?.firstName} ${fullBooking.customer?.lastName}'s appointment with ${fullBooking.staff?.name} changed to ${newLabel}`;

    // Create Activity Event
    await createActivityEvent(tenantId, {
      eventType: `booking.${newStatus.toLowerCase()}`,
      title: `Appointment ${newStatus.replace('_', ' ')}`,
      description: desc,
      sourceModule: 'bookings',
      entityType: 'appointment',
      entityId: fullBooking.id,
      customerId: fullBooking.customerId,
      appointmentId: fullBooking.id,
      actorUserId,
      branchId: fullBooking.branchId,
      metadata: {
        bookingReference: fullBooking.bookingReference,
        previousStatus,
        newStatus,
        staffName: fullBooking.staff?.name
      }
    });

    // Create Customer Timeline Event
    await prisma.customerTimelineEvent.create({
      data: {
        tenantId,
        customerId: fullBooking.customerId,
        appointmentId: fullBooking.id,
        eventType: `appointment.${newStatus.toLowerCase()}`,
        title: `Appointment status: ${newLabel}`,
        description: desc,
        referenceId: fullBooking.bookingReference,
        metadata: {
          previousStatus,
          newStatus
        }
      }
    });

  } catch (error) {
    console.error('Error in activityEmitter booking.status_changed handler:', error);
  }
});

activityEmitter.on('payment.received', async ({ tenantId, payment }) => {
  try {
    const fullPayment = await prisma.payment.findUnique({
      where: { id: payment.id },
      include: {
        customer: true,
        appointment: {
          include: {
            service: true
          }
        }
      }
    });

    if (!fullPayment) return;

    const amount = Number(fullPayment.amount);
    const methodLabel = fullPayment.paymentMethod || 'CASH';

    // Create Activity Event
    await createActivityEvent(tenantId, {
      eventType: 'payment.collected',
      title: `Payment collected: ₹${amount.toLocaleString('en-IN')}`,
      description: `Collected ₹${amount.toLocaleString('en-IN')} via ${methodLabel} from client ${fullPayment.customer?.firstName} ${fullPayment.customer?.lastName}`,
      sourceModule: 'payments',
      entityType: 'payment',
      entityId: fullPayment.id,
      customerId: fullPayment.customerId,
      appointmentId: fullPayment.appointmentId,
      branchId: fullPayment.branchId,
      metadata: {
        amount,
        paymentMethod: methodLabel,
        paymentStatus: fullPayment.paymentStatus
      }
    });

    // Create Customer Timeline Event
    if (fullPayment.customerId) {
      await prisma.customerTimelineEvent.create({
        data: {
          tenantId,
          customerId: fullPayment.customerId,
          paymentId: fullPayment.id,
          appointmentId: fullPayment.appointmentId,
          eventType: 'payment.made',
          title: `Payment of ₹${amount.toLocaleString('en-IN')} made`,
          description: `Processed via ${methodLabel} for ${fullPayment.appointment?.service?.name || 'services'}`,
          amount,
          referenceId: fullPayment.transactionRef || undefined,
          metadata: {
            paymentMethod: methodLabel,
            paymentStatus: fullPayment.paymentStatus
          }
        }
      });
    }

  } catch (error) {
    console.error('Error in activityEmitter payment.received handler:', error);
  }
});

export default activityEmitter;
