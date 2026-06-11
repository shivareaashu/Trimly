import prisma from '../../config/db.js';

export async function listStaff(tenantId, filters = {}) {
  const where = { tenantId };
  if (filters.isActive !== undefined) {
    where.isActive = filters.isActive;
  }

  return prisma.staff.findMany({
    where,
    orderBy: { name: 'asc' },
  });
}

export async function getStaffById(tenantId, id) {
  const staff = await prisma.staff.findFirst({
    where: { id, tenantId },
  });
  if (!staff) {
    throw new Error('Staff member not found.');
  }
  return staff;
}

export async function createStaff(tenantId, data) {
  return prisma.staff.create({
    data: {
      tenantId,
      name: data.name,
      email: data.email || null,
      phone: data.phone || null,
      bio: data.bio || null,
      baseSalary: data.baseSalary || 0.00,
      commissionType: data.commissionType || 'PERCENTAGE',
      commissionValue: data.commissionValue || 0.00,
      isActive: data.isActive !== undefined ? data.isActive : true,
    },
  });
}

export async function updateStaff(tenantId, id, data) {
  const existing = await prisma.staff.findFirst({
    where: { id, tenantId },
  });
  if (!existing) {
    throw new Error('Staff member not found.');
  }

  return prisma.staff.update({
    where: { id },
    data: {
      name: data.name !== undefined ? data.name : existing.name,
      email: data.email !== undefined ? data.email : existing.email,
      phone: data.phone !== undefined ? data.phone : existing.phone,
      bio: data.bio !== undefined ? data.bio : existing.bio,
      baseSalary: data.baseSalary !== undefined ? data.baseSalary : existing.baseSalary,
      commissionType: data.commissionType !== undefined ? data.commissionType : existing.commissionType,
      commissionValue: data.commissionValue !== undefined ? data.commissionValue : existing.commissionValue,
      isActive: data.isActive !== undefined ? data.isActive : existing.isActive,
    },
  });
}

export async function deleteStaff(tenantId, id) {
  const existing = await prisma.staff.findFirst({
    where: { id, tenantId },
  });
  if (!existing) {
    throw new Error('Staff member not found.');
  }

  // Soft delete / deactivate by default to preserve integrity of historical appointments/payroll
  return prisma.staff.update({
    where: { id },
    data: { isActive: false },
  });
}
