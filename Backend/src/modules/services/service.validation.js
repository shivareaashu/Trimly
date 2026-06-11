import { z } from 'zod';

export const createCategorySchema = z.object({
  name: z.string().min(1, 'Category name is required.'),
  order: z.number().int().optional(),
});

export const updateCategorySchema = createCategorySchema.partial();

export const createServiceSchema = z.object({
  categoryId: z.string().uuid('Invalid category ID.').optional().nullable(),
  name: z.string().min(1, 'Service name is required.'),
  description: z.string().optional().nullable(),
  price: z.number().nonnegative('Price must be a non-negative number.'),
  duration: z.number().int().positive('Duration must be a positive integer.'),
  bufferTime: z.number().int().nonnegative().optional(),
  revisitAfterDays: z.number().int().positive().optional(),
  isActive: z.boolean().optional(),
});

export const updateServiceSchema = createServiceSchema.partial();

export const createAddonSchema = z.object({
  name: z.string().min(1, 'Addon name is required.'),
  description: z.string().optional(),
  price: z.number().nonnegative('Price must be a non-negative number.'),
  duration: z.number().int().positive('Duration must be a positive integer.'),
  isActive: z.boolean().optional(),
});

export const updateAddonSchema = createAddonSchema.partial();

export const createBundleSchema = z.object({
  name: z.string().min(1, 'Bundle name is required.'),
  description: z.string().optional(),
  price: z.number().nonnegative('Price must be a non-negative number.'),
  serviceIds: z.array(z.string()).min(1, 'At least one service ID is required for a bundle.'),
  isActive: z.boolean().optional(),
});

export const updateBundleSchema = createBundleSchema.partial();
