import prisma from '../../config/db.js';

function paymentInclude() {
  return {
    appointment: {
      include: {
        service: true,
        staff: true,
        customer: true,
      },
    },
    customer: true,
    tenant: true,
    timelineEvents: true,
  };
}

export async function findPaymentById(tenantId, paymentId) {
  return prisma.payment.findFirst({
    where: { id: paymentId, tenantId },
    include: paymentInclude(),
  });
}

export async function findPaymentByGatewayOrderId(tenantId, gatewayOrderId) {
  return prisma.payment.findFirst({
    where: { tenantId, gatewayOrderId },
    include: paymentInclude(),
  });
}

export async function findPendingPaymentForAppointment(tenantId, appointmentId) {
  return prisma.payment.findFirst({
    where: {
      tenantId,
      appointmentId,
      OR: [
        { paymentStatus: { in: ['PENDING', 'PARTIALLY_PAID'] } },
        { status: { in: ['PENDING', 'PARTIALLY_PAID'] } },
      ],
    },
    orderBy: {
      createdAt: 'desc',
    },
  });
}

export async function listPayments(tenantId, filters = {}) {
  const where = { tenantId };

  if (filters.paymentStatus) {
    where.paymentStatus = filters.paymentStatus;
  }

  if (filters.customerId) {
    where.customerId = filters.customerId;
  }

  if (filters.appointmentId) {
    where.appointmentId = filters.appointmentId;
  }

  if (filters.status) {
    where.status = filters.status;
  }

  return prisma.payment.findMany({
    where,
    include: paymentInclude(),
    orderBy: {
      createdAt: 'desc',
    },
  });
}

export async function createPayment(tenantId, data, txClient) {
  const db = txClient || prisma;

  return db.payment.create({
    data: {
      tenantId,
      appointmentId: data.appointmentId || null,
      customerId: data.customerId || null,
      amount: data.amount,
      paidAmount: data.paidAmount ?? 0,
      currency: data.currency || 'INR',
      status: data.status || 'PENDING',
      method: data.method || data.paymentMethod || 'CASH',
      paymentStatus: data.paymentStatus || data.status || 'PENDING',
      paymentMethod: data.paymentMethod || data.method || 'CASH',
      gateway: data.gateway || null,
      gatewayOrderId: data.gatewayOrderId || null,
      gatewayPaymentId: data.gatewayPaymentId || null,
      transactionRef: data.transactionRef || null,
      paidAt: data.paidAt || null,
    },
    include: paymentInclude(),
  });
}

export async function updatePayment(tenantId, paymentId, data, txClient) {
  const db = txClient || prisma;

  const existing = await db.payment.findFirst({
    where: {
      id: paymentId,
      tenantId,
    },
    select: {
      id: true,
    },
  });

  if (!existing) {
    throw new Error('Payment not found.');
  }

  return db.payment.update({
    where: {
      id: existing.id,
    },
    data,
    include: paymentInclude(),
  });
}

export async function createTimelineEvent(tenantId, data, txClient) {
  const db = txClient || prisma;

  return db.customerTimelineEvent.create({
    data: {
      tenantId,
      customerId: data.customerId,
      appointmentId: data.appointmentId || null,
      paymentId: data.paymentId || null,
      membershipId: data.membershipId || null,
      eventType: data.eventType,
      title: data.title,
      description: data.description || null,
      amount: data.amount || null,
      referenceId: data.referenceId || null,
      metadata: data.metadata || undefined,
      occurredAt: data.occurredAt || new Date(),
    },
  });
}

export async function findOrCreateLoyaltyAccount(tenantId, customerId, txClient) {
  const db = txClient || prisma;

  return db.loyaltyAccount.upsert({
    where: {
      tenantId_customerId: {
        tenantId,
        customerId,
      },
    },
    update: {},
    create: {
      tenantId,
      customerId,
    },
  });
}

export async function createLoyaltyTransaction(tenantId, data, txClient) {
  const db = txClient || prisma;

  return db.loyaltyTransaction.create({
    data: {
      tenantId,
      loyaltyAccountId: data.loyaltyAccountId,
      customerId: data.customerId,
      appointmentId: data.appointmentId || null,
      paymentId: data.paymentId || null,
      transactionType: data.transactionType,
      points: data.points,
      sourceAmount: data.sourceAmount || null,
      description: data.description || null,
      metadata: data.metadata || undefined,
    },
  });
}

export async function updateCustomerMetrics(tenantId, customerId, { totalSpendingDelta = 0, lastVisitAt = null }, txClient) {
  const db = txClient || prisma;

  const customer = await db.customer.findFirst({
    where: { tenantId, id: customerId },
  });

  if (!customer) {
    return null;
  }

  return db.customer.update({
    where: {
      id: customer.id,
    },
    data: {
      totalSpending: {
        increment: totalSpendingDelta,
      },
      ...(lastVisitAt ? { lastVisitAt } : {}),
    },
  });
}

export async function findAppointmentForPayment(tenantId, appointmentId) {
  return prisma.appointment.findFirst({
    where: { tenantId, id: appointmentId },
    include: {
      customer: true,
      staff: true,
      service: true,
      payments: true,
    },
  });
}

export async function listRecentPayments(tenantId, startDate, endDate) {
  return prisma.payment.findMany({
    where: {
      tenantId,
      OR: [
        {
          paidAt: {
            gte: startDate,
            lte: endDate,
          },
        },
        {
          createdAt: {
            gte: startDate,
            lte: endDate,
          },
          paymentStatus: 'PAID',
        },
      ],
    },
    include: paymentInclude(),
  });
}
