import * as inventoryRepo from './inventory.repository.js';

// =========================================================================
// CATEGORY OPERATIONS
// =========================================================================

export async function getCategories(tenantId) {
  return inventoryRepo.findCategories(tenantId);
}

export async function getCategory(tenantId, id) {
  return inventoryRepo.findCategoryById(tenantId, id);
}

export async function createCategory(tenantId, data) {
  return inventoryRepo.createCategory(tenantId, data);
}

export async function updateCategory(tenantId, id, data) {
  return inventoryRepo.updateCategory(tenantId, id, data);
}

export async function deleteCategory(tenantId, id) {
  return inventoryRepo.deleteCategory(tenantId, id);
}

// =========================================================================
// ITEM OPERATIONS
// =========================================================================

export async function getItems(tenantId, filters) {
  return inventoryRepo.findItems(tenantId, filters);
}

export async function getItem(tenantId, id) {
  return inventoryRepo.findItemById(tenantId, id);
}

export async function createItem(tenantId, data) {
  return inventoryRepo.createItem(tenantId, data);
}

export async function updateItem(tenantId, id, data) {
  return inventoryRepo.updateItem(tenantId, id, data);
}

export async function deleteItem(tenantId, id) {
  return inventoryRepo.deleteItem(tenantId, id);
}

// =========================================================================
// STOCK ADJUSTMENT OPERATIONS
// =========================================================================

export async function adjustStock(tenantId, data) {
  return inventoryRepo.createAdjustment(tenantId, data);
}
