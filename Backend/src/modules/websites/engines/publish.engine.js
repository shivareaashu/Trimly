import { injectSectionData } from './dataSource.engine.js';
import { assertRegisteredSection } from './sectionRegistry.engine.js';
import { resolveTheme } from './theme.engine.js';

function readSectionContent(section, mode) {
  return mode === 'published' ? (section.publishedContent || {}) : (section.content || {});
}

function readSectionSettings(section, mode) {
  if (mode === 'published') {
    return section.publishedSettings || section.settings || {};
  }
  return section.settings || {};
}

export async function validateWebsiteForPublish(website) {
  if (!website) {
    throw new Error('Website does not exist.');
  }

  if (!website.pages?.length) {
    throw new Error('Website must have at least one page before publishing.');
  }

  for (const page of website.pages) {
    for (const section of page.sections || []) {
      assertRegisteredSection(section.sectionType);
    }
  }

  return true;
}

export async function compileWebsitePayload({ tenantId, website, mode = 'published' }) {
  await validateWebsiteForPublish(website);

  const theme = website.theme
    ? {
        id: website.theme.id,
        code: website.theme.code,
        name: website.theme.name,
        ...(website.theme.tokens || {}),
      }
    : resolveTheme(website.themeCode);
  const pages = [];

  for (const page of website.pages || []) {
    const sections = [];

    for (const section of page.sections || []) {
      const definition = assertRegisteredSection(section.sectionType);
      const content = {
        ...(definition.defaultContent || {}),
        ...readSectionContent(section, mode),
      };
      const settings = {
        ...(definition.defaultSettings || {}),
        ...readSectionSettings(section, mode),
      };

      const compiledSection = await injectSectionData({
        tenantId,
        section: {
          id: section.id,
          sectionType: section.sectionType,
          registry: {
            icon: definition.icon,
            category: definition.category,
          },
          sortOrder: section.sortOrder ?? section.order ?? 0,
          order: section.order ?? section.sortOrder ?? 0,
          content,
          settings,
        },
      });

      sections.push(compiledSection);
    }

    pages.push({
      id: page.id,
      title: page.title,
      slug: page.slug,
      isHome: page.isHome || page.slug === 'home',
      sortOrder: page.sortOrder ?? 0,
      layout: mode === 'published' ? (page.publishedLayout || page.layout) : page.layout,
      seo: {
        title: page.seoTitle,
        description: page.seoDescription,
        keywords: page.seoKeywords,
        ogImage: page.ogImage,
      },
      sections,
    });
  }

  return {
    website: {
      id: website.id,
      tenantId: website.tenantId,
      name: website.name || website.tenant?.name || 'Trimly Website',
      templateCode: website.templateCode,
      themeCode: website.themeCode,
      themeId: website.themeId,
      templateId: website.templateId,
      template: website.template
        ? {
            id: website.template.id,
            name: website.template.name,
            category: website.template.category,
          }
        : null,
      customDomain: website.customDomain,
      isPublished: website.isPublished,
      publishedAt: website.publishedAt,
    },
    theme,
    bookingSettings: website.bookingSettings || null,
    version: website.currentVersion || null,
    pages,
  };
}
