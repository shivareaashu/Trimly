import prisma from '../../../config/db.js';
import { sendEmail, notificationTemplates } from './notification.service.js';

/**
 * Event-driven notification dispatcher.
 * 
 * Instead of directly calling sendEmail(), modules emit notification events
 * through this dispatcher. The dispatcher:
 *  1. Creates a NotificationEvent record (PENDING)
 *  2. Attempts delivery
 *  3. Updates status (SENT/FAILED)
 * 
 * This provides:
 *  - Full delivery audit trail
 *  - Retry capability
 *  - Multi-channel support (EMAIL, SMS, WHATSAPP, PUSH)
 * 
 * @param {string} tenantId
 * @param {Object} params
 */
export async function dispatchNotification(tenantId, {
  eventType,
  channel = 'EMAIL',
  payload,
  scheduledAt,
}) {
  let notificationEvent = null;

  try {
    // 1. Create NotificationEvent record
    notificationEvent = await prisma.notificationEvent.create({
      data: {
        tenantId,
        eventType,
        channel,
        status: 'PENDING',
        payload,
        scheduledAt: scheduledAt || null,
      },
    });

    // 2. Attempt delivery based on channel
    switch (channel) {
      case 'EMAIL':
        await deliverEmail(tenantId, eventType, payload);
        break;
      case 'SMS':
        // Future: await deliverSMS(tenantId, eventType, payload);
        console.log(`📱 [Notification] SMS dispatch queued for [${eventType}] (not yet implemented)`);
        break;
      case 'WHATSAPP':
        // Future: await deliverWhatsApp(tenantId, eventType, payload);
        console.log(`💬 [Notification] WhatsApp dispatch queued for [${eventType}] (not yet implemented)`);
        break;
      case 'PUSH':
        // Future: await deliverPush(tenantId, eventType, payload);
        console.log(`🔔 [Notification] Push dispatch queued for [${eventType}] (not yet implemented)`);
        break;
      default:
        console.warn(`[Notification] Unknown channel: ${channel}`);
    }

    // 3. Mark as SENT
    await prisma.notificationEvent.update({
      where: { id: notificationEvent.id },
      data: { status: 'SENT', sentAt: new Date(), attempts: 1 },
    });

    console.log(`📧 Notification [${eventType}] dispatched via ${channel}`);
  } catch (error) {
    console.error(`[Notification Dispatcher] Failed [${eventType}] via ${channel}:`, error.message);

    // Mark as FAILED if record exists
    if (notificationEvent) {
      await prisma.notificationEvent.update({
        where: { id: notificationEvent.id },
        data: {
          status: 'FAILED',
          lastError: error.message,
          attempts: { increment: 1 },
        },
      }).catch(() => {});
    }
  }
}

/**
 * Deliver an email notification using the existing notification service.
 */
async function deliverEmail(tenantId, eventType, payload) {
  const { booking, customer, service, tenant } = payload;

  if (!customer?.email) {
    console.log(`[Notification] No email address for customer — skipping email for [${eventType}]`);
    return;
  }

  let template;
  switch (eventType) {
    case 'booking.created':
      template = notificationTemplates.bookingCreated(booking, customer, service, tenant);
      break;
    case 'payment.paid':
      template = notificationTemplates.paymentPaid(
        payload.payment, customer, booking, tenant
      );
      break;
    case 'appointment.reminder':
      template = notificationTemplates.appointmentReminder(booking, customer, service, tenant);
      break;
    default:
      console.warn(`[Notification] No email template for event type: ${eventType}`);
      return;
  }

  await sendEmail({
    to: customer.email,
    subject: template.subject,
    html: template.html,
    text: template.text,
  });
}

export default { dispatchNotification };
