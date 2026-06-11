import crypto from 'crypto';
import prisma from '../../config/db.js';
import { sendEmail, notificationTemplates } from '../../shared/services/notifications/notification.service.js';
import {
  createPayment,
  createTimelineEvent,
  createLoyaltyTransaction,
  findAppointmentForPayment,
  findOrCreateLoyaltyAccount,
  findPaymentByGatewayOrderId,
  findPaymentById,
  findPendingPaymentForAppointment,
  listPayments,
  listRecentPayments,
  updateCustomerMetrics,
  updatePayment,
} from './payments.repository.js';
import { emitPaymentEvent, verifyRazorpaySignature } from './payments.events.js';
import { createCashfreeOrder, verifyCashfreeWebhook, getCashfreeOrder } from './cashfree.service.js';


function toAmount(value) {
  const num = Number(value || 0);
  return Number.isFinite(num) ? Number(num.toFixed(2)) : 0;
}

function toAmountString(value) {
  return toAmount(value).toFixed(2);
}

function toIsoDate(date = new Date()) {
  return new Date(date).toISOString();
}

async function createRazorpayOrder({ amount, receipt, notes = {} }) {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  const apiBase = process.env.RAZORPAY_API_BASE || 'https://api.razorpay.com/v1';

  if (!keyId || !keySecret) {
    const mockOrderId = `order_mock_${crypto.randomUUID().replace(/-/g, '')}`;
    return {
      id: mockOrderId,
      amount: Math.round(amount * 100),
      currency: 'INR',
      receipt,
      status: 'created',
      notes,
      provider: 'mock',
    };
  }

  const response = await fetch(`${apiBase}/orders`, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${Buffer.from(`${keyId}:${keySecret}`).toString('base64')}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      amount: Math.round(amount * 100),
      currency: 'INR',
      receipt,
      notes,
    }),
  });

  if (!response.ok) {
    const payload = await response.text();
    throw new Error(`Failed to create Razorpay order: ${payload}`);
  }

  return response.json();
}

function getOrderSignature(orderId, paymentId, secret) {
  return crypto
    .createHmac('sha256', secret)
    .update(`${orderId}|${paymentId}`)
    .digest('hex');
}

async function ensureAppointmentContext(tenantId, data) {
  if (data.appointmentId) {
    const appointment = await findAppointmentForPayment(tenantId, data.appointmentId);
    if (!appointment) {
      throw new Error('Appointment not found.');
    }
    return appointment;
  }

  return null;
}

async function buildPaymentPayload(tenantId, data) {
  const appointment = await ensureAppointmentContext(tenantId, data);
  const baseAmount = data.amount ?? appointment?.service?.price;
  const amount = toAmount(baseAmount);
  const paidAmount = toAmount(data.paidAmount ?? 0);
  const customerId = data.customerId || appointment?.customerId || null;

  if (!customerId) {
    throw new Error('Customer is required to create a payment.');
  }

  if (amount <= 0) {
    throw new Error('Payment amount must be greater than zero.');
  }

  return {
    appointment,
    amount,
    paidAmount,
    customerId,
  };
}

