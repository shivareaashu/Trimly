import * as formsRepo from './forms.repository.js';

export async function getForms(tenantId) {
  return formsRepo.findFormsByTenant(tenantId);
}

export async function createForm(tenantId, formData) {
  if (!formData.name) {
    throw new Error('Form name is required.');
  }
  return formsRepo.createForm(tenantId, formData);
}

export async function updateForm(tenantId, formId, formData) {
  return formsRepo.updateForm(tenantId, formId, formData);
}

export async function deleteForm(tenantId, formId) {
  return formsRepo.deleteForm(tenantId, formId);
}
