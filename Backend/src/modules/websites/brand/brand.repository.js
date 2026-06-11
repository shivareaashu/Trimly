import prisma from '../../../config/db.js';

export async function getBrandSettings(tenantId) {
  const tenant = await prisma.tenant.findUnique({
    where: { id: tenantId },
    select: { name: true, settings: true }
  });

  if (!tenant) {
    throw new Error('Tenant not found.');
  }

  const settings = tenant.settings || {};
  const brand = settings.brand || {};

  return {
    businessName: brand.businessName || tenant.name || '',
    logoId: brand.logoId || '',
    primaryColor: brand.primaryColor || '#735c00',
    secondaryColor: brand.secondaryColor || '#5f5e5e',
    phone: brand.phone || '',
    whatsapp: brand.whatsapp || '',
    email: brand.email || '',
    address: brand.address || ''
  };
}

export async function updateBrandSettings(tenantId, brandData) {
  const tenant = await prisma.tenant.findUnique({
    where: { id: tenantId }
  });

  if (!tenant) {
    throw new Error('Tenant not found.');
  }

  const currentSettings = tenant.settings || {};
  const currentBrand = currentSettings.brand || {};

  const updatedBrand = {
    ...currentBrand,
    businessName: brandData.businessName !== undefined ? brandData.businessName : (currentBrand.businessName || tenant.name),
    logoId: brandData.logoId !== undefined ? brandData.logoId : (currentBrand.logoId || ''),
    primaryColor: brandData.primaryColor !== undefined ? brandData.primaryColor : (currentBrand.primaryColor || '#735c00'),
    secondaryColor: brandData.secondaryColor !== undefined ? brandData.secondaryColor : (currentBrand.secondaryColor || '#5f5e5e'),
    phone: brandData.phone !== undefined ? brandData.phone : (currentBrand.phone || ''),
    whatsapp: brandData.whatsapp !== undefined ? brandData.whatsapp : (currentBrand.whatsapp || ''),
    email: brandData.email !== undefined ? brandData.email : (currentBrand.email || ''),
    address: brandData.address !== undefined ? brandData.address : (currentBrand.address || '')
  };

  const newSettings = {
    ...currentSettings,
    brand: updatedBrand
  };

  return prisma.$transaction(async (tx) => {
    // 1. Update Tenant settings
    await tx.tenant.update({
      where: { id: tenantId },
      data: {
        settings: newSettings,
        name: updatedBrand.businessName // Keep tenant name aligned with businessName
      }
    });

    // 2. Update Website name
    const website = await tx.website.findUnique({
      where: { tenantId }
    });

    if (website) {
      await tx.website.update({
        where: { id: website.id },
        data: {
          name: updatedBrand.businessName
        }
      });
    }

    return updatedBrand;
  });
}
