import * as dashboardRepo from './dashboard.repository.js';

export async function getDashboardData(tenantId) {
  const website = await dashboardRepo.findOrCreateWebsite(tenantId);
  const metrics = await dashboardRepo.getDashboardMetrics(tenantId);

  return {
    websiteStatus: website.isPublished ? 'PUBLISHED' : 'DRAFT',
    template: website.templateCode || (website.template ? website.template.category : 'luxury'),
    theme: website.themeCode || (website.theme ? website.theme.code : 'luxury'),
    visitors: metrics.visitors,
    leads: metrics.leads,
    bookings: metrics.bookings,
    lastPublishedAt: website.publishedAt || null
  };
}
