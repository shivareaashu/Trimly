import prisma from '../../../config/db.js';

export async function findPagesByTenant(tenantId) {
  const website = await prisma.website.findUnique({
    where: { tenantId }
  });

  if (!website) {
    throw new Error('Website not found.');
  }

  return prisma.websitePage.findMany({
    where: { websiteId: website.id },
    orderBy: { sortOrder: 'asc' },
    include: {
      sections: {
        orderBy: { sortOrder: 'asc' }
      }
    }
  });
}

export async function createPage(tenantId, pageData) {
  const website = await prisma.website.findUnique({
    where: { tenantId }
  });

  if (!website) {
    throw new Error('Website not found.');
  }

  // Count to calculate default sort order
  const count = await prisma.websitePage.count({
    where: { websiteId: website.id }
  });

  return prisma.websitePage.create({
    data: {
      websiteId: website.id,
      title: pageData.title,
      slug: pageData.slug || pageData.title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      isHome: pageData.isHome || false,
      sortOrder: pageData.sortOrder !== undefined ? pageData.sortOrder : count,
      layout: pageData.layout || [],
      version: 1
    }
  });
}

export async function updatePage(tenantId, pageId, pageData) {
  const page = await prisma.websitePage.findFirst({
    where: {
      id: pageId,
      website: { tenantId }
    }
  });

  if (!page) {
    throw new Error('Page not found.');
  }

  return prisma.websitePage.update({
    where: { id: pageId },
    data: {
      title: pageData.title !== undefined ? pageData.title : undefined,
      slug: pageData.slug !== undefined ? pageData.slug : undefined,
      isHome: pageData.isHome !== undefined ? pageData.isHome : undefined,
      sortOrder: pageData.sortOrder !== undefined ? pageData.sortOrder : undefined,
      layout: pageData.layout !== undefined ? pageData.layout : undefined,
      version: { increment: 1 }
    }
  });
}

export async function deletePage(tenantId, pageId) {
  const page = await prisma.websitePage.findFirst({
    where: {
      id: pageId,
      website: { tenantId }
    }
  });

  if (!page) {
    throw new Error('Page not found.');
  }

  return prisma.websitePage.delete({
    where: { id: pageId }
  });
}

export async function reorderPages(tenantId, reorderList) {
  const website = await prisma.website.findUnique({
    where: { tenantId }
  });

  if (!website) {
    throw new Error('Website not found.');
  }

  return prisma.$transaction(
    reorderList.map((item) =>
      prisma.websitePage.update({
        where: { id: item.id, websiteId: website.id },
        data: { sortOrder: item.sortOrder }
      })
    )
  );
}
