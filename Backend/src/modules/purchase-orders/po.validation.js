import { z } from 'zod';

export const createPOSchema = z.object({
  branchId: z.string().uuid('Invalid branch ID.'),
  supplierId: z.string().uuid('Invalid supplier ID.'),
  poNumber: z.string().min(1, 'Purchase Order number is required.'),
  notes: z.string().optional(),
  items: z.array(z.object({
    itemId: z.string().uuid('Invalid item ID.'),
    quantityOrdered: z.number().int().positive('Quantity must be a positive integer.'),
    pricePerUnit: z.number().nonnegative('Price per unit must be non-negative.'),
  })).min(1, 'At least one purchase item is required.'),
});

export const updatePOSchema = z.object({
  status: z.enum(['DRAFT', 'APPROVED', 'SENT', 'PARTIALLY_RECEIVED', 'COMPLETED', 'CANCELLED']).optional(),
  notes: z.string().optional(),
  items: z.array(z.object({
    itemId: z.string().uuid('Invalid item ID.'),
    quantityOrdered: z.number().int().positive('Quantity must be a positive integer.'),
    pricePerUnit: z.number().nonnegative('Price per unit must be non-negative.'),
  })).optional(),
});
