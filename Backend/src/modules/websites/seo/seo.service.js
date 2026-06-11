import * as seoRepo from './seo.repository.js';

export async function getSeo(tenantId, pageId) {
  return seoRepo.getPageSeo(tenantId, pageId);
}

export async function updateSeo(tenantId, pageId, seoData) {
  return seoRepo.updatePageSeo(tenantId, pageId, seoData);
}
