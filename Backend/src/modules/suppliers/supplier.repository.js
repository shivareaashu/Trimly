import prisma from '../../config/db.js';

// =========================================================================
// SUPPLIER CRUD
// =========================================================================

export async function findSuppliers(tenantId) {
  return prisma.supplier.findMany({
    where: { tenantId },
    include: {
      contacts: true,
      documents: true,
    },
    orderBy: { name: 'asc' },
  });
}

export async function findSupplierById(tenantId, id) {
  return prisma.supplier.findFirst({
    where: { id, tenantId },
    include: {
      contacts: true,
      documents: true,
      purchaseOrders: {
        orderBy: { createdAt: 'desc' },
      },
    },
  });
}

export async function createSupplier(tenantId, data) {
  return prisma.supplier.create({
    data: {
      ...data,
      tenantId,
    },
  });
}

export async function updateSupplier(tenantId, id, data) {
  return prisma.supplier.update({
    where: { id },
    data,
  });
}

export async function deleteSupplier(tenantId, id) {
  return prisma.supplier.delete({
    where: { id },
  });
}

// =========================================================================
// SUPPLIER CONTACTS
// =========================================================================

export async function createContact(supplierId, data) {
  return prisma.supplierContact.create({
    data: {
      ...data,
      supplierId,
    },
  });
}

export async function deleteContact(id) {
  return prisma.supplierContact.delete({
    where: { id },
  });
}

// =========================================================================
// SUPPLIER DOCUMENTS
// =========================================================================

export async function createDocument(supplierId, data) {
  return prisma.supplierDocument.create({
    data: {
      ...data,
      supplierId,
    },
  });
}

export async function deleteDocument(id) {
  return prisma.supplierDocument.delete({
    where: { id },
  });
}
