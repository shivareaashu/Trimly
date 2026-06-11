import * as supplierRepo from './supplier.repository.js';

export async function getSuppliers(tenantId) {
  return supplierRepo.findSuppliers(tenantId);
}

export async function getSupplier(tenantId, id) {
  return supplierRepo.findSupplierById(tenantId, id);
}

export async function createSupplier(tenantId, data) {
  return supplierRepo.createSupplier(tenantId, data);
}

export async function updateSupplier(tenantId, id, data) {
  return supplierRepo.updateSupplier(tenantId, id, data);
}

export async function deleteSupplier(tenantId, id) {
  return supplierRepo.deleteSupplier(tenantId, id);
}

export async function addContact(supplierId, data) {
  return supplierRepo.createContact(supplierId, data);
}

export async function removeContact(id) {
  return supplierRepo.deleteContact(id);
}

export async function addDocument(supplierId, data) {
  return supplierRepo.createDocument(supplierId, data);
}

export async function removeDocument(id) {
  return supplierRepo.deleteDocument(id);
}
