import prisma from '../../config/db.js';

export async function findPOs(tenantId, filters = {}) {
  const where = { tenantId };

  if (filters.branchId) {
    where.branchId = filters.branchId;
  }
  if (filters.supplierId) {
    where.supplierId = filters.supplierId;
  }
  if (filters.status) {
    where.status = filters.status;
  }

  return prisma.purchaseOrder.findMany({
    where,
    include: {
      supplier: {
        select: {
          name: true,
        },
      },
      branch: {
        select: {
          name: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });
}

export async function findPOById(tenantId, id) {
  return prisma.purchaseOrder.findFirst({
    where: { id, tenantId },
    include: {
      supplier: true,
      branch: true,
      items: {
        include: {
          item: true,
        },
      },
      receipts: {
        include: {
          items: true,
        },
      },
    },
  });
}

export async function createPO(tenantId, { branchId, supplierId, poNumber, notes, items }) {
  const totalAmount = items.reduce((acc, current) => {
    return acc + (current.quantityOrdered * current.pricePerUnit);
  }, 0);

  return prisma.$transaction(async (tx) => {
    const po = await tx.purchaseOrder.create({
      data: {
        tenantId,
        branchId,
        supplierId,
        poNumber,
        notes,
        totalAmount,
      },
    });

    await tx.purchaseOrderItem.createMany({
      data: items.map((item) => ({
        poId: po.id,
        itemId: item.itemId,
        quantityOrdered: item.quantityOrdered,
        pricePerUnit: item.pricePerUnit,
      })),
    });

    return tx.purchaseOrder.findUnique({
      where: { id: po.id },
      include: {
        items: true,
      },
    });
  });
}

export async function updatePO(tenantId, id, { status, notes, items }) {
  return prisma.$transaction(async (tx) => {
    const dataToUpdate = {};
    if (status) dataToUpdate.status = status;
    if (notes !== undefined) dataToUpdate.notes = notes;

    if (items) {
      const totalAmount = items.reduce((acc, current) => {
        return acc + (current.quantityOrdered * current.pricePerUnit);
      }, 0);
      dataToUpdate.totalAmount = totalAmount;

      // Reset items
      await tx.purchaseOrderItem.deleteMany({
        where: { poId: id },
      });

      await tx.purchaseOrderItem.createMany({
        data: items.map((item) => ({
          poId: id,
          itemId: item.itemId,
          quantityOrdered: item.quantityOrdered,
          pricePerUnit: item.pricePerUnit,
        })),
      });
    }

    // If status is updated to CANCELLED, we release any outstanding constraints if needed, etc.
    const po = await tx.purchaseOrder.update({
      where: { id },
      data: dataToUpdate,
    });

    return tx.purchaseOrder.findUnique({
      where: { id: po.id },
      include: {
        items: true,
      },
    });
  });
}

export async function deletePO(tenantId, id) {
  return prisma.purchaseOrder.delete({
    where: { id },
  });
}
