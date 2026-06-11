import * as formsService from './forms.service.js';

export async function getForms(req, res) {
  try {
    const tenantId = req.tenant.id;
    const forms = await formsService.getForms(tenantId);
    return res.status(200).json(forms);
  } catch (error) {
    return res.status(500).json({ error: error.message || 'Failed to list forms.' });
  }
}

export async function createForm(req, res) {
  try {
    const tenantId = req.tenant.id;
    const form = await formsService.createForm(tenantId, req.body);
    return res.status(201).json({
      message: 'Form created successfully.',
      form
    });
  } catch (error) {
    return res.status(400).json({ error: error.message || 'Failed to create form.' });
  }
}

export async function updateForm(req, res) {
  try {
    const tenantId = req.tenant.id;
    const form = await formsService.updateForm(tenantId, req.params.id, req.body);
    return res.status(200).json({
      message: 'Form updated successfully.',
      form
    });
  } catch (error) {
    return res.status(400).json({ error: error.message || 'Failed to update form.' });
  }
}

export async function deleteForm(req, res) {
  try {
    const tenantId = req.tenant.id;
    await formsService.deleteForm(tenantId, req.params.id);
    return res.status(200).json({
      message: 'Form deleted successfully.'
    });
  } catch (error) {
    return res.status(400).json({ error: error.message || 'Failed to delete form.' });
  }
}
