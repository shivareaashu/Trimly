import prisma from '../../../../config/db.js';

export async function resolveBranches({ tenantId, config = {} }) {
  return prisma.branch.findMany({
    where: {
      tenantId,
    },
    select: {
      id: true,
      name: true,
      code: true,
      phone: true,
      address: true,
    },
    orderBy: {
      name: 'asc',
    },
    take: Number(config.limit || 6),
  });
}
