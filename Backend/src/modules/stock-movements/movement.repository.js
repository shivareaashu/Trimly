import prisma from '../../config/db.js';

export async function findMovements(tenantId, filters = {}) {
  const where = { tenantId };

  if (filters.branchId) {
    where.branchId = filters.branchId;
  }
  if (filters.itemId) {
    where.itemId = filters.itemId;
  }
  if (filters.type) {
    where.type = filters.type;
  }

  return prisma.stockMovement.findMany({
    where,
    include: {
      item: {
        select: {
          name: true,
          sku: true,
          unit: true,
        },
      },
      branch: {
        select: {
          name: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });
}

export async function findMovementById(tenantId, id) {
  return prisma.stockMovement.findFirst({
    where: { id, tenantId },
    include: {
      item: true,
      branch: true,
    },
  });
}
