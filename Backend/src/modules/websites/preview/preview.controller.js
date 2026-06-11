import * as previewService from './preview.service.js';

export async function createPreviewToken(req, res) {
  try {
    const tenantId = req.tenant.id;
    const userId = req.user?.id || 'system';
    const result = await previewService.getPreviewToken(tenantId, userId);
    return res.status(201).json({
      message: 'Website preview token created successfully.',
      ...result
    });
  } catch (error) {
    return res.status(400).json({ error: error.message || 'Failed to generate preview token.' });
  }
}