async function settleCompletedPayment(tenantId, savedPayment, tx) {
  if (!savedPayment.customerId) {
    return savedPayment;
  }

  await updateCustomerMetrics(
    tenantId,
    savedPayment.customerId,
    {
      totalSpendingDelta: Number(savedPayment.amount),
      lastVisitAt: savedPayment.paidAt || new Date(),
    },
    tx
  );

  const timelineBase = {
    tenantId,
    customerId: savedPayment.customerId,
    appointmentId: savedPayment.appointmentId || null,
    paymentId: savedPayment.id,
  };

  await createTimelineEvent(tenantId, {
    ...timelineBase,
    eventType: 'payment.made',
    title: 'Payment made',
    description: `Payment of Rs. ${Number(savedPayment.amount).toFixed(2)} recorded as paid.`,
    amount: savedPayment.amount,
    referenceId: savedPayment.id,
    occurredAt: savedPayment.paidAt || new Date(),
  }, tx);

  const loyaltyAccount = await findOrCreateLoyaltyAccount(tenantId, savedPayment.customerId, tx);
  const earnedPoints = Math.max(0, Math.floor(Number(savedPayment.amount) * 0.1));

  if (earnedPoints > 0) {
    await createLoyaltyTransaction(tenantId, {
      loyaltyAccountId: loyaltyAccount.id,
      customerId: savedPayment.customerId,
      appointmentId: savedPayment.appointmentId || null,
      paymentId: savedPayment.id,
      transactionType: 'EARNED',
      points: earnedPoints,
      sourceAmount: savedPayment.amount,
      description: 'Points earned from payment collection.',
      metadata: {
        rule: 'Rs. 100 spent = 10 points',
        paymentId: savedPayment.id,
      },
    }, tx);

    await tx.loyaltyAccount.update({
      where: { id: loyaltyAccount.id },
      data: {
        pointsBalance: { increment: earnedPoints },
        lifetimePoints: { increment: earnedPoints },
      },
    });

    await createTimelineEvent(tenantId, {
      ...timelineBase,
      eventType: 'loyalty.earned',
      title: 'Loyalty points earned',
      description: `${earnedPoints} points earned from the payment.`,
      amount: savedPayment.amount,
      referenceId: loyaltyAccount.id,
      metadata: {
        pointsEarned: earnedPoints,
      },
    }, tx);
  }

  // Send payment receipt email asynchronously
  if (savedPayment.customerId) {
    (async () => {
      try {
        const [customer, tenant] = await Promise.all([
          prisma.customer.findUnique({ where: { id: savedPayment.customerId } }),
          prisma.tenant.findUnique({ where: { id: tenantId } })
        ]);
        let booking = null;
        if (savedPayment.appointmentId) {
          booking = await prisma.appointment.findUnique({ where: { id: savedPayment.appointmentId } });
        }

        if (customer && customer.email) {
          const template = notificationTemplates.paymentPaid(savedPayment, customer, booking, tenant);
          await sendEmail({
            to: customer.email,
            subject: template.subject,
            html: template.html,
            text: template.text
          });
        }
      } catch (err) {
        console.error('[Notification Service] Failed to send email during payment settlement:', err);
      }
    })();
  }

  return savedPayment;
}

export async function createOrder(tenantId, data) {
  const { appointment, amount, paidAmount, customerId } = await buildPaymentPayload(tenantId, data);
  const existingPayment = appointment
    ? await findPendingPaymentForAppointment(tenantId, appointment.id)
    : null;

  const order = await createRazorpayOrder({
    amount,
    receipt: `trimly_${tenantId}_${appointment?.id || customerId}_${Date.now()}`,
    notes: {
      tenantId,
      appointmentId: appointment?.id || '',
      customerId,
      source: 'trimly',
    },
  });

  const paymentRecord = {
    appointmentId: appointment?.id || null,
    customerId,
    amount: toAmountString(amount),
    paidAmount: toAmountString(paidAmount),
    status: 'PENDING',
    method: data.paymentMethod || 'RAZORPAY',
    paymentStatus: 'PENDING',
    paymentMethod: data.paymentMethod || 'RAZORPAY',
    gateway: data.gateway || 'RAZORPAY',
    gatewayOrderId: order.id,
    gatewayPaymentId: null,
    transactionRef: null,
    paidAt: null,
    currency: 'INR',
  };

  const payment = existingPayment
    ? await updatePayment(tenantId, existingPayment.id, paymentRecord)
    : await createPayment(tenantId, paymentRecord);

  await emitPaymentEvent('payment.order.created', payment);

  return {
    payment,
    order,
    publicKey: process.env.RAZORPAY_KEY_ID || null,
    provider: order.provider || 'razorpay',
    needsRedirect: payment.paymentMethod === 'RAZORPAY',
  };
}

export async function updatePaymentRecord(tenantId, paymentId, data) {
  return updatePayment(tenantId, paymentId, data);
}

export async function verifyPayment(tenantId, data) {
  const secret = process.env.RAZORPAY_KEY_SECRET;
  const payment = data.paymentId
    ? await findPaymentById(tenantId, data.paymentId)
    : await findPaymentByGatewayOrderId(tenantId, data.orderId);

  if (!payment) {
    throw new Error('Payment record not found.');
  }

  if (!secret) {
    throw new Error('Razorpay secret is not configured.');
  }

  const gatewayPaymentId = data.gatewayPaymentId || data.paymentId || payment.gatewayPaymentId || crypto.randomUUID();
  const signatureValid = verifyRazorpaySignature({
    orderId: data.orderId,
    paymentId: gatewayPaymentId,
    signature: data.signature,
    secret,
  });

  if (!signatureValid) {
    throw new Error('Invalid payment signature.');
  }

  const updatedPayment = await prisma.$transaction(async (tx) => {
    const paidAmount = toAmountString(payment.amount);
    const savedPayment = await updatePayment(tenantId, payment.id, {
      status: 'PAID',
      paymentStatus: 'PAID',
      method: payment.method || payment.paymentMethod,
      paymentMethod: payment.paymentMethod || payment.method,
      gateway: payment.gateway || 'RAZORPAY',
      gatewayOrderId: data.orderId,
      gatewayPaymentId,
      transactionRef: `${data.orderId}:${gatewayPaymentId}`,
      paidAmount,
      paidAt: new Date(),
    }, tx);

    await settleCompletedPayment(tenantId, savedPayment, tx);
    return savedPayment;
  });

  await emitPaymentEvent('payment.paid', updatedPayment);

  return updatedPayment;
}

