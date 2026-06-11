import prisma from '../../../../config/db.js';

export async function resolveServices({ tenantId, config = {} }) {
  return prisma.service.findMany({
    where: {
      tenantId,
      isActive: true,
      categoryId: config.categoryId || undefined,
    },
    select: {
      id: true,
      name: true,
      description: true,
      price: true,
      duration: true,
      bufferTime: true,
      category: {
        select: {
          id: true,
          name: true,
        },
      },
    },
    orderBy: {
      name: 'asc',
    },
    take: Number(config.limit || 8),
  });
}
