import prisma from '../../../config/db.js';

export async function findActiveTemplates() {
  return prisma.websiteTemplate.findMany({
    where: { isActive: true },
    include: { defaultTheme: true }
  });
}

export async function findTemplateById(id) {
  return prisma.websiteTemplate.findFirst({
    where: { id, isActive: true },
    include: { defaultTheme: true }
  });
}

export async function selectTemplateForWebsite(tenantId, templateId) {
  const template = await prisma.websiteTemplate.findUnique({
    where: { id: templateId, isActive: true }
  });

  if (!template) {
    throw new Error('Template not found or inactive.');
  }

  return prisma.$transaction(async (tx) => {
    // 1. Get or create website
    let website = await tx.website.findUnique({
      where: { tenantId }
    });

    if (!website) {
      website = await tx.website.create({
        data: {
          tenantId,
          isActive: true,
          isPublished: false
        }
      });
    }

    // 2. Clean existing pages & sections
    const oldPages = await tx.websitePage.findMany({
      where: { websiteId: website.id },
      select: { id: true }
    });

    const oldPageIds = oldPages.map(p => p.id);

    if (oldPageIds.length > 0) {
      await tx.websiteSection.deleteMany({
        where: { pageId: { in: oldPageIds } }
      });
      await tx.websitePage.deleteMany({
        where: { id: { in: oldPageIds } }
      });
    }

    // 3. Populate new pages and sections from template layout JSON
    const templateLayout = template.layout || [];
    for (const pageData of templateLayout) {
      const createdPage = await tx.websitePage.create({
        data: {
          websiteId: website.id,
          title: pageData.title,
          slug: pageData.slug,
          isHome: pageData.isHome || false,
          sortOrder: pageData.sortOrder || 0,
          layout: pageData.sections || [],
          version: 1
        }
      });

      const sectionsData = pageData.sections || [];
      if (sectionsData.length > 0) {
        await tx.websiteSection.createMany({
          data: sectionsData.map((sec, index) => ({
            pageId: createdPage.id,
            sectionType: sec.sectionType,
            content: sec.content || {},
            settings: sec.settings || {},
            sortOrder: sec.sortOrder !== undefined ? sec.sortOrder : index,
            order: sec.order !== undefined ? sec.order : index,
            enabled: true,
            version: 1
          }))
        });
      }
    }

    // 4. Update website template mapping
    return tx.website.update({
      where: { id: website.id },
      data: {
        templateId: template.id,
        templateCode: template.category,
        themeId: template.defaultThemeId || undefined,
        themeCode: template.category // Default theme code matched to template category
      },
      include: {
        pages: {
          include: {
            sections: true
          }
        }
      }
    });
  });
}

// Super Admin CRUD
export async function createTemplate(data) {
  return prisma.websiteTemplate.create({
    data
  });
}

export async function updateTemplate(id, data) {
  return prisma.websiteTemplate.update({
    where: { id },
    data
  });
}

export async function deleteTemplate(id) {
  return prisma.websiteTemplate.delete({
    where: { id }
  });
}