export async function refundPayment(tenantId, data) {
  const payment = await findPaymentById(tenantId, data.paymentId);
  if (!payment) {
    throw new Error('Payment record not found.');
  }

  const refundAmount = toAmountString(data.amount || payment.amount);

  const updatedPayment = await updatePayment(tenantId, payment.id, {
    status: 'REFUNDED',
    paymentStatus: 'REFUNDED',
    paidAmount: '0.00',
    transactionRef: payment.transactionRef || null,
    paidAt: payment.paidAt || new Date(),
  });

  await createTimelineEvent(tenantId, {
    customerId: payment.customerId,
    appointmentId: payment.appointmentId || null,
    paymentId: payment.id,
    eventType: 'payment.refunded',
    title: 'Payment refunded',
    description: `Refund processed for Rs. ${refundAmount}.`,
    amount: refundAmount,
    referenceId: payment.id,
    occurredAt: new Date(),
  });

  await emitPaymentEvent('payment.refunded', updatedPayment);

  return updatedPayment;
}

export async function getPayment(tenantId, paymentId) {
  const payment = await findPaymentById(tenantId, paymentId);
  if (!payment) {
    throw new Error('Payment not found.');
  }
  return payment;
}

export async function getPaymentList(tenantId, filters = {}) {
  return listPayments(tenantId, filters);
}

export async function handleRazorpayWebhook(tenantId, payload, signature) {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET || process.env.RAZORPAY_KEY_SECRET;
  if (!secret) {
    throw new Error('Razorpay webhook secret is not configured.');
  }

  const bodyString = Buffer.isBuffer(payload) ? payload.toString('utf8') : JSON.stringify(payload);
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(bodyString)
    .digest('hex');

  if (expectedSignature !== signature) {
    throw new Error('Invalid webhook signature.');
  }

  const body = typeof payload === 'string'
    ? JSON.parse(payload)
    : Buffer.isBuffer(payload)
      ? JSON.parse(payload.toString('utf8'))
      : payload;

  const event = body?.event || body?.payload?.payment?.entity?.status;
  const paymentEntity = body?.payload?.payment?.entity;

  if (body?.event === 'payment.captured' && paymentEntity?.order_id) {
    const existing = await findPaymentByGatewayOrderId(tenantId, paymentEntity.order_id);

    if (existing) {
      const updatedPayment = await prisma.$transaction(async (tx) => {
        const savedPayment = await updatePayment(tenantId, existing.id, {
        status: 'PAID',
        paymentStatus: 'PAID',
        paymentMethod: existing.paymentMethod || existing.method || 'RAZORPAY',
        method: existing.method || existing.paymentMethod || 'RAZORPAY',
        gateway: existing.gateway || 'RAZORPAY',
        gatewayOrderId: paymentEntity.order_id,
        gatewayPaymentId: paymentEntity.id,
        transactionRef: `${paymentEntity.order_id}:${paymentEntity.id}`,
        paidAmount: toAmountString(existing.amount),
        paidAt: new Date(),
        }, tx);

        await settleCompletedPayment(tenantId, savedPayment, tx);
        return savedPayment;
      });

      await emitPaymentEvent('payment.paid', updatedPayment);
      return {
        processed: true,
        payment: updatedPayment,
      };
    }
  }

  return {
    received: true,
    event,
    processedAt: toIsoDate(),
  };
}

