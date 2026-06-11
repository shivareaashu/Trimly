import prisma from '../../config/db.js';

/**
 * Fetch the published website configurations for a tenant.
 * Filters out unpublished pages and disabled sections.
 * 
 * @param {string} tenantId
 * @returns {Promise<Object|null>}
 */
export async function findPublishedWebsite(tenantId) {
  return prisma.website.findFirst({
    where: {
      tenantId,
      isPublished: true,
      isActive: true,
    },
    include: {
      bookingSettings: true,
      theme: true,
      template: true,
      pages: {
        where: {
          isPublished: true,
        },
        orderBy: [
          { sortOrder: 'asc' },
          { title: 'asc' },
        ],
        include: {
          sections: {
            where: {
              publishedEnabled: true,
            },
            orderBy: [
              { sortOrder: 'asc' },
              { order: 'asc' },
            ],
          },
        },
      },
    },
  });
}

export async function findPreviewWebsite({ tenantId, websiteId }) {
  return prisma.website.findFirst({
    where: {
      id: websiteId,
      tenantId,
      isActive: true,
    },
    include: {
      bookingSettings: true,
      theme: true,
      template: true,
      pages: {
        orderBy: [
          { sortOrder: 'asc' },
          { title: 'asc' },
        ],
        include: {
          sections: {
            where: {
              enabled: true,
            },
            orderBy: [
              { sortOrder: 'asc' },
              { order: 'asc' },
            ],
          },
        },
      },
    },
  });
}

export default {
  findPublishedWebsite,
  findPreviewWebsite,
};
