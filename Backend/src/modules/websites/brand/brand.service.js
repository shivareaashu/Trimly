import * as brandRepo from './brand.repository.js';

export async function getBrand(tenantId) {
  return brandRepo.getBrandSettings(tenantId);
}

export async function updateBrand(tenantId, brandData) {
  return brandRepo.updateBrandSettings(tenantId, brandData);
}
