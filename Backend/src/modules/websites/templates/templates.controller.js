import * as templatesService from './templates.service.js';

export async function listTemplates(req, res) {
  try {
    const templates = await templatesService.getTemplates();
    return res.status(200).json(templates);
  } catch (error) {
    return res.status(500).json({ error: error.message || 'Failed to list templates.' });
  }
}

export async function getTemplate(req, res) {
  try {
    const template = await templatesService.getTemplateDetails(req.params.id);
    return res.status(200).json(template);
  } catch (error) {
    return res.status(404).json({ error: error.message || 'Template not found.' });
  }
}

export async function selectTemplate(req, res) {
  try {
    const tenantId = req.tenant.id;
    const result = await templatesService.selectTemplate(tenantId, req.params.id);
    return res.status(200).json({
      message: 'Website template selected and default pages configured successfully.',
      website: result
    });
  } catch (error) {
    return res.status(400).json({ error: error.message || 'Failed to select template.' });
  }
}

// Super Admin
export async function createTemplate(req, res) {
  try {
    const template = await templatesService.addTemplate(req.body);
    return res.status(201).json({
      message: 'Template created successfully.',
      template
    });
  } catch (error) {
    return res.status(400).json({ error: error.message || 'Failed to create template.' });
  }
}

export async function updateTemplate(req, res) {
  try {
    const template = await templatesService.modifyTemplate(req.params.id, req.body);
    return res.status(200).json({
      message: 'Template updated successfully.',
      template
    });
  } catch (error) {
    return res.status(400).json({ error: error.message || 'Failed to update template.' });
  }
}

export async function deleteTemplate(req, res) {
  try {
    await templatesService.removeTemplate(req.params.id);
    return res.status(200).json({
      message: 'Template deleted successfully.'
    });
  } catch (error) {
    return res.status(400).json({ error: error.message || 'Failed to delete template.' });
  }
}
