import { z } from 'zod';

export const createCategorySchema = z.object({
  name: z.string().min(1, 'Category name is required.'),
});

export const updateCategorySchema = createCategorySchema.partial();

export const createItemSchema = z.object({
  branchId: z.string().uuid('Invalid branch ID.'),
  categoryId: z.string().uuid('Invalid category ID.').optional(),
  name: z.string().min(1, 'Item name is required.'),
  description: z.string().optional(),
  sku: z.string().optional(),
  quantity: z.number().int().nonnegative('Quantity must be a non-negative integer.').optional(),
  unit: z.string().optional(),
  reorderLevel: z.number().int().nonnegative('Reorder level must be a non-negative integer.').optional(),
  costPrice: z.number().nonnegative('Cost price must be a non-negative number.'),
  price: z.number().nonnegative('Retail price must be a non-negative number.'),
  expiryDate: z.string().datetime({ precision: 3 }).optional().or(z.string().transform(val => new Date(val).toISOString())),
});

export const updateItemSchema = createItemSchema.partial();

export const createAdjustmentSchema = z.object({
  branchId: z.string().uuid('Invalid branch ID.'),
  itemId: z.string().uuid('Invalid item ID.'),
  qtyChange: z.number().int('Quantity change must be an integer.'),
  type: z.enum(['MANUAL', 'DAMAGE', 'EXPIRY', 'THEFT', 'INTAKE']),
  reason: z.string().optional(),
});
