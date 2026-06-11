import { z } from 'zod';

export const createCustomerSchema = z.object({
  firstName: z.string().min(1, 'First name is required.'),
  lastName: z.string().min(1, 'Last name is required.'),
  email: z.string().email('Invalid email address.').optional().or(z.literal('')),
  phone: z.string().min(5, 'Phone number must be at least 5 digits.').optional().or(z.literal('')),
  notes: z.string().max(1000, 'Notes must be under 1000 characters.').optional(),
  tags: z.array(z.string()).default([]),
});

export const updateCustomerSchema = z.object({
  firstName: z.string().min(1, 'First name is required.').optional(),
  lastName: z.string().min(1, 'Last name is required.').optional(),
  email: z.string().email('Invalid email address.').optional().or(z.literal('')),
  phone: z.string().min(5, 'Phone number must be at least 5 digits.').optional().or(z.literal('')),
  notes: z.string().max(1000, 'Notes must be under 1000 characters.').optional(),
  tags: z.array(z.string()).optional(),
});
