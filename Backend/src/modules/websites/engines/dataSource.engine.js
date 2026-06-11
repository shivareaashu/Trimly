import { DATA_SOURCE_ENTITIES, DATA_SOURCE_KINDS, DEFAULT_DATA_LIMIT } from '../constants/dataSourceTypes.js';
import { resolveBranches } from './data-sources/branches.handler.js';
import { resolveMedia } from './data-sources/media.handler.js';
import { resolveServices } from './data-sources/services.handler.js';
import { resolveStaff } from './data-sources/staff.handler.js';

const handlers = {
  [DATA_SOURCE_ENTITIES.SERVICES]: resolveServices,
  [DATA_SOURCE_ENTITIES.STAFF]: resolveStaff,
  [DATA_SOURCE_ENTITIES.BRANCHES]: resolveBranches,
  [DATA_SOURCE_ENTITIES.MEDIA]: resolveMedia,
  [DATA_SOURCE_ENTITIES.REVIEWS]: async () => [],
  [DATA_SOURCE_ENTITIES.CAMPAIGNS]: async () => [],
  [DATA_SOURCE_ENTITIES.BLOGS]: async () => [],
  [DATA_SOURCE_ENTITIES.TESTIMONIALS]: async () => [],
  [DATA_SOURCE_ENTITIES.OFFERS]: async () => [],
  [DATA_SOURCE_ENTITIES.INVENTORY]: async () => [],
};

export function registerDataSource(entity, handler) {
  if (!entity || typeof handler !== 'function') {
    throw new Error('Data source registration requires an entity and handler.');
  }
  handlers[entity] = handler;
}

export async function resolveDataSource({ tenantId, source, config = {} }) {
  if (!source || source === DATA_SOURCE_KINDS.STATIC) {
    return null;
  }

  if (source !== DATA_SOURCE_KINDS.DATABASE) {
    throw new Error(`Unsupported website data source '${source}'.`);
  }

  const entity = config.entity;
  const handler = handlers[entity];
  if (!handler) {
    throw new Error(`No website data source handler registered for '${entity}'.`);
  }

  return handler({
    tenantId,
    config: {
      limit: DEFAULT_DATA_LIMIT,
      ...config,
    },
  });
}

export async function injectSectionData({ tenantId, section }) {
  const content = section.content || {};

  if (!content.source || !content.entity) {
    return {
      ...section,
      data: null,
    };
  }

  const data = await resolveDataSource({
    tenantId,
    source: content.source,
    config: content,
  });

  return {
    ...section,
    data,
  };
}

export function listDataSources() {
  return Object.keys(handlers);
}
