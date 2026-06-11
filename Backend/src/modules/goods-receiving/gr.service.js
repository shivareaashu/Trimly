import * as grRepo from './gr.repository.js';

export async function getReceipts(tenantId, filters) {
  return grRepo.findReceipts(tenantId, filters);
}

export async function getReceipt(tenantId, id) {
  return grRepo.findReceiptById(tenantId, id);
}

export async function receiveGoods(tenantId, userId, data) {
  return grRepo.createReceipt(tenantId, userId, data);
}
