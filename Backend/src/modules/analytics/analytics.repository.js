import prisma from '../../config/db.js';

function getUtcDayBounds(date = new Date()) {
  const start = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), 0, 0, 0));
  const end = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), 23, 59, 59, 999));
  return { start, end };
}

/**
 * Fetch total payment earnings (Paid status) scoped by tenant across different date intervals.
 * 
 * @param {string} tenantId
 * @returns {Promise<Object>} Object with { today, week, month, year }
 */
export async function getEarningsSummary(tenantId) {
  const now = new Date();
  
  // Date boundary calculations (UTC-based)
  const startOfToday = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 0, 0, 0));
  
  const dayOfWeek = now.getUTCDay();
  const startOfWeek = new Date(startOfToday.getTime() - dayOfWeek * 24 * 60 * 60 * 1000);
  
  const startOfMonth = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1, 0, 0, 0));
  const startOfYear = new Date(Date.UTC(now.getUTCFullYear(), 0, 1, 0, 0, 0));

  const queryPaymentSum = async (startDate) => {
    const agg = await prisma.payment.aggregate({
      _sum: {
        amount: true,
      },
      where: {
        tenantId,
        AND: [
          {
            OR: [
              { paymentStatus: 'PAID' },
              { status: 'PAID' },
            ],
          },
          {
            OR: [
              { paidAt: { gte: startDate } },
              { createdAt: { gte: startDate } },
            ],
          },
        ],
      },
    });
    return agg._sum.amount || 0.00;
  };

  const [today, week, month, year] = await Promise.all([
    queryPaymentSum(startOfToday),
    queryPaymentSum(startOfWeek),
    queryPaymentSum(startOfMonth),
    queryPaymentSum(startOfYear),
  ]);

  return { today, week, month, year };
}

/**
 * Fetch appointments counts by status and a 30-day booking trend count.
 * 
 * @param {string} tenantId
 * @returns {Promise<Object>} Object containing status counts and trend array
 */
export async function getAppointmentsSummary(tenantId) {
  // 1. Group bookings by status
  const statusGroups = await prisma.appointment.groupBy({
    by: ['status'],
    _count: {
      id: true,
    },
    where: {
      tenantId,
    },
  });

  const statusCounts = {
    total: 0,
    PENDING: 0,
    CONFIRMED: 0,
    COMPLETED: 0,
    CANCELLED: 0,
    NO_SHOW: 0,
  };

  statusGroups.forEach(group => {
    statusCounts[group.status] = group._count.id;
    statusCounts.total += group._count.id;
  });

  // 2. Compute 30-day booking trend
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setUTCDate(thirtyDaysAgo.getUTCDate() - 30);
  thirtyDaysAgo.setUTCHours(0, 0, 0, 0);

  const recentAppointments = await prisma.appointment.findMany({
    where: {
      tenantId,
      createdAt: {
        gte: thirtyDaysAgo,
      },
    },
    select: {
      createdAt: true,
    },
    orderBy: {
      createdAt: 'asc',
    },
  });

  // Map to date strings
  const trendMap = {};
  for (let i = 0; i < 30; i++) {
    const date = new Date(thirtyDaysAgo.getTime() + i * 24 * 60 * 60 * 1000);
    const dateStr = date.toISOString().split('T')[0];
    trendMap[dateStr] = 0;
  }

  recentAppointments.forEach(app => {
    const dateStr = app.createdAt.toISOString().split('T')[0];
    if (trendMap[dateStr] !== undefined) {
      trendMap[dateStr]++;
    }
  });

  const trend = Object.entries(trendMap).map(([date, count]) => ({
    date,
    count,
  }));

  return {
    statusCounts,
    trend,
  };
}

/**
 * Fetch counts of customers divided by CRM segments (New, Returning, VIP, Inactive).
 * 
 * @param {string} tenantId
 * @param {number} inactiveDaysThreshold - e.g. 90
 * @returns {Promise<Object>}
 */
