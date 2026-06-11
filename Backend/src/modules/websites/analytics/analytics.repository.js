import prisma from '../../../config/db.js';

export async function getOverallMetrics(tenantId) {
  const [totalVisits, uniqueVisitors, leads, bookings] = await Promise.all([
    prisma.websiteVisit.count({
      where: { tenantId }
    }),
    prisma.websiteVisit.groupBy({
      by: ['sessionId'],
      where: { tenantId }
    }).then(res => res.length),
    prisma.websiteLead.count({
      where: { tenantId }
    }),
    prisma.appointment.count({
      where: {
        tenantId,
        source: 'WEBSITE'
      }
    })
  ]);

  const visitors = uniqueVisitors || 1; // Avoid divide by zero
  const conversionRate = Number((((leads + bookings) / visitors) * 100).toFixed(2));

  return {
    visitors: uniqueVisitors,
    pageViews: totalVisits,
    bookings,
    leads,
    conversionRate
  };
}

export async function getPageViews(tenantId) {
  const visits = await prisma.websiteVisit.findMany({
    where: { tenantId },
    include: {
      page: {
        select: {
          title: true,
          slug: true
        }
      }
    }
  });

  const pageCounts = {};
  for (const visit of visits) {
    const slug = visit.page?.slug || 'home';
    const title = visit.page?.title || 'Home';
    if (!pageCounts[slug]) {
      pageCounts[slug] = { page: title, slug, views: 0 };
    }
    pageCounts[slug].views += 1;
  }

  return Object.values(pageCounts).sort((a, b) => b.views - a.views);
}

export async function getTrafficSources(tenantId) {
  const groupings = await prisma.websiteVisit.groupBy({
    by: ['source'],
    where: { tenantId },
    _count: {
      id: true
    }
  });

  return groupings
    .map(g => ({
      source: g.source || 'Direct',
      count: g._count.id
    }))
    .sort((a, b) => b.count - a.count);
}
