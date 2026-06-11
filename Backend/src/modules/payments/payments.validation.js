import { z } from 'zod';

const paymentMethodSchema = z.enum([
  'CASH',
  'UPI',
  'CARD',
  'WALLET',
  'BANK_TRANSFER',
  'RAZORPAY',
]);

const paymentStatusSchema = z.enum([
  'PENDING',
  'PARTIALLY_PAID',
  'PAID',
  'REFUNDED',
  'FAILED',
]);

export const createOrderSchema = z.object({
  appointmentId: z.string().uuid().optional(),
  customerId: z.string().uuid().optional(),
  amount: z.number().positive().optional(),
  paidAmount: z.number().nonnegative().optional(),
  paymentMethod: paymentMethodSchema.optional().default('RAZORPAY'),
  gateway: z.string().optional(),
  notes: z.string().max(500).optional(),
}).refine((value) => value.appointmentId || value.customerId, {
  message: 'Either appointmentId or customerId must be provided.',
});

export const verifyPaymentSchema = z.object({
  paymentId: z.string().uuid().optional(),
  orderId: z.string().min(1),
  signature: z.string().min(1),
  gatewayPaymentId: z.string().min(1).optional(),
});

export const refundPaymentSchema = z.object({
  paymentId: z.string().uuid(),
  amount: z.number().positive().optional(),
  reason: z.string().max(500).optional(),
});

export const paymentStatusUpdateSchema = z.object({
  paymentStatus: paymentStatusSchema.optional(),
  paymentMethod: paymentMethodSchema.optional(),
  paidAmount: z.number().nonnegative().optional(),
  transactionRef: z.string().max(255).optional(),
});

export const createCashfreeSessionSchema = z.object({
  appointmentId: z.string().uuid().optional(),
  customerId: z.string().uuid().optional(),
  amount: z.number().positive().optional(),
  paidAmount: z.number().nonnegative().optional(),
  returnUrl: z.string().url().optional(),
}).refine((value) => value.appointmentId || value.customerId, {
  message: 'Either appointmentId or customerId must be provided.',
});

