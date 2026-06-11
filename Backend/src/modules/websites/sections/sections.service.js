import * as sectionsRepo from './sections.repository.js';
import { assertRegisteredSection } from '../engines/sectionRegistry.engine.js';

export async function getSections(tenantId, pageId) {
  return sectionsRepo.findSectionsByPage(tenantId, pageId);
}

export async function createSection(tenantId, sectionData) {
  if (!sectionData.pageId || !sectionData.sectionType) {
    throw new Error('Page ID and Section Type are required.');
  }

  // Validate via Registry Engine
  assertRegisteredSection(sectionData.sectionType);

  return sectionsRepo.createSection(tenantId, sectionData);
}

export async function updateSection(tenantId, sectionId, sectionData) {
  if (sectionData.sectionType) {
    assertRegisteredSection(sectionData.sectionType);
  }

  return sectionsRepo.updateSection(tenantId, sectionId, sectionData);
}

export async function deleteSection(tenantId, sectionId) {
  return sectionsRepo.deleteSection(tenantId, sectionId);
}

export async function reorderSections(tenantId, reorderList) {
  if (!Array.isArray(reorderList)) {
    throw new Error('Reorder list must be an array.');
  }
  return sectionsRepo.reorderSections(tenantId, reorderList);
}
