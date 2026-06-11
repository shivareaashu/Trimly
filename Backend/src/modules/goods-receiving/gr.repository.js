import prisma from '../../config/db.js';

export async function findReceipts(tenantId, filters = {}) {
  const where = { tenantId };
  if (filters.branchId) where.branchId = filters.branchId;
  if (filters.poId) where.poId = filters.poId;

  return prisma.goodsReceipt.findMany({
    where,
    include: {
      po: {
        select: {
          poNumber: true,
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

export async function findReceiptById(tenantId, id) {
  return prisma.goodsReceipt.findFirst({
    where: { id, tenantId },
    include: {
      po: true,
      branch: true,
      items: true,
    },
  });
}

export async function createReceipt(tenantId, receivedByUserId, { branchId, poId, notes, items }) {
  return prisma.$transaction(async (tx) => {
    // 1. Load the Purchase Order and its items
    const po = await tx.purchaseOrder.findUnique({
      where: { id: poId },
      include: {
        items: true,
      },
    });

    if (!po) {
      throw new Error('Purchase Order not found.');
    }

    if (po.status === 'COMPLETED' || po.status === 'CANCELLED') {
      throw new Error(`Cannot receive goods against a PO with status ${po.status}.`);
    }

    // 2. Create the GoodsReceipt header
    const receipt = await tx.goodsReceipt.create({
      data: {
        tenantId,
        branchId,
        poId,
        receivedBy: receivedByUserId,
        notes,
      },
    });

    // 3. Process each received item
    for (const rxItem of items) {
      const poItem = po.items.find(pi => pi.id === rxItem.poItemId);
      if (!poItem) {
        throw new Error(`PO Item with ID ${rxItem.poItemId} does not belong to this Purchase Order.`);
      }

      // Check overflow
      const remainingToReceive = poItem.quantityOrdered - poItem.quantityReceived;
      if (rxItem.receivedQty > remainingToReceive) {
        throw new Error(`Cannot receive more than ordered. Remaining: ${remainingToReceive}, Attempted: ${rxItem.receivedQty}`);
      }

      // Create Receipt Item Log
      await tx.goodsReceiptItem.create({
        data: {
          receiptId: receipt.id,
          poItemId: rxItem.poItemId,
          receivedQty: rxItem.receivedQty,
          rejectedQty: rxItem.rejectedQty || 0,
          damagedQty: rxItem.damagedQty || 0,
          reason: rxItem.reason,
        },
      });

      // Update PurchaseOrderItem received quantity
      await tx.purchaseOrderItem.update({
        where: { id: rxItem.poItemId },
        data: {
          quantityReceived: {
            increment: rxItem.receivedQty,
          },
        },
      });

      // Update InventoryItem quantity
      await tx.inventoryItem.update({
        where: { id: poItem.itemId },
        data: {
          quantity: {
            increment: rxItem.receivedQty,
          },
        },
      });

      // Register StockMovement transaction
      if (rxItem.receivedQty > 0) {
        await tx.stockMovement.create({
          data: {
            tenantId,
            branchId,
            itemId: poItem.itemId,
            quantity: rxItem.receivedQty,
            type: 'PURCHASE',
            referenceId: receipt.id,
          },
        });
      }
    }

    // 4. Update the Purchase Order status
    // Reload items to see new totals
    const updatedPOItems = await tx.purchaseOrderItem.findMany({
      where: { poId },
    });

    const allCompleted = updatedPOItems.every(item => item.quantityReceived === item.quantityOrdered);
    const anyReceived = updatedPOItems.some(item => item.quantityReceived > 0);

    let nextStatus = po.status;
    if (allCompleted) {
      nextStatus = 'COMPLETED';
    } else if (anyReceived) {
      nextStatus = 'PARTIALLY_RECEIVED';
    }

    await tx.purchaseOrder.update({
      where: { id: poId },
      data: {
        status: nextStatus,
      },
    });

    // 5. Auto-Generate Product Purchase Expense if completed
    if (nextStatus === 'COMPLETED') {
      await tx.expense.create({
        data: {
          tenantId,
          branchId,
          category: 'PRODUCTS',
          amount: po.totalAmount,
          description: `Auto-generated from completed Purchase Order ${po.poNumber}`,
          date: new Date(),
        },
      });
    }

    return receipt;
  });
}
