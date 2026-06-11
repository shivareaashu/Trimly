import * as versionsRepo from './versions.repository.js';

export async function getVersions(tenantId) {
  return versionsRepo.findVersionsByTenant(tenantId);
}

export async function getVersionDetails(tenantId, id) {
  const version = await versionsRepo.findVersionById(tenantId, id);
  if (!version) {
    throw new Error('Website version not found.');
  }
  return version;
}

export async function restoreVersion(tenantId, id) {
  return versionsRepo.restoreWebsiteSnapshot(tenantId, id);
}
