import * as serviceRepo from './service.repository.js';

// =========================================================================
// SERVICE CATEGORY OPERATIONS
// =========================================================================

export async function getCategories(tenantId) {
  return serviceRepo.findCategories(tenantId);
}

export async function getCategory(tenantId, id) {
  return serviceRepo.findCategoryById(tenantId, id);
}

export async function createCategory(tenantId, data) {
  return serviceRepo.createCategory(tenantId, data);
}

export async function updateCategory(tenantId, id, data) {
  return serviceRepo.updateCategory(tenantId, id, data);
}

export async function deleteCategory(tenantId, id) {
  return serviceRepo.deleteCategory(tenantId, id);
}

// =========================================================================
// SERVICE OPERATIONS
// =========================================================================

export async function getServices(tenantId, filters = {}) {
  return serviceRepo.findServices(tenantId, filters);
}

export async function getService(tenantId, id) {
  return serviceRepo.findServiceById(tenantId, id);
}

export async function createService(tenantId, data) {
  return serviceRepo.createService(tenantId, data);
}

export async function updateService(tenantId, id, data) {
  return serviceRepo.updateService(tenantId, id, data);
}

export async function deleteService(tenantId, id) {
  return serviceRepo.deleteService(tenantId, id);
}

// =========================================================================
// SERVICE ADDON OPERATIONS
// =========================================================================

export async function getAddons(tenantId) {
  return serviceRepo.findAddons(tenantId);
}

export async function getAddon(tenantId, id) {
  return serviceRepo.findAddonById(tenantId, id);
}

export async function createAddon(tenantId, data) {
  return serviceRepo.createAddon(tenantId, data);
}

export async function updateAddon(tenantId, id, data) {
  return serviceRepo.updateAddon(tenantId, id, data);
}

export async function deleteAddon(tenantId, id) {
  return serviceRepo.deleteAddon(tenantId, id);
}

// =========================================================================
// SERVICE BUNDLE OPERATIONS
// =========================================================================

export async function getBundles(tenantId) {
  return serviceRepo.findBundles(tenantId);
}

export async function getBundle(tenantId, id) {
  return serviceRepo.findBundleById(tenantId, id);
}

export async function createBundle(tenantId, data) {
  return serviceRepo.createBundle(tenantId, data);
}

export async function updateBundle(tenantId, id, data) {
  return serviceRepo.updateBundle(tenantId, id, data);
}

export async function deleteBundle(tenantId, id) {
  return serviceRepo.deleteBundle(tenantId, id);
}
