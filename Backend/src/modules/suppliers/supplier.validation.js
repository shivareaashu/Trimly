import { z } from 'zod';

export const createSupplierSchema = z.object({
  name: z.string().min(1, 'Supplier name is required.'),
  email: z.string().email('Invalid email address.').optional().or(z.literal('')),
  phone: z.string().optional(),
  address: z.string().optional(),
  gstNumber: z.string().optional(),
  outstandingBalance: z.number().optional(),
});

export const updateSupplierSchema = createSupplierSchema.partial();

export const createContactSchema = z.object({
  name: z.string().min(1, 'Representative name is required.'),
  email: z.string().email('Invalid email address.').optional().or(z.literal('')),
  phone: z.string().optional(),
  title: z.string().optional(),
});

export const updateContactSchema = createContactSchema.partial();

export const createDocumentSchema = z.object({
  name: z.string().min(1, 'Document name is required.'),
  url: z.string().url('Invalid URL format.'),
  fileType: z.string().optional(),
});
