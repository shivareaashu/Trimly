import * as templatesRepo from './templates.repository.js';

export async function getTemplates() {
  return templatesRepo.findActiveTemplates();
}

export async function getTemplateDetails(id) {
  const template = await templatesRepo.findTemplateById(id);
  if (!template) {
    throw new Error('Template not found or is inactive.');
  }
  return template;
}

export async function selectTemplate(tenantId, templateId) {
  return templatesRepo.selectTemplateForWebsite(tenantId, templateId);
}

// Super Admin CRUD
export async function addTemplate(data) {
  return templatesRepo.createTemplate(data);
}

export async function modifyTemplate(id, data) {
  return templatesRepo.updateTemplate(id, data);
}

export async function removeTemplate(id) {
  return templatesRepo.deleteTemplate(id);
}
