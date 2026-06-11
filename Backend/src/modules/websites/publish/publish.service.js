import * as publishRepo from './publish.repository.js';
import { compileWebsitePayload, validateWebsiteForPublish } from '../engines/publish.engine.js';
import { emitWebsiteEvent } from '../website.events.js';
import redisClient from '../../../config/redis.js';

const WEBSITE_CACHE_TTL_SECONDS = 86400;

export async function publishWebsite(tenantId, publishedBy = 'system') {
  const draftWebsite = await publishRepo.findWebsiteByTenant(tenantId);
  if (!draftWebsite) {
    throw new Error('Website not found.');
  }

  // 1. Validate structure
  await validateWebsiteForPublish(draftWebsite);

  // 2. Publish database settings (copy layout / contents to published columns)
  const publishedWebsite = await publishRepo.publishWebsite(tenantId);

  // 3. Compile published payload
  const compiledPayload = await compileWebsitePayload({
    tenantId,
    website: publishedWebsite,
    mode: 'published'
  });

  // 4. Create snapshot version in DB
  const versionRecord = await publishRepo.createWebsiteVersion(
    publishedWebsite.id,
    compiledPayload,
    publishedBy
  );

  compiledPayload.version = versionRecord.version;

  // 5. Invalidate & update Redis Cache
  try {
    if (redisClient && redisClient.isOpen) {
      const cacheKey = `website:${tenantId}`;
      await redisClient.del(cacheKey);
      await redisClient.set(cacheKey, JSON.stringify(compiledPayload), {
        EX: WEBSITE_CACHE_TTL_SECONDS
      });
      console.log(`Redis Cache rebuilt for key: '${cacheKey}'`);
    }
  } catch (error) {
    console.warn('Failed to rebuild Redis cache during publish:', error.message);
  }

  // 6. Emit event
  await emitWebsiteEvent('website.published', publishedWebsite);

  return {
    website: publishedWebsite,
    compiled: compiledPayload,
    version: versionRecord
  };
}
