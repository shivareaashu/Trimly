import * as poRepo from './po.repository.js';

export async function getPOs(tenantId, filters) {
  return poRepo.findPOs(tenantId, filters);
}

export async function getPO(tenantId, id) {
  return poRepo.findPOById(tenantId, id);
}

export async function createPO(tenantId, data) {
  return poRepo.createPO(tenantId, data);
}

export async function updatePO(tenantId, id, data) {
  return poRepo.updatePO(tenantId, id, data);
}

export async function deletePO(tenantId, id) {
  return poRepo.deletePO(tenantId, id);
}

export async function approvePO(tenantId, id) {
  return poRepo.updatePO(tenantId, id, { status: 'APPROVED' });
}

export async function sendPO(tenantId, id) {
  return poRepo.updatePO(tenantId, id, { status: 'SENT' });
}
