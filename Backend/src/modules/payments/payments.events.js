import crypto from 'crypto';
import redisClient from '../../config/redis.js';

export async function emitPaymentEvent(eventName, payload) {
  try {
    const message = JSON.stringify({
      event: eventName,
      timestamp: new Date().toISOString(),
      data: payload,
    });

    console.log(`Payment event dispatched [${eventName}]:`, payload?.id || payload?.paymentId || 'unknown');

    if (redisClient && redisClient.isOpen) {
      await redisClient.publish('payment-events', message);
    }
  } catch (error) {
    console.error('Failed to emit payment event:', error.message);
  }
}

export function verifyRazorpaySignature({ orderId, paymentId, signature, secret }) {
  if (!secret) {
    return false;
  }

  const expected = crypto
    .createHmac('sha256', secret)
    .update(`${orderId}|${paymentId}`)
    .digest('hex');

  return expected === signature;
}
