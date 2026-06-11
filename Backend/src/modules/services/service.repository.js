import prisma from '../../config/db.js';

// =========================================================================
// SERVICE CATEGORY REPOSITORY
// =========================================================================

export async function findCategories(tenantId) {
  return prisma.serviceCategory.findMany({
    where: { tenantId },
    orderBy: { order: 'asc' },
    include: {
      services: true,
    },
  });
}

export async function findCategoryById(tenantId, id) {
  return prisma.serviceCategory.findFirst({
    where: { id, tenantId },
    include: {
      services: true,
    },
  });
}

export async function createCategory(tenantId, data) {
  return prisma.serviceCategory.create({
    data: {
      ...data,
      tenantId,
    },
  });
}

export async function updateCategory(tenantId, id, data) {
  return prisma.serviceCategory.update({
    where: { id },
    data,
  });
}

export async function deleteCategory(tenantId, id) {
  return prisma.serviceCategory.delete({
    where: { id },
  });
}

// =========================================================================
// SERVICE REPOSITORY
// =========================================================================

export async function findServices(tenantId, filters = {}) {
  return prisma.service.findMany({
    where: {
      tenantId,
      isActive: filters.isActive === undefined ? undefined : filters.isActive,
    },
    include: { category: true },
    orderBy: { name: 'asc' },
  });
}

export async function findServiceById(tenantId, id) {
  return prisma.service.findFirst({
    where: { id, tenantId },
    include: { category: true },
  });
}

export async function createService(tenantId, data) {
  return prisma.service.create({
    data: {
      ...data,
      tenantId,
      categoryId: data.categoryId || null,
      revisitAfterDays: data.revisitAfterDays || 30,
    },
    include: { category: true },
  });
}

export async function updateService(tenantId, id, data) {
  const existing = await prisma.service.findFirst({
    where: { id, tenantId },
    select: { id: true },
  });
  if (!existing) throw new Error('Service not found.');

  return prisma.service.update({
    where: { id },
    data: {
      ...data,
      categoryId: data.categoryId === undefined ? undefined : data.categoryId || null,
    },
    include: { category: true },
  });
}

export async function deleteService(tenantId, id) {
  return updateService(tenantId, id, { isActive: false });
}

// =========================================================================
// SERVICE ADDON REPOSITORY
// =========================================================================

export async function findAddons(tenantId) {
  return prisma.serviceAddon.findMany({
    where: { tenantId },
    orderBy: { name: 'asc' },
  });
}

export async function findAddonById(tenantId, id) {
  return prisma.serviceAddon.findFirst({
    where: { id, tenantId },
  });
}

export async function createAddon(tenantId, data) {
  return prisma.serviceAddon.create({
    data: {
      ...data,
      tenantId,
    },
  });
}

export async function updateAddon(tenantId, id, data) {
  return prisma.serviceAddon.update({
    where: { id },
    data,
  });
}

export async function deleteAddon(tenantId, id) {
  return prisma.serviceAddon.delete({
    where: { id },
  });
}

// =========================================================================
// SERVICE BUNDLE REPOSITORY
// =========================================================================

export async function findBundles(tenantId) {
  return prisma.serviceBundle.findMany({
    where: { tenantId },
    include: {
      services: {
        include: {
          service: true,
        },
      },
    },
  });
}

export async function findBundleById(tenantId, id) {
  return prisma.serviceBundle.findFirst({
    where: { id, tenantId },
    include: {
      services: {
        include: {
          service: true,
        },
      },
    },
  });
}

export async function createBundle(tenantId, { name, description, price, serviceIds, isActive }) {
  return prisma.$transaction(async (tx) => {
    const bundle = await tx.serviceBundle.create({
      data: {
        tenantId,
        name,
        description,
        price,
        isActive,
      },
    });

    if (serviceIds && serviceIds.length > 0) {
      await tx.serviceBundleItem.createMany({
        data: serviceIds.map((serviceId) => ({
          bundleId: bundle.id,
          serviceId,
        })),
      });
    }

    return tx.serviceBundle.findUnique({
      where: { id: bundle.id },
      include: {
        services: {
          include: {
            service: true,
          },
        },
      },
    });
  });
}

export async function updateBundle(tenantId, id, { name, description, price, serviceIds, isActive }) {
  return prisma.$transaction(async (tx) => {
    const bundle = await tx.serviceBundle.update({
      where: { id },
      data: {
        name,
        description,
        price,
        isActive,
      },
    });

    if (serviceIds !== undefined) {
      // Clear previous links
      await tx.serviceBundleItem.deleteMany({
        where: { bundleId: id },
      });

      if (serviceIds.length > 0) {
        await tx.serviceBundleItem.createMany({
          data: serviceIds.map((serviceId) => ({
            bundleId: id,
            serviceId,
          })),
        });
      }
    }

    return tx.serviceBundle.findUnique({
      where: { id },
      include: {
        services: {
          include: {
            service: true,
          },
        },
      },
    });
  });
}

export async function deleteBundle(tenantId, id) {
  return prisma.serviceBundle.delete({
    where: { id },
  });
}
