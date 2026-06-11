import prisma from '../../../config/db.js';

export async function findThemes() {
  return prisma.websiteTheme.findMany({
    where: { isActive: true }
  });
}

export async function updateWebsiteTheme(tenantId, { themeId, themeCode, tokens }) {
  const website = await prisma.website.findUnique({
    where: { tenantId }
  });

  if (!website) {
    throw new Error('Website not found.');
  }

  return prisma.$transaction(async (tx) => {
    // 1. Update Website theme links
    const updatedWebsite = await tx.website.update({
      where: { id: website.id },
      data: {
        themeId: themeId || undefined,
        themeCode: themeCode || undefined
      }
    });

    // 2. Manage Theme Override
    if (tokens && Object.keys(tokens).length > 0) {
      await tx.websiteThemeOverride.upsert({
        where: { websiteId: website.id },
        update: { tokens },
        create: {
          websiteId: website.id,
          tokens
        }
      });
    } else {
      // Clean up override if tokens are cleared
      try {
        await tx.websiteThemeOverride.delete({
          where: { websiteId: website.id }
        });
      } catch (err) {
        // Ignore if it didn't exist
      }
    }

    return tx.website.findUnique({
      where: { id: website.id },
      include: {
        theme: true,
        themeOverride: true
      }
    });
  });
}
