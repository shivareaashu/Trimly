import prisma from '../../../config/db.js';

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
          { title: 'asc' }
        ],
        include: {
          sections: {
            orderBy: [
              { sortOrder: 'asc' },
              { order: 'asc' }
            ]
          }
        }
      }
    }
  });
}

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
            { title: 'asc' }
          ],
          include: {
            sections: {
              orderBy: [
                { sortOrder: 'asc' },
                { order: 'asc' }
              ]
            }
          }
        }
      }
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
          version: { increment: 1 }
        }
      });

      // 3. Publish each section of the page (copy content to publishedContent)
      for (const sec of page.sections) {
        await tx.websiteSection.update({
          where: { id: sec.id },
          data: {
            publishedContent: sec.content,
            publishedSettings: sec.settings,
            publishedEnabled: sec.enabled,
            version: { increment: 1 }
          }
        });
      }
    }

    // 4. Update website status
    return tx.website.update({
      where: { tenantId },
      data: {
        isPublished: true,
        publishedAt: now
      },
      include: {
        bookingSettings: true,
        theme: true,
        template: true,
        pages: {
          orderBy: [
            { sortOrder: 'asc' },
            { title: 'asc' }
          ],
          include: {
            sections: {
              orderBy: [
                { sortOrder: 'asc' },
                { order: 'asc' }
              ]
            }
          }
        }
      }
    });
  });
}

export async function createWebsiteVersion(websiteId, snapshot, publishedBy) {
  const latest = await prisma.websiteVersion.findFirst({
    where: { websiteId },
    orderBy: { version: 'desc' },
    select: { version: true }
  });

  const version = (latest?.version || 0) + 1;

  return prisma.websiteVersion.create({
    data: {
      websiteId,
      version,
      snapshot,
      publishedBy
    }
  });
}
