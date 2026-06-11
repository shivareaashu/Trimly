import prisma from '../../config/db.js';

/**
 * Lists customers for a tenant with filters (search name/email/phone, tags) and sorting.
 * 
 * @param {string} tenantId
 * @param {Object} [filters]
 * @param {string} [filters.search] - Query to search first/last name, email, or phone
 * @param {string} [filters.tag] - Filter by specific tag
 * @param {string} [filters.sortBy] - totalSpending, lastVisitAt, createdAt
 * @param {string} [filters.sortOrder] - asc, desc
 * @returns {Promise<Array>}
 */
export async function findCustomers(tenantId, filters = {}) {
  const { search, tag, lifecycleStatus, sortBy = 'createdAt', sortOrder = 'desc' } = filters;
  
  const where = { tenantId };

  if (search) {
    where.OR = [
      { firstName: { contains: search, mode: 'insensitive' } },
      { lastName: { contains: search, mode: 'insensitive' } },
      { email: { contains: search, mode: 'insensitive' } },
      { phone: { contains: search, mode: 'insensitive' } },
    ];
  }

  if (tag) {
    where.tags = {
      has: tag, // Postgres string array check
    };
  }

  if (lifecycleStatus) {
    where.lifecycleStatus = lifecycleStatus;
  }

  return prisma.customer.findMany({
    where,
    orderBy: {
      [sortBy]: sortOrder,
    },
  });
}

export async function findCustomersDueForRevisit(tenantId, filters = {}) {
  const now = new Date();
  const horizonDays = filters.horizonDays === undefined ? 30 : Number(filters.horizonDays);
  const where = {
    tenantId,
    lastVisitAt: { not: null },
  };

  if (filters.lifecycleStatus) {
    where.lifecycleStatus = filters.lifecycleStatus;
  }

  const customers = await prisma.customer.findMany({
    where,
    include: {
      appointments: {
        where: { status: { in: ['COMPLETED', 'BILLED', 'PAID'] } },
        include: { service: true },
        orderBy: { startTime: 'desc' },
        take: 1,
      },
    },
    orderBy: { lastVisitAt: 'desc' },
  });

  return customers
    .map((customer) => {
      const lastVisit = customer.lastVisitAt ? new Date(customer.lastVisitAt) : null;
      const expected = customer.expectedRevisitDays || 30;
      const daysSinceLastVisit = lastVisit ? Math.floor((now - lastVisit) / 86400000) : null;
      const daysUntilDue = daysSinceLastVisit === null ? null : expected - daysSinceLastVisit;
      const recommendedService = customer.appointments?.[0]?.service || null;
      return {
        ...customer,
        daysSinceLastVisit,
        daysUntilDue,
        expectedRevisitAt: lastVisit ? new Date(lastVisit.getTime() + expected * 86400000) : null,
        recommendedService,
      };
    })
    .filter((customer) => {
      if (filters.inactive) return customer.lifecycleStatus === 'INACTIVE';
      if (customer.daysUntilDue === null) return false;
      return customer.daysUntilDue <= horizonDays;
    })
    .sort((a, b) => (a.daysUntilDue ?? 9999) - (b.daysUntilDue ?? 9999));
}

/**
 * Finds a customer profile by ID.
 * 
 * @param {string} tenantId
 * @param {string} customerId
 * @returns {Promise<Object|null>}
 */
export async function findCustomerById(tenantId, customerId) {
  return prisma.customer.findFirst({
    where: { id: customerId, tenantId },
  });
}

/**
 * Finds a customer profile along with their full appointment history.
 * 
 * @param {string} tenantId
 * @param {string} customerId
 * @returns {Promise<Object|null>}
 */
export async function findCustomerWithVisitHistory(tenantId, customerId) {
  return prisma.customer.findFirst({
    where: { id: customerId, tenantId },
    include: {
      appointments: {
        include: {
          service: true,
          staff: true,
          payments: true,
        },
        orderBy: {
          startTime: 'desc',
        },
      },
    },
  });
}

/**
 * Creates a new customer record.
 * 
 * @param {string} tenantId
 * @param {Object} data
 * @returns {Promise<Object>}
 */
export async function createCustomer(tenantId, data) {
  return prisma.customer.create({
    data: {
      tenantId,
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email || null,
      phone: data.phone || null,
      notes: data.notes || null,
      tags: data.tags || [],
    },
  });
}

/**
 * Updates a customer record.
 * 
 * @param {string} tenantId
 * @param {string} customerId
 * @param {Object} data
 * @returns {Promise<Object>}
 */
export async function updateCustomer(tenantId, customerId, data) {
  const existing = await prisma.customer.findFirst({
    where: { id: customerId, tenantId },
    select: { id: true },
  });

  if (!existing) {
    throw new Error('Customer not found.');
  }

  return prisma.customer.update({
    where: { id: existing.id },
    data,
  });
}

/**
 * Aggregates database records to calculate total spending and last visit.
 * 
 * @param {string} tenantId
 * @param {string} customerId
 * @returns {Promise<Object>} Object with { totalSpending: Decimal, lastVisitAt: Date|null }
 */
export async function calculateCustomerMetricsFromDb(tenantId, customerId) {
  // 1. Calculate sum of all successful payments for the customer
  const paymentsAgg = await prisma.payment.aggregate({
    _sum: {
      amount: true,
    },
    where: {
      tenantId,
      OR: [
        { status: 'PAID' },
        { paymentStatus: 'PAID' },
      ],
      appointment: {
        customerId: customerId,
      },
    },
  });

  const totalSpending = paymentsAgg._sum.amount || 0.00;

  // 2. Fetch the latest completed appointment start time
  const latestAppointment = await prisma.appointment.findFirst({
    where: {
      tenantId,
      customerId,
      status: 'COMPLETED',
    },
    orderBy: {
      startTime: 'desc',
    },
    include: { service: true },
  });

  return {
    totalSpending,
    lastVisitAt: latestAppointment?.startTime || null,
    expectedRevisitDays: latestAppointment?.service?.revisitAfterDays || 30,
  };
}
