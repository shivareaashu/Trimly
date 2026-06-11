import * as publishService from './publish.service.js';

export async function publishWebsite(req, res) {
  try {
    const tenantId = req.tenant.id;
    const publishedBy = req.user?.id || 'system';
    const result = await publishService.publishWebsite(tenantId, publishedBy);
    return res.status(200).json({
      message: 'Website published live successfully.',
      ...result
    });
  } catch (error) {
    console.error('Publish Website Error:', error);
    return res.status(400).json({ error: error.message || 'Failed to publish website.' });
  }
}
