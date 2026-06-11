import * as analyticsRepo from './analytics.repository.js';

export async function getOverallAnalytics(tenantId) {
  return analyticsRepo.getOverallMetrics(tenantId);
}

export async function getPagesAnalytics(tenantId) {
  return analyticsRepo.getPageViews(tenantId);
}

export async function getSourcesAnalytics(tenantId) {
  return analyticsRepo.getTrafficSources(tenantId);
}

export async function getConversionsAnalytics(tenantId) {
  const metrics = await analyticsRepo.getOverallMetrics(tenantId);
  const visitors = metrics.visitors || 1;

  return {
    bookingConversionRate: Number(((metrics.bookings / visitors) * 100).toFixed(2)),
    leadConversionRate: Number(((metrics.leads / visitors) * 100).toFixed(2)),
    totalConversionRate: metrics.conversionRate,
    funnel: {
      visitors: metrics.visitors,
      leads: metrics.leads,
      bookings: metrics.bookings
    }
  };
}
