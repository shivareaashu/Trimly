import * as seoService from './seo.service.js';

export async function getSeo(req, res) {
  try {
    const tenantId = req.tenant.id;
    const pageId = req.params.id;
    const data = await seoService.getSeo(tenantId, pageId);
    return res.status(200).json(data);
  } catch (error) {
    return res.status(500).json({ error: error.message || 'Failed to retrieve SEO configurations.' });
  }
}

export async function updateSeo(req, res) {
  try {
    const tenantId = req.tenant.id;
    const pageId = req.params.id;
    const data = await seoService.updateSeo(tenantId, pageId, req.body);
    return res.status(200).json({
      message: 'SEO configurations updated successfully.',
      seo: data
    });
  } catch (error) {
    return res.status(400).json({ error: error.message || 'Failed to update SEO configurations.' });
  }
}