export async function getCustomerSummary(tenantId, inactiveDaysThreshold = 90) {
  const now = new Date();
  
  // New: registered in the last 30 days
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setUTCDate(thirtyDaysAgo.getUTCDate() - 30);

  // Inactive: last visit older than threshold
  const inactiveCutoff = new Date();
  inactiveCutoff.setUTCDate(inactiveCutoff.getUTCDate() - inactiveDaysThreshold);

  const [total, newCount, vipCount, inactiveCount] = await Promise.all([
    // Total
    prisma.customer.count({ where: { tenantId } }),
    // New
    prisma.customer.count({
      where: {
        tenantId,
        createdAt: { gte: thirtyDaysAgo },
      },
    }),
    // VIP (has tag 'vip')
    prisma.customer.count({
      where: {
        tenantId,
        tags: { has: 'vip' },
      },
    }),
    // Inactive
    prisma.customer.count({
      where: {
        tenantId,
        lastVisitAt: { lt: inactiveCutoff },
      },
    }),
  ]);

  // Returning is calculated as customers who have visited at least once and are not "new"
  const returningCount = await prisma.customer.count({
    where: {
      tenantId,
      lastVisitAt: { not: null },
      createdAt: { lt: thirtyDaysAgo },
    },
  });

  return {
    total,
    new: newCount,
    returning: returningCount,
    vip: vipCount,
    inactive: inactiveCount,
  };
}

/**
 * Fetch service rankings by booking counts and total earnings generated.
 * 
 * @param {string} tenantId
 * @returns {Promise<Array>}
 */
export async function getServicePerformance(tenantId) {
  // Query all appointments with payments
  const appointments = await prisma.appointment.findMany({
    where: {
      tenantId,
      status: 'COMPLETED',
    },
      include: {
        service: true,
        payments: {
          where: {
            OR: [
              { paymentStatus: 'PAID' },
              { status: 'PAID' },
            ],
          },
        },
      },
    });

  const performanceMap = {};

  appointments.forEach(app => {
    const service = app.service;
    if (!performanceMap[service.id]) {
      performanceMap[service.id] = {
        service: service.name,
        bookings: 0,
        revenue: 0.00,
      };
    }

    performanceMap[service.id].bookings++;
    const paidAmount = app.payments.reduce((sum, p) => sum + Number(p.amount), 0);
    performanceMap[service.id].revenue += paidAmount;
  });

  // Convert to array and sort by bookings desc
  return Object.values(performanceMap).sort((a, b) => b.bookings - a.bookings);
}

/**
 * Queries staff schedules, breaks, and appointments to compute workload metrics.
 * 
 * @param {string} tenantId
 * @returns {Promise<Array>}
 */
export async function getStaffWorkloadData(tenantId) {
  // Fetch active staff, schedules, breaks, and completed/confirmed bookings
  return prisma.staff.findMany({
    where: {
      tenantId,
      isActive: true,
    },
    include: {
      schedules: {
        include: {
          breaks: true,
        },
      },
      appointments: {
        where: {
          status: { in: ['COMPLETED', 'CONFIRMED'] },
        },
        include: {
          service: true,
          payments: {
            where: {
              OR: [
                { paymentStatus: 'PAID' },
                { status: 'PAID' },
              ],
            },
          },
        },
      },
    },
  });
}

/**
 * Today's salon activity snapshot.
 *
 * @param {string} tenantId
 * @returns {Promise<Object>}
 */
