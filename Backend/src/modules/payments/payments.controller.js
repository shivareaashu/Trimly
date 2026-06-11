import { z } from 'zod';
import {
  createOrderSchema,
  paymentStatusUpdateSchema,
  refundPaymentSchema,
  verifyPaymentSchema,
  createCashfreeSessionSchema,
} from './payments.validation.js';
import * as paymentsService from './payments.service.js';

function serializeError(error, fallback) {
  if (error instanceof z.ZodError) {
    return { status: 400, body: { errors: error.errors.map((err) => err.message) } };
  }
  return { status: error.statusCode || 400, body: { error: error.message || fallback } };
}

export async function handleCreateOrder(req, res) {
  try {
    const payload = createOrderSchema.parse(req.body);
    const result = await paymentsService.createOrder(req.tenant.id, payload);
    return res.status(201).json({
      message: 'Payment order created successfully.',
      ...result,
    });
  } catch (error) {
    const response = serializeError(error, 'Failed to create payment order.');
    return res.status(response.status).json(response.body);
  }
}

export async function handleVerifyPayment(req, res) {
  try {
    const payload = verifyPaymentSchema.parse(req.body);
    const payment = await paymentsService.verifyPayment(req.tenant.id, payload);
    return res.status(200).json({
      message: 'Payment verified successfully.',
      payment,
    });
  } catch (error) {
    const response = serializeError(error, 'Failed to verify payment.');
    return res.status(response.status).json(response.body);
  }
}

export async function handleRefundPayment(req, res) {
  try {
    const payload = refundPaymentSchema.parse(req.body);
    const payment = await paymentsService.refundPayment(req.tenant.id, payload);
    return res.status(200).json({
      message: 'Payment refunded successfully.',
      payment,
    });
  } catch (error) {
    const response = serializeError(error, 'Failed to refund payment.');
    return res.status(response.status).json(response.body);
  }
}

export async function handleGetPayment(req, res) {
  try {
    const payment = await paymentsService.getPayment(req.tenant.id, req.params.id);
    return res.status(200).json({ payment });
  } catch (error) {
    const response = serializeError(error, 'Failed to fetch payment.');
    return res.status(response.status).json(response.body);
  }
}

export async function handleListPayments(req, res) {
  try {
    const filters = {
      paymentStatus: req.query.paymentStatus,
      customerId: req.query.customerId,
      appointmentId: req.query.appointmentId,
      status: req.query.status,
    };
    const payments = await paymentsService.getPaymentList(req.tenant.id, filters);
    return res.status(200).json({ payments });
  } catch (error) {
    const response = serializeError(error, 'Failed to list payments.');
    return res.status(response.status).json(response.body);
  }
}

export async function handleWebhook(req, res) {
  try {
    const signature = req.headers['x-razorpay-signature'] || req.headers['x-razorpay-webhook-signature'];
    if (!signature) {
      return res.status(400).json({ error: 'Missing Razorpay signature.' });
    }

    const result = await paymentsService.handleRazorpayWebhook(req.tenant.id, req.body, signature);
    return res.status(200).json({
      message: 'Webhook processed.',
      result,
    });
  } catch (error) {
    const response = serializeError(error, 'Webhook processing failed.');
    return res.status(response.status).json(response.body);
  }
}

export async function handleUpdatePaymentStatus(req, res) {
  try {
    const payload = paymentStatusUpdateSchema.parse(req.body);
    const payment = await paymentsService.updatePaymentRecord(req.tenant.id, req.params.id, payload);
    return res.status(200).json({
      message: 'Payment updated successfully.',
      payment,
    });
  } catch (error) {
    const response = serializeError(error, 'Failed to update payment.');
    return res.status(response.status).json(response.body);
  }
}

export async function handleCreateCashfreeSession(req, res) {
  try {
    const payload = createCashfreeSessionSchema.parse(req.body);
    const result = await paymentsService.createCashfreeSession(req.tenant.id, payload);
    return res.status(201).json({
      message: 'Cashfree session created successfully.',
      ...result,
    });
  } catch (error) {
    const response = serializeError(error, 'Failed to create Cashfree session.');
    return res.status(response.status).json(response.body);
  }
}

export async function handleCashfreeWebhook(req, res) {
  try {
    const signature = req.headers['x-webhook-signature'];
    if (!signature) {
      return res.status(400).json({ error: 'Missing Cashfree webhook signature.' });
    }

    const rawBody = req.rawBody || JSON.stringify(req.body);
    const result = await paymentsService.processCashfreeWebhook(
      req.tenant.id,
      req.body,
      signature,
      rawBody
    );
    return res.status(200).json({
      message: 'Webhook processed.',
      result,
    });
  } catch (error) {
    const response = serializeError(error, 'Webhook processing failed.');
    return res.status(response.status).json(response.body);
  }
}

export async function handleGetCashfreeStatus(req, res) {
  try {
    const { orderId } = req.params;
    if (!orderId) {
      return res.status(400).json({ error: 'Order ID is required.' });
    }

    const payment = await paymentsService.verifyCashfreePayment(req.tenant.id, orderId);
    return res.status(200).json({
      message: 'Cashfree payment checked successfully.',
      payment,
    });
  } catch (error) {
    const response = serializeError(error, 'Failed to check Cashfree payment status.');
    return res.status(response.status).json(response.body);
  }
}


