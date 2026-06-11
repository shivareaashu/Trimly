import prisma from '../../config/db.js';

// =========================================================================
// INVENTORY CATEGORIES
// =========================================================================

export async function findCategories(tenantId) {
  return prisma.inventoryCategory.findMany({
    where: { tenantId },
    orderBy: { name: 'asc' },
  });
}

export async function findCategoryById(tenantId, id) {
  return prisma.inventoryCategory.findFirst({
    where: { id, tenantId },
  });
}

export async function createCategory(tenantId, data) {
  return prisma.inventoryCategory.create({
    data: {
      ...data,
      tenantId,
    },
  });
}

export async function updateCategory(tenantId, id, data) {
  return prisma.inventoryCategory.update({
    where: { id },
    data,
  });
}

export async function deleteCategory(tenantId, id) {
  return prisma.inventoryCategory.delete({
    where: { id },
  });
}

// =========================================================================
// INVENTORY ITEMS
// =========================================================================

export async function findItems(tenantId, filters = {}) {
  const where = { tenantId };

  if (filters.branchId) {
    where.branchId = filters.branchId;
  }
  if (filters.categoryId) {
    where.categoryId = filters.categoryId;
  }
  if (filters.search) {
    where.OR = [
      { name: { contains: filters.search, mode: 'insensitive' } },
      { sku: { contains: filters.search, mode: 'insensitive' } },
    ];
  }
  if (filters.lowStock === 'true') {
    where.quantity = {
      lte: prisma.inventoryItem.fields.reorderLevel,
    };
  }

  return prisma.inventoryItem.findMany({
    where,
    include: {
      category: true,
      branch: {
        select: {
          name: true,
        },
      },
    },
    orderBy: { name: 'asc' },
  });
}

export async function findItemById(tenantId, id) {
  return prisma.inventoryItem.findFirst({
    where: { id, tenantId },
    include: {
      category: true,
      branch: true,
    },
  });
}

export async function createItem(tenantId, data) {
  return prisma.$transaction(async (tx) => {
    const item = await tx.inventoryItem.create({
      data: {
        ...data,
        tenantId,
      },
    });

    // Write initial stock intake movement if qty > 0
    if (item.quantity > 0) {
      await tx.stockMovement.create({
        data: {
          tenantId,
          branchId: item.branchId,
          itemId: item.id,
          quantity: item.quantity,
          type: 'PURCHASE',
          referenceId: item.id,
        },
      });
    }

    return item;
  });
}

export async function updateItem(tenantId, id, data) {
  return prisma.inventoryItem.update({
    where: { id },
    data,
  });
}

export async function deleteItem(tenantId, id) {
  return prisma.inventoryItem.delete({
    where: { id },
  });
}

// =========================================================================
// INVENTORY ADJUSTMENTS
// =========================================================================

export async function createAdjustment(tenantId, { branchId, itemId, qtyChange, type, reason }) {
  return prisma.$transaction(async (tx) => {
    // 1. Fetch item to confirm stock exists if we are depleting
    const item = await tx.inventoryItem.findFirst({
      where: { id: itemId, tenantId },
    });

    if (!item) {
      throw new Error('Inventory item not found.');
    }

    if (item.quantity + qtyChange < 0) {
      throw new Error(`Insufficient stock level. Current: ${item.quantity}, Requested depletion: ${Math.abs(qtyChange)}`);
    }

    // 2. Create adjustment log
    const adjustment = await tx.inventoryAdjustment.create({
      data: {
        tenantId,
        branchId,
        itemId,
        qtyChange,
        type,
        reason,
      },
    });

    // 3. Update stock levels on Item
    await tx.inventoryItem.update({
      where: { id: itemId },
      data: {
        quantity: {
          increment: qtyChange,
        },
      },
    });

    // 4. Create StockMovement entry
    await tx.stockMovement.create({
      data: {
        tenantId,
        branchId,
        itemId,
        quantity: qtyChange,
        type: 'ADJUSTMENT',
        referenceId: adjustment.id,
      },
    });

    return adjustment;
  });
}
