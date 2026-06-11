import prisma from '../../../config/db.js';

/**
 * Create an ActivityEvent record for the activity center,
 * customer timelines, staff timelines, and daily summaries.
 *
 * @param {string} tenantId
 * @param {Object} params
 * @returns {Promise<Object>} Created ActivityEvent
 */
export async function createActivityEvent(tenantId, {
  eventType,
  title,
  description,
  sourceModule,
  entityType,
  entityId,
  customerId,
  appointmentId,
  paymentId,
  expenseId,
  supplierId,
  inventoryItemId,
  actorUserId,
  actorStaffId,
  branchId,
  metadata,
}) {
  try {
    const event = await prisma.activityEvent.create({
      data: {
        tenantId,
        eventType,
        title,
        description: description || null,
        sourceModule,
        entityType: entityType || null,
        entityId: entityId || null,
        customerId: customerId || null,
        appointmentId: appointmentId || null,
        paymentId: paymentId || null,
        expenseId: expenseId || null,
        supplierId: supplierId || null,
        inventoryItemId: inventoryItemId || null,
        actorUserId: actorUserId || null,
        actorStaffId: actorStaffId || null,
        branchId: branchId || null,
        metadata: metadata || undefined,
        occurredAt: new Date(),
      },
    });

    console.log(`📋 Activity Event [${eventType}]: ${title} (${tenantId})`);
    return event;
  } catch (error) {
    console.error(`[Activity Service] Failed to create event [${eventType}]:`, error.message);
    // Activity logging should never break the main flow
    return null;
  }
}

/**
 * Create a customer timeline event from a booking.
 *
 * @param {string} tenantId
 * @param {Object} booking - Full booking with customer, service, staff relations
 */
export async function createBookingTimelineEvent(tenantId, booking) {
  try {
    await prisma.customerTimelineEvent.create({
      data: {
        tenantId,
        customerId: booking.customerId,
        appointmentId: booking.id,
        eventType: 'booking.created',
        title: `Booked ${booking.service?.name || 'appointment'}`,
        description: `With ${booking.staff?.name || 'staff'} - Ref: ${booking.bookingReference}`,
        amount: booking.service?.price || null,
        referenceId: booking.bookingReference,
        metadata: {
          source: 'public-booking',
          staffName: booking.staff?.name,
          serviceName: booking.service?.name,
        },
      },
    });
  } catch (error) {
    console.error('[Activity Service] Failed to create timeline event:', error.message);
  }
}

export default { createActivityEvent, createBookingTimelineEvent };
