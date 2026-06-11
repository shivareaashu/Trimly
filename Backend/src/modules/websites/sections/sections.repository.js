import prisma from '../../../config/db.js';

export async function findSectionsByPage(tenantId, pageId) {
  const page = await prisma.websitePage.findFirst({
    where: {
      id: pageId,
      website: { tenantId }
    }
  });

  if (!page) {
    throw new Error('Page not found.');
  }

  return prisma.websiteSection.findMany({
    where: { pageId },
    orderBy: { sortOrder: 'asc' }
  });
}

export async function createSection(tenantId, sectionData) {
  const page = await prisma.websitePage.findFirst({
    where: {
      id: sectionData.pageId,
      website: { tenantId }
    }
  });

  if (!page) {
    throw new Error('Page not found.');
  }

  const count = await prisma.websiteSection.count({
    where: { pageId: sectionData.pageId }
  });

  return prisma.websiteSection.create({
    data: {
      pageId: sectionData.pageId,
      sectionType: sectionData.sectionType,
      content: sectionData.content || {},
      settings: sectionData.settings || {},
      sortOrder: sectionData.sortOrder !== undefined ? sectionData.sortOrder : count,
      order: sectionData.sortOrder !== undefined ? sectionData.sortOrder : count,
      enabled: sectionData.enabled !== undefined ? sectionData.enabled : true,
      version: 1
    }
  });
}

export async function updateSection(tenantId, sectionId, sectionData) {
  const section = await prisma.websiteSection.findFirst({
    where: {
      id: sectionId,
      page: {
        website: { tenantId }
      }
    }
  });

  if (!section) {
    throw new Error('Section not found.');
  }

  const data = {};
  if (sectionData.content !== undefined) data.content = sectionData.content;
  if (sectionData.settings !== undefined) data.settings = sectionData.settings;
  if (sectionData.sortOrder !== undefined) {
    data.sortOrder = sectionData.sortOrder;
    data.order = sectionData.sortOrder;
  }
  if (sectionData.enabled !== undefined) data.enabled = sectionData.enabled;
  data.version = { increment: 1 };

  return prisma.websiteSection.update({
    where: { id: sectionId },
    data
  });
}

export async function deleteSection(tenantId, sectionId) {
  const section = await prisma.websiteSection.findFirst({
    where: {
      id: sectionId,
      page: {
        website: { tenantId }
      }
    }
  });

  if (!section) {
    throw new Error('Section not found.');
  }

  return prisma.websiteSection.delete({
    where: { id: sectionId }
  });
}

export async function reorderSections(tenantId, reorderList) {
  // Check if sections belong to tenant
  if (reorderList.length === 0) return [];

  const sectionIds = reorderList.map(item => item.id);
  const sections = await prisma.websiteSection.findMany({
    where: {
      id: { in: sectionIds },
      page: {
        website: { tenantId }
      }
    },
    select: { id: true }
  });

  const validIds = new Set(sections.map(s => s.id));
  const updates = reorderList
    .filter(item => validIds.has(item.id))
    .map(item =>
      prisma.websiteSection.update({
        where: { id: item.id },
        data: {
          sortOrder: item.sortOrder,
          order: item.sortOrder
        }
      })
    );

  return prisma.$transaction(updates);
}
