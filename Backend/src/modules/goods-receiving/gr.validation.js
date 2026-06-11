import { z } from 'zod';

export const createReceiptSchema = z.object({
  branchId: z.string().uuid('Invalid branch ID.'),
  poId: z.string().uuid('Invalid Purchase Order ID.'),
  notes: z.string().optional(),
  items: z.array(z.object({
    poItemId: z.string().uuid('Invalid PO Item ID.'),
    receivedQty: z.number().int().nonnegative('Received quantity must be non-negative.'),
    rejectedQty: z.number().int().nonnegative('Rejected quantity must be non-negative.').optional(),
    damagedQty: z.number().int().nonnegative('Damaged quantity must be non-negative.').optional(),
    reason: z.string().optional(),
  })).min(1, 'At least one received item is required.'),
});
