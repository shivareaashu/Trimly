import * as analyticsService from './analytics.service.js';

export async function getOverallAnalytics(req, res) {
  try {
    const tenantId = req.tenant.id;
    const data = await analyticsService.getOverallAnalytics(tenantId);
    return res.status(200).json(data);
  } catch (error) {
    return res.status(500).json({ error: error.message || 'Failed to retrieve analytics.' });
  }
}

export async function getPagesAnalytics(req, res) {
  try {
    const tenantId = req.tenant.id;
    const data = await analyticsService.getPagesAnalytics(tenantId);
    return res.status(200).json(data);
  } catch (error) {
    return res.status(500).json({ error: error.message || 'Failed to retrieve pages analytics.' });
  }
}

export async function getSourcesAnalytics(req, res) {
  try {
    const tenantId = req.tenant.id;
    const data = await analyticsService.getSourcesAnalytics(tenantId);
    return res.status(200).json(data);
  } catch (error) {
    return res.status(500).json({ error: error.message || 'Failed to retrieve sources analytics.' });
  }
}

export async function getConversionsAnalytics(req, res) {
  try {
    const tenantId = req.tenant.id;
    const data = await analyticsService.getConversionsAnalytics(tenantId);
    return res.status(200).json(data);
  } catch (error) {
    return res.status(500).json({ error: error.message || 'Failed to retrieve conversions analytics.' });
  }
}
