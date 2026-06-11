import prisma from '../../../config/db.js';
import { refreshLifecycleForTenant } from '../../../modules/customers/customer.service.js';
import { findCustomersDueForRevisit } from '../../../modules/customers/customer.repository.js';

function buildReminderPayload(customer, tenant, mode) {
  const serviceName = customer.recommendedService?.name || 'your next service';
  const firstName = customer.firstName || 'there';
  const salonName = tenant?.name || 'your salon';
  const days = customer.daysSinceLastVisit || 0;

  const text = mode === 'overdue'
    ? `We miss you at ${salonName}. It has been ${days} days since your last visit. Enjoy 10% off on your next appointment.`
    : `Hi ${firstName}, it has been almost a month since your last visit. Would you like to schedule your next ${serviceName} session?`;

  return {
    customerId: customer.id,
    customerName: `${customer.firstName} ${customer.lastName}`.trim(),
    phone: customer.phone,
    recommendedServiceId: customer.recommendedService?.id || null,
    recommendedServiceName: serviceName,
    daysSinceLastVisit: customer.daysSinceLastVisit,
    daysUntilDue: customer.daysUntilDue,
    text,
  };
}

export async function queueDailyRevisitReminders({ now = new Date() } = {}) {
  const tenants = await prisma.tenant.findMany({
    select: { id: true, name: true },
  });

  let queued = 0;

  for (const tenant of tenants) {
    await refreshLifecycleForTenant(tenant.id);
    const customers = await findCustomersDueForRevisit(tenant.id, { horizonDays: 7 });
    const inactive = await findCustomersDueForRevisit(tenant.id, { inactive: true });
    const candidates = [
      ...customers.map((customer) => ({ customer, mode: 'upcoming' })),
      ...inactive.map((customer) => ({ customer, mode: 'overdue' })),
    ];

    for (const { customer, mode } of candidates) {
      const eventType = mode === 'overdue' ? 'customer.revisit.overdue' : 'customer.revisit.upcoming';
      const existing = await prisma.notificationEvent.findFirst({
        where: {
          tenantId: tenant.id,
          eventType,
          status: { in: ['PENDING', 'QUEUED', 'SENT'] },
          payload: {
            path: ['customerId'],
            equals: customer.id,
          },
          createdAt: {
            gte: new Date(now.getTime() - 86400000),
          },
        },
      });

      if (existing) continue;

      await prisma.notificationEvent.create({
        data: {
          tenantId: tenant.id,
          eventType,
          channel: customer.phone ? 'WHATSAPP' : 'SMS',
          status: 'QUEUED',
          scheduledAt: now,
          payload: buildReminderPayload(customer, tenant, mode),
        },
      });
      queued += 1;
    }
  }

  return { tenants: tenants.length, queued };
}

export function startRevisitReminderScheduler() {
  const intervalMs = Number(process.env.REVISIT_REMINDER_INTERVAL_MS || 24 * 60 * 60 * 1000);

  const run = async () => {
    try {
      const result = await queueDailyRevisitReminders();
      console.log(`[Revisit Reminder] Queued ${result.queued} reminders across ${result.tenants} tenants.`);
    } catch (error) {
      console.error('[Revisit Reminder] Scheduler failed:', error.message);
    }
  };

  const now = new Date();
  const nextMidnight = new Date(now);
  nextMidnight.setHours(24, 0, 0, 0);
  const firstDelay = process.env.REVISIT_REMINDER_RUN_ON_START === 'true'
    ? 1000
    : Math.max(1000, nextMidnight.getTime() - now.getTime());

  setTimeout(() => {
    run();
    setInterval(run, intervalMs);
  }, firstDelay);
}
