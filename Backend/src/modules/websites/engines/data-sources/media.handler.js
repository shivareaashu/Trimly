import prisma from '../../../../config/db.js';

export async function resolveMedia({ tenantId, config = {} }) {
  if (!prisma.mediaAsset) {
    return [];
  }

  const ids = config.ids || config.imageIds || [];

  return prisma.mediaAsset.findMany({
    where: {
      tenantId,
      id: ids.length ? { in: ids } : undefined,
      type: config.type || undefined,
    },
    orderBy: {
      createdAt: 'desc',
    },
    take: ids.length ? undefined : Number(config.limit || 12),
  });
}
