import * as websiteRepo from './website.repository.js';
import { emitWebsiteEvent } from './website.events.js';
import redisClient from '../../config/redis.js';
import { compileWebsitePayload, validateWebsiteForPublish } from './engines/publish.engine.js';
import { createPreviewToken } from './engines/preview.engine.js';

const WEBSITE_CACHE_TTL_SECONDS = 86400;

export async function getEditorData(tenantId) {
  const website = await websiteRepo.findWebsiteByTenant(tenantId);
  if (!website) {
    throw new Error('Website settings do not exist.');
  }
  return website;
}

export async function updateConfig(tenantId, data) {
  const website = await websiteRepo.updateWebsiteConfig(tenantId, data);
  await emitWebsiteEvent('website.config_updated', website);
  return website;
}

export async function updateLayout(tenantId, pageId, layout) {
  const page = await websiteRepo.updatePageLayout(tenantId, pageId, layout);
  await emitWebsiteEvent('website.layout_updated', page);
  return page;
}

export async function updateSection(tenantId, sectionId, data) {
  const section = await websiteRepo.updateSection(tenantId, sectionId, data);
  await emitWebsiteEvent('website.section_updated', section);
  return section;
}

export async function publishWebsite(tenantId, publishedBy = 'system') {
  const draftWebsite = await websiteRepo.findWebsiteByTenant(tenantId);
  await validateWebsiteForPublish(draftWebsite);

  const publishedWebsite = await websiteRepo.publishWebsite(tenantId);
  const compiledPayload = await compileWebsitePayload({
    tenantId,
    website: publishedWebsite,
    mode: 'published',
  });
  const version = await websiteRepo.createWebsiteVersion(publishedWebsite.id, compiledPayload, publishedBy);
  compiledPayload.version = version.version;

  try {
    if (redisClient && redisClient.isOpen) {
      const cacheKey = `website:${tenantId}`;
      await redisClient.del(cacheKey);
      await redisClient.set(cacheKey, JSON.stringify(compiledPayload), {
        EX: WEBSITE_CACHE_TTL_SECONDS,
      });
      console.log(`Redis Cache rebuilt for key: '${cacheKey}'`);
    }
  } catch (error) {
    console.warn('Failed to rebuild Redis cache:', error.message);
  }

  await emitWebsiteEvent('website.published', publishedWebsite);
  return {
    website: publishedWebsite,
    compiled: compiledPayload,
    version,
  };
}

export async function createWebsitePreviewToken(tenantId, userId) {
  const website = await websiteRepo.findWebsiteByTenant(tenantId);
  if (!website) {
    throw new Error('Website settings do not exist.');
  }

  return createPreviewToken({
    websiteId: website.id,
    tenantId,
    userId,
  });
}
