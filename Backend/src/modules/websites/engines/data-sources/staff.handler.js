import prisma from '../../../../config/db.js';

export async function resolveStaff({ tenantId, config = {} }) {
  return prisma.staff.findMany({
    where: {
      tenantId,
      isActive: true,
      branchId: config.branchId || undefined,
    },
    select: {
      id: true,
      name: true,
      bio: true,
      branch: {
        select: {
          id: true,
          name: true,
        },
      },
      services: {
        select: {
          service: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      },
    },
    orderBy: {
      name: 'asc',
    },
    take: Number(config.limit || 6),
  });
}
