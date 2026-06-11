import * as pageRepo from './website-page.repository.js';

export async function listPages(tenantId) {
  return pageRepo.findPagesByTenant(tenantId);
}

export async function createPage(tenantId, pageData) {
  if (!pageData.title) {
    throw new Error('Page title is required.');
  }
  return pageRepo.createPage(tenantId, pageData);
}

export async function updatePage(tenantId, pageId, pageData) {
  return pageRepo.updatePage(tenantId, pageId, pageData);
}

export async function deletePage(tenantId, pageId) {
  return pageRepo.deletePage(tenantId, pageId);
}

export async function reorderPages(tenantId, reorderList) {
  if (!Array.isArray(reorderList)) {
    throw new Error('Reorder list must be an array.');
  }
  return pageRepo.reorderPages(tenantId, reorderList);
}
