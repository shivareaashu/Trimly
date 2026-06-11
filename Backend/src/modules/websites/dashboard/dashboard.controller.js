import * as dashboardService from './dashboard.service.js';

export async function getDashboard(req, res) {
  try {
    const tenantId = req.tenant.id;
    const data = await dashboardService.getDashboardData(tenantId);
    return res.status(200).json(data);
  } catch (error) {
    console.error('Website Dashboard Error:', error);
    return res.status(500).json({ error: error.message || 'Failed to retrieve website dashboard data.' });
  }
}
