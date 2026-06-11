import prisma from '../../../config/db.js';

export async function findOrCreateWebsite(tenantId) {
  let website = await prisma.website.findUnique({
    where: { tenantId },
    include: {
      theme: true,
      template: true
    }
  });

  if (!website) {
    website = await prisma.website.create({
      data: {
        tenantId,
        templateCode: 'luxury',
        themeCode: 'luxury',
        isActive: true,
        isPublished: false
      },
      include: {
        theme: true,
        template: true
      }
    });
  }

  return website;
}

export async function getDashboardMetrics(tenantId) {
  const [visitors, leads, bookings] = await Promise.all([
    prisma.websiteVisit.count({
      where: { tenantId }
    }),
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

  return {
    visitors,
    leads,
    bookings
  };
}
