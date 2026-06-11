import * as sectionsService from './sections.service.js';

export async function getSections(req, res) {
  try {
    const tenantId = req.tenant.id;
    const sections = await sectionsService.getSections(tenantId, req.params.pageId);
    return res.status(200).json(sections);
  } catch (error) {
    return res.status(500).json({ error: error.message || 'Failed to fetch sections.' });
  }
}

export async function createSection(req, res) {
  try {
    const tenantId = req.tenant.id;
    const section = await sectionsService.createSection(tenantId, req.body);
    return res.status(201).json({
      message: 'Section created successfully.',
      section
    });
  } catch (error) {
    return res.status(400).json({ error: error.message || 'Failed to create section.' });
  }
}

export async function updateSection(req, res) {
  try {
    const tenantId = req.tenant.id;
    const section = await sectionsService.updateSection(tenantId, req.params.id, req.body);
    return res.status(200).json({
      message: 'Section updated successfully.',
      section
    });
  } catch (error) {
    return res.status(400).json({ error: error.message || 'Failed to update section.' });
  }
}

export async function deleteSection(req, res) {
  try {
    const tenantId = req.tenant.id;
    await sectionsService.deleteSection(tenantId, req.params.id);
    return res.status(200).json({
      message: 'Section deleted successfully.'
    });
  } catch (error) {
    return res.status(400).json({ error: error.message || 'Failed to delete section.' });
  }
}

export async function reorderSections(req, res) {
  try {
    const tenantId = req.tenant.id;
    await sectionsService.reorderSections(tenantId, req.body.reorderList || req.body);
    return res.status(200).json({
      message: 'Sections reordered successfully.'
    });
  } catch (error) {
    return res.status(400).json({ error: error.message || 'Failed to reorder sections.' });
  }
}
