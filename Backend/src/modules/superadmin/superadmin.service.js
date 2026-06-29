import prisma from '../../config/db.js';

export async function getPlatformStats() {
  const [
    totalTenants,
    activeTenants,
    trialTenants,
    canceledTenants,
    totalBookings,
    revenueAgg,
    usersCount
  ] = await Promise.all([
    prisma.tenant.count(),
    prisma.tenant.count({ where: { subscriptionStatus: 'ACTIVE' } }),
    prisma.tenant.count({ where: { subscriptionStatus: 'TRIAL' } }),
    prisma.tenant.count({ where: { subscriptionStatus: { in: ['CANCELED', 'PAST_DUE'] } } }),
    prisma.appointment.count(),
    prisma.payment.aggregate({
      _sum: { amount: true },
      where: { paymentStatus: 'PAID' }
    }),
    prisma.user.count()
  ]);

  const totalRevenue = Number(revenueAgg._sum.amount || 0.00);

  return {
    totalTenants,
    activeTenants,
    trialTenants,
    canceledTenants,
    totalBookings,
    totalRevenue,
    usersCount,
    systemHealth: 'HEALTHY'
  };
}

export async function listTenants() {
  const tenants = await prisma.tenant.findMany({
    include: {
      plan: true,
      _count: {
        select: {
          members: true,
          appointments: true
        }
      }
    },
    orderBy: { createdAt: 'desc' }
  });

  return tenants.map(t => ({
    id: t.id,
    name: t.name,
    slug: t.slug,
    planName: t.plan?.name || 'Unknown',
    subscriptionStatus: t.subscriptionStatus,
    trialEndsAt: t.trialEndsAt,
    usersCount: t._count.members,
    bookingsCount: t._count.appointments,
    createdAt: t.createdAt
  }));
}

export async function approveTenant(tenantId) {
  const tenant = await prisma.tenant.findUnique({
    where: { id: tenantId }
  });

  if (!tenant) {
    throw new Error('Tenant not found.');
  }

  return prisma.tenant.update({
    where: { id: tenantId },
    data: {
      subscriptionStatus: 'ACTIVE',
      trialEndsAt: null
    }
  });
}

export async function listPlans() {
  return prisma.plan.findMany({
    orderBy: { priceMonthly: 'asc' }
  });
}
