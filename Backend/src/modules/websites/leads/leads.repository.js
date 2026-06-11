import prisma from '../../../config/db.js';

export async function findLeadsByTenant(tenantId) {
  return prisma.websiteLead.findMany({
    where: { tenantId },
    orderBy: { createdAt: 'desc' },
    include: {
      page: true,
      submissions: {
        orderBy: { createdAt: 'desc' }
      }
    }
  });
}

export async function findLeadById(tenantId, id) {
  return prisma.websiteLead.findFirst({
    where: { id, tenantId },
    include: {
      page: true,
      submissions: {
        orderBy: { createdAt: 'desc' }
      }
    }
  });
}

export async function updateLeadStatus(tenantId, id, status) {
  const lead = await prisma.websiteLead.findFirst({
    where: { id, tenantId }
  });

  if (!lead) {
    throw new Error('Lead not found.');
  }

  return prisma.websiteLead.update({
    where: { id },
    data: { status }
  });
}
