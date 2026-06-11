import { z } from 'zod';

export const getSlotsSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format.'),
  serviceId: z.string().uuid('Invalid service ID.'),
  staffId: z.string().uuid('Invalid staff ID.').optional(),
});

export const holdSlotSchema = z.object({
  serviceId: z.string().uuid('Invalid service ID.'),
  staffId: z.string().uuid('Invalid staff ID.'),
  startTime: z.string().datetime({ message: 'Invalid start time. Must be ISO-8601 string.' }),
});

export const createPublicBookingSchema = z.object({
  serviceId: z.string().uuid('Invalid service ID.'),
  staffId: z.string().uuid('Invalid staff ID.'),
  startTime: z.string().datetime({ message: 'Invalid start time. Must be ISO-8601 string.' }),
  holdToken: z.string().optional(),
  customer: z.object({
    firstName: z.string().trim().min(1, 'First name is required.'),
    lastName: z.string().trim().min(1, 'Last name is required.'),
    email: z.string().trim().email('Invalid email address.').optional().or(z.literal('')),
    phone: z.string().trim().min(5, 'Phone number must be at least 5 digits.'),
  }),
  notes: z.string().max(500, 'Notes must be less than 500 characters.').optional(),
  // Honeypot field - must be empty/falsy to pass bot detection
  botField: z.string().max(100).optional(),
});
