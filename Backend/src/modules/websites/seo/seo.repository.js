import prisma from '../../../config/db.js';

export async function getPageSeo(tenantId, pageId) {
  const page = await prisma.websitePage.findFirst({
    where: {
      id: pageId,
      website: { tenantId }
    },
    select: {
      seoTitle: true,
      seoDescription: true,
      seoKeywords: true,
      ogImage: true
    }
  });

  if (!page) {
    throw new Error('Page not found.');
  }

  return {
    title: page.seoTitle || '',
    description: page.seoDescription || '',
    keywords: page.seoKeywords || '',
    ogImageId: page.ogImage || ''
  };
}

export async function updatePageSeo(tenantId, pageId, seoData) {
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
      seoTitle: seoData.title !== undefined ? seoData.title : undefined,
      seoDescription: seoData.description !== undefined ? seoData.description : undefined,
      seoKeywords: seoData.keywords !== undefined ? seoData.keywords : undefined,
      ogImage: seoData.ogImageId !== undefined ? seoData.ogImageId : undefined,
      version: { increment: 1 }
    }
  });
}