export async function getTodaySnapshot(tenantId) {
  const { start, end } = getUtcDayBounds();

  const [bookings, customers, earnings] = await Promise.all([
    prisma.appointment.count({
      where: {
        tenantId,
        startTime: { gte: start, lte: end },
      },
    }),
    prisma.customer.findMany({
      where: {
        tenantId,
        OR: [
          { createdAt: { gte: start, lte: end } },
          {
            appointments: {
              some: {
                startTime: { gte: start, lte: end },
              },
            },
          },
        ],
      },
      select: { id: true },
      distinct: ['id'],
    }),
    prisma.payment.aggregate({
      _sum: { amount: true },
      where: {
        tenantId,
        AND: [
          {
            OR: [
              { paymentStatus: 'PAID' },
              { status: 'PAID' },
            ],
          },
          {
            OR: [
              { paidAt: { gte: start, lte: end } },
              { createdAt: { gte: start, lte: end } },
            ],
          },
        ],
      },
    }),
  ]);

  return {
    bookings,
    customers: customers.length,
    earnings: earnings._sum.amount || 0,
  };
}

/**
 * Revenue series for a rolling window.
 *
 * @param {string} tenantId
 * @param {number} days
 * @returns {Promise<Array<{date: string, revenue: number}>>}
 */
export async function getRevenueSeries(tenantId, days = 7) {
  const now = new Date();
  const start = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 0, 0, 0));
  start.setUTCDate(start.getUTCDate() - (days - 1));

  const payments = await prisma.payment.findMany({
    where: {
      tenantId,
      AND: [
        {
          OR: [
            { paymentStatus: 'PAID' },
            { status: 'PAID' },
          ],
        },
        {
          OR: [
            { paidAt: { gte: start } },
            { createdAt: { gte: start } },
          ],
        },
      ],
    },
    select: {
      amount: true,
      paidAt: true,
      createdAt: true,
    },
  });

  const bucket = {};
  for (let i = 0; i < days; i++) {
    const date = new Date(start.getTime() + i * 24 * 60 * 60 * 1000);
    bucket[date.toISOString().split('T')[0]] = 0;
  }

  payments.forEach((payment) => {
    const date = (payment.paidAt || payment.createdAt).toISOString().split('T')[0];
    if (bucket[date] !== undefined) {
      bucket[date] += Number(payment.amount);
    }
  });

  return Object.entries(bucket).map(([date, revenue]) => ({
    date,
    revenue,
  }));
}

/**
 * Top services by revenue and bookings.
 *
 * @param {string} tenantId
 * @param {number} limit
 * @returns {Promise<Array>}
 */
export async function getTopServices(tenantId, limit = 5) {
  const appointments = await prisma.appointment.findMany({
    where: {
      tenantId,
      status: { in: ['COMPLETED', 'CONFIRMED'] },
    },
    include: {
      service: true,
      payments: {
        where: {
          OR: [
            { paymentStatus: 'PAID' },
            { status: 'PAID' },
          ],
        },
      },
    },
  });

  const map = {};

  appointments.forEach((appointment) => {
    const serviceId = appointment.service.id;
    if (!map[serviceId]) {
      map[serviceId] = {
        serviceId,
        service: appointment.service.name,
        bookings: 0,
        revenue: 0,
      };
    }

    map[serviceId].bookings += 1;
    map[serviceId].revenue += appointment.payments.reduce((sum, payment) => sum + Number(payment.amount), 0);
  });

  return Object.values(map)
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, limit);
}

/**
 * Top staff by bookings and revenue.
 *
 * @param {string} tenantId
 * @param {number} limit
 * @returns {Promise<Array>}
 */
export async function getTopStaff(tenantId, limit = 5) {
  const staffList = await prisma.staff.findMany({
    where: {
      tenantId,
      isActive: true,
    },
    include: {
      appointments: {
        where: {
          status: { in: ['COMPLETED', 'CONFIRMED'] },
        },
        include: {
          payments: {
            where: {
              OR: [
                { paymentStatus: 'PAID' },
                { status: 'PAID' },
              ],
            },
          },
        },
      },
    },
  });

  return staffList
    .map((staff) => ({
      staffId: staff.id,
      staff: staff.name,
      bookings: staff.appointments.length,
      revenue: staff.appointments.reduce((sum, appointment) => (
        sum + appointment.payments.reduce((paymentSum, payment) => paymentSum + Number(payment.amount), 0)
      ), 0),
    }))
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, limit);
}
