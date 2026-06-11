import prisma from '../../config/db.js';

/**
 * Fetch a website profile by tenant, including pages and sections.
 * 
 * @param {string} tenantId
 * @returns {Promise<Object|null>}
 */
export async function findWebsiteByTenant(tenantId) {
  return prisma.website.findFirst({
    where: { tenantId },
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

/**
 * Fetch a single page by ID.
 * 
 * @param {string} tenantId
 * @param {string} pageId
 * @returns {Promise<Object|null>}
 */
export async function findPageById(tenantId, pageId) {
  return prisma.websitePage.findFirst({
    where: {
      id: pageId,
      website: { tenantId },
    },
  });
}

/**
 * Fetch a single section by ID.
 * 
 * @param {string} tenantId
 * @param {string} sectionId
 * @returns {Promise<Object|null>}
 */
export async function findSectionById(tenantId, sectionId) {
  return prisma.websiteSection.findFirst({
    where: {
      id: sectionId,
      page: {
        website: { tenantId },
      },
    },
  });
}

/**
 * Updates template or theme configurations.
 * 
 * @param {string} tenantId
 * @param {Object} data
 * @returns {Promise<Object>}
 */
export async function updateWebsiteConfig(tenantId, data) {
  return prisma.website.update({
    where: { tenantId },
    data,
  });
}

/**
 * Updates a page layout array (draft) and increments the page version.
 * 
 * @param {string} tenantId
 * @param {string} pageId
 * @param {Array|Object} layout
 * @returns {Promise<Object>}
 */
export async function updatePageLayout(tenantId, pageId, layout) {
  return prisma.websitePage.update({
    where: {
      id: pageId,
      website: { tenantId },
    },
    data: {
      layout,
      version: { increment: 1 },
    },
  });
}

/**
 * Updates a specific section's properties (content, order, enabled) and increments version.
 * 
 * @param {string} tenantId
 * @param {string} sectionId
 * @param {Object} data
 * @returns {Promise<Object>}
 */
export async function updateSection(tenantId, sectionId, data) {
  const updateData = {};
  
  if (data.content !== undefined) updateData.content = data.content;
  if (data.settings !== undefined) updateData.settings = data.settings;
  if (data.order !== undefined) updateData.order = data.order;
  if (data.sortOrder !== undefined) updateData.sortOrder = data.sortOrder;
  if (data.enabled !== undefined) updateData.enabled = data.enabled;
  
  updateData.version = { increment: 1 };

  return prisma.websiteSection.update({
    where: {
      id: sectionId,
      page: {
        website: { tenantId },
      },
    },
    data: updateData,
  });
}

/**
 * Publishes the website by copying all draft contents into live published columns.
 * Runs in a transactional block to ensure atomic deployment.
 * 
 * @param {string} tenantId
 * @returns {Promise<Object>} Compiled published website
 */
export async function publishWebsite(tenantId) {
  const now = new Date();

  return prisma.$transaction(async (tx) => {
    // 1. Fetch website and pages
    const website = await tx.website.findUnique({
      where: { tenantId },
      include: {
        pages: {
          orderBy: [
            { sortOrder: 'asc' },
            { title: 'asc' },
          ],
          include: {
            sections: {
              orderBy: [
                { sortOrder: 'asc' },
                { order: 'asc' },
              ],
            },
          },
        },
      },
    });

    if (!website) {
      throw new Error('Website configurations not found for this tenant.');
    }

    // 2. Publish each page (copy layout to publishedLayout)
    for (const page of website.pages) {
      await tx.websitePage.update({
        where: { id: page.id },
        data: {
          publishedLayout: page.layout,
          isPublished: true,
          publishedAt: now,
          version: { increment: 1 },
        },
      });

      // 3. Publish each section of the page (copy content to publishedContent)
      for (const sec of page.sections) {
        await tx.websiteSection.update({
          where: { id: sec.id },
          data: {
            publishedContent: sec.content,
            publishedSettings: sec.settings,
            publishedEnabled: sec.enabled,
            version: { increment: 1 },
          },
        });
      }
    }

    // 4. Update website status
    return tx.website.update({
      where: { tenantId },
      data: {
        isPublished: true,
        publishedAt: now,
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
              orderBy: [
                { sortOrder: 'asc' },
                { order: 'asc' },
              ],
            },
          },
        },
      },
    });
  });
}

export async function createWebsiteVersion(websiteId, snapshot, publishedBy) {
  const latest = await prisma.websiteVersion.findFirst({
    where: { websiteId },
    orderBy: { version: 'desc' },
    select: { version: true },
  });

  const version = (latest?.version || 0) + 1;

  return prisma.websiteVersion.create({
    data: {
      websiteId,
      version,
      snapshot,
      publishedBy,
    },
  });
}
