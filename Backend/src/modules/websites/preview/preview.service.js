import prisma from '../../../config/db.js';
import { createPreviewToken } from '../engines/preview.engine.js';

export async function getPreviewToken(tenantId, userId) {
  const website = await prisma.website.findUnique({
    where: { tenantId }
  });

  if (!website) {
    throw new Error('Website not found.');
  }

  return createPreviewToken({
    websiteId: website.id,
    tenantId,
    userId
  });
}
