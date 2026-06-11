import { z } from 'zod';

export const getSlotsSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format.'),
  serviceId: z.string().uuid('Invalid service ID.'),
  staffId: z.string().uuid('Invalid staff ID.').optional(),
});

export const createBookingSchema = z.object({
  customerId: z.string().uuid('Invalid customer ID.').optional(),
  customer: z.object({
    firstName: z.string().min(1, 'Customer first name is required.').max(100),
    lastName: z.string().min(1, 'Customer last name is required.').max(100),
    email: z.string().email('Invalid customer email.').optional(),
    phone: z.string().min(6, 'Customer phone is required.').max(20).optional(),
  }).optional(),
  serviceId: z.string().uuid('Invalid service ID.'),
  staffId: z.string().uuid('Invalid staff ID.'),
  startTime: z.string().datetime({ message: 'Invalid start time. Must be ISO-8601 string.' }),
  source: z.enum(['ADMIN', 'RECEPTION', 'WEBSITE', 'MOBILE', 'WHATSAPP']).optional(),
  notes: z.string().max(500, 'Notes must be less than 500 characters.').optional(),
}).refine((data) => data.customerId || data.customer, {
  message: 'Either customerId or customer details must be provided.',
});

export const updateBookingSchema = z.object({
  startTime: z.string().datetime({ message: 'Invalid start time. Must be ISO-8601 string.' }).optional(),
  status: z.enum(['BOOKED', 'PENDING', 'CONFIRMED', 'CHECKED_IN', 'ASSIGNED', 'CONSULTATION', 'IN_SERVICE', 'COMPLETED', 'BILLED', 'PAID', 'CANCELLED', 'NO_SHOW', 'RESCHEDULED']).optional(),
  notes: z.string().max(500, 'Notes must be less than 500 characters.').optional(),
});

export const bookingActionSchema = z.object({
  action: z.enum(['check-in', 'assign', 'accept', 'request-reassignment', 'start', 'complete', 'bill', 'mark-paid']),
  staffId: z.string().uuid('Invalid staff ID.').optional(),
  paymentMethod: z.enum(['CASH', 'UPI', 'CARD', 'CASHFREE']).optional(),
  reason: z.string().max(300).optional(),
});

export const addServiceSchema = z.object({
  serviceId: z.string().uuid('Invalid service ID.'),
});
