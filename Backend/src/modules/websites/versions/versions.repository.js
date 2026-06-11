import prisma from '../../../config/db.js';

export async function findVersionsByTenant(tenantId) {
  const website = await prisma.website.findUnique({
    where: { tenantId }
  });

  if (!website) {
    throw new Error('Website not found.');
  }

  return prisma.websiteVersion.findMany({
    where: { websiteId: website.id },
    orderBy: { version: 'desc' },
    select: {
      id: true,
      version: true,
      publishedBy: true,
      publishedAt: true
    }
  });
}

export async function findVersionById(tenantId, versionId) {
  return prisma.websiteVersion.findFirst({
    where: {
      id: versionId,
      website: { tenantId }
    }
  });
}

export async function restoreWebsiteSnapshot(tenantId, versionId) {
  const website = await prisma.website.findUnique({
    where: { tenantId }
  });

  if (!website) {
    throw new Error('Website not found.');
  }

  const version = await prisma.websiteVersion.findFirst({
    where: { id: versionId, websiteId: website.id }
  });

  if (!version) {
    throw new Error('Website version not found.');
  }

  const snapshot = version.snapshot;
  if (!snapshot || !snapshot.pages) {
    throw new Error('Invalid version snapshot.');
  }

  return prisma.$transaction(async (tx) => {
    // 1. Delete current pages and sections
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

    // 2. Recreate pages and sections from version snapshot
    for (const page of snapshot.pages) {
      const createdPage = await tx.websitePage.create({
        data: {
          id: page.id,
          websiteId: website.id,
          title: page.title,
          slug: page.slug,
          isHome: page.isHome || false,
          sortOrder: page.sortOrder || 0,
          layout: page.layout || [],
          seoTitle: page.seo?.title || null,
          seoDescription: page.seo?.description || null,
          seoKeywords: page.seo?.keywords || null,
          ogImage: page.seo?.ogImage || null,
          version: 1
        }
      });

      const sections = page.sections || [];
      if (sections.length > 0) {
        await tx.websiteSection.createMany({
          data: sections.map((sec, idx) => ({
            id: sec.id,
            pageId: createdPage.id,
            sectionType: sec.sectionType,
            content: sec.content || {},
            settings: sec.settings || {},
            sortOrder: sec.sortOrder !== undefined ? sec.sortOrder : idx,
            order: sec.order !== undefined ? sec.order : idx,
            enabled: true,
            version: 1
          }))
        });
      }
    }

    // 3. Re-align website config
    return tx.website.update({
      where: { id: website.id },
      data: {
        templateCode: snapshot.website?.templateCode || website.templateCode,
        themeCode: snapshot.website?.themeCode || website.themeCode,
        templateId: snapshot.website?.templateId || website.templateId,
        themeId: snapshot.website?.themeId || website.themeId
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