export async function createCashfreeSession(tenantId, data) {
  const { appointment, amount, paidAmount, customerId } = await buildPaymentPayload(tenantId, data);
  
  const customer = await prisma.customer.findFirst({
    where: { tenantId, id: customerId }
  });
  
  const customerName = customer ? `${customer.firstName} ${customer.lastName}`.trim() : 'Guest';
  const customerEmail = customer?.email || 'guest@trimly.in';
  const customerPhone = customer?.phone || '9999999999';

  const orderId = `CF_${tenantId.slice(0, 8)}_${crypto.randomUUID().slice(0, 12)}`.toUpperCase();

  const cfOrder = await createCashfreeOrder({
    orderId,
    amount,
    customerId,
    customerName,
    customerEmail,
    customerPhone,
    returnUrl: data.returnUrl
  });

  const paymentRecord = {
    appointmentId: appointment?.id || null,
    customerId,
    amount: toAmountString(amount),
    paidAmount: toAmountString(paidAmount),
    status: 'PENDING',
    method: 'CASHFREE',
    paymentStatus: 'PENDING',
    paymentMethod: 'CASHFREE',
    gateway: 'CASHFREE',
    gatewayOrderId: orderId,
    gatewayPaymentId: null,
    transactionRef: null,
    paidAt: null,
    currency: 'INR',
  };

  const payment = await createPayment(tenantId, paymentRecord);
  await emitPaymentEvent('payment.order.created', payment);

  return {
    payment,
    orderId,
    paymentSessionId: cfOrder.payment_session_id,
    cfOrderId: cfOrder.cf_order_id,
    provider: cfOrder.provider || 'cashfree',
  };
}

export async function processCashfreeWebhook(tenantId, payload, signature, rawBody) {
  const signatureValid = verifyCashfreeWebhook(signature, rawBody);
  if (!signatureValid) {
    throw new Error('Invalid Cashfree webhook signature.');
  }

  const eventType = payload.type;
  const orderDetails = payload.data?.order;
  const paymentDetails = payload.data?.payment;

  if (eventType === 'PAYMENT_SUCCESS_WEBHOOK' && orderDetails?.order_id && paymentDetails?.payment_status === 'SUCCESS') {
    const existing = await findPaymentByGatewayOrderId(tenantId, orderDetails.order_id);
    if (existing && existing.status !== 'PAID') {
      const updatedPayment = await prisma.$transaction(async (tx) => {
        const savedPayment = await updatePayment(tenantId, existing.id, {
          status: 'PAID',
          paymentStatus: 'PAID',
          paymentMethod: 'CASHFREE',
          method: 'CASHFREE',
          gateway: 'CASHFREE',
          gatewayOrderId: orderDetails.order_id,
          gatewayPaymentId: String(paymentDetails.cf_payment_id),
          transactionRef: `${orderDetails.order_id}:${paymentDetails.cf_payment_id}`,
          paidAmount: toAmountString(existing.amount),
          paidAt: new Date(),
        }, tx);

        if (savedPayment.appointmentId) {
          await tx.appointment.update({
            where: { id: savedPayment.appointmentId },
            data: { status: 'CONFIRMED' },
          });
        }

        await settleCompletedPayment(tenantId, savedPayment, tx);
        return savedPayment;
      });

      await emitPaymentEvent('payment.paid', updatedPayment);
      return {
        processed: true,
        payment: updatedPayment,
      };
    }
  }

  return {
    received: true,
    eventType,
    processedAt: toIsoDate(),
  };
}

export async function verifyCashfreePayment(tenantId, orderId) {
  const cfOrder = await getCashfreeOrder(orderId);
  const payment = await findPaymentByGatewayOrderId(tenantId, orderId);
  if (!payment) {
    throw new Error('Payment record not found.');
  }

  if (cfOrder.order_status === 'PAID') {
    if (payment.status !== 'PAID') {
      const updatedPayment = await prisma.$transaction(async (tx) => {
        const savedPayment = await updatePayment(tenantId, payment.id, {
          status: 'PAID',
          paymentStatus: 'PAID',
          paymentMethod: 'CASHFREE',
          method: 'CASHFREE',
          gateway: 'CASHFREE',
          gatewayOrderId: orderId,
          gatewayPaymentId: cfOrder.cf_order_id ? String(cfOrder.cf_order_id) : null,
          transactionRef: `${orderId}:${cfOrder.cf_order_id || 'paid'}`,
          paidAmount: toAmountString(payment.amount),
          paidAt: new Date(),
        }, tx);

        if (savedPayment.appointmentId) {
          await tx.appointment.update({
            where: { id: savedPayment.appointmentId },
            data: { status: 'CONFIRMED' },
          });
        }

        await settleCompletedPayment(tenantId, savedPayment, tx);
        return savedPayment;
      });

      await emitPaymentEvent('payment.paid', updatedPayment);
      return updatedPayment;
    }
  }

  return payment;
}


