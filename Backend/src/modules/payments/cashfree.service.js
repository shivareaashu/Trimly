import crypto from 'crypto';

const CASHFREE_ENV = process.env.CASHFREE_ENV || 'development';
const CASHFREE_APP_ID = process.env.CASHFREE_APP_ID;
const CASHFREE_SECRET_KEY = process.env.CASHFREE_SECRET_KEY;
const API_BASE = CASHFREE_ENV === 'production' 
  ? 'https://api.cashfree.com/pg' 
  : 'https://sandbox.cashfree.com/pg';

/**
 * Creates a Cashfree payment order.
 * 
 * @param {Object} params
 * @param {string} params.orderId
 * @param {number} params.amount
 * @param {string} params.customerId
 * @param {string} params.customerName
 * @param {string} params.customerEmail
 * @param {string} params.customerPhone
 * @param {string} params.returnUrl
 */
export async function createCashfreeOrder({
  orderId,
  amount,
  customerId,
  customerName = 'Guest',
  customerEmail = 'guest@trimly.in',
  customerPhone = '9999999999',
  returnUrl
}) {
  if (!CASHFREE_APP_ID || !CASHFREE_SECRET_KEY) {
    // Return mock order details if keys are missing
    console.warn('Cashfree credentials missing. Returning mock session.');
    return {
      order_id: orderId,
      order_status: 'ACTIVE',
      payment_session_id: `session_mock_${crypto.randomUUID().replace(/-/g, '')}`,
      cf_order_id: `cf_mock_${Date.now()}`,
      order_amount: amount,
      order_currency: 'INR',
      provider: 'mock'
    };
  }

  // Clean phone number for Cashfree requirements (must be 10 digits without spaces or leading +91 for standard customer logs)
  let cleanPhone = customerPhone.replace(/\D/g, '');
  if (cleanPhone.length > 10) {
    cleanPhone = cleanPhone.slice(-10);
  }
  if (cleanPhone.length < 10) {
    cleanPhone = '9999999999'; // fallback to standard valid placeholder
  }

  const response = await fetch(`${API_BASE}/orders`, {
    method: 'POST',
    headers: {
      'x-client-id': CASHFREE_APP_ID,
      'x-client-secret': CASHFREE_SECRET_KEY,
      'x-api-version': '2023-08-01',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      order_id: orderId,
      order_amount: Number(amount.toFixed(2)),
      order_currency: 'INR',
      customer_details: {
        customer_id: customerId,
        customer_name: customerName,
        customer_email: customerEmail,
        customer_phone: cleanPhone
      },
      order_meta: {
        return_url: returnUrl || `https://trimly.in/booking/confirm?order_id={order_id}`
      }
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Cashfree order creation failed: ${errorText}`);
  }

  return response.json();
}

/**
 * Gets payment details for a specific order.
 * 
 * @param {string} orderId 
 */
export async function getCashfreeOrder(orderId) {
  if (!CASHFREE_APP_ID || !CASHFREE_SECRET_KEY) {
    return {
      order_id: orderId,
      order_status: 'PAID',
      order_amount: 100.00
    };
  }

  const response = await fetch(`${API_BASE}/orders/${orderId}`, {
    method: 'GET',
    headers: {
      'x-client-id': CASHFREE_APP_ID,
      'x-client-secret': CASHFREE_SECRET_KEY,
      'x-api-version': '2023-08-01',
      'Content-Type': 'application/json',
    }
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Cashfree order retrieval failed: ${errorText}`);
  }

  return response.json();
}

/**
 * Verifies the signature of a Cashfree webhook payload.
 * 
 * @param {string} signature - Received webhook signature (from header or body)
 * @param {string} rawBody - Raw text request body of the webhook
 * @returns {boolean}
 */
export function verifyCashfreeWebhook(signature, rawBody) {
  if (!CASHFREE_SECRET_KEY) {
    return true; // Auto-pass in mock mode
  }
  
  const computedSignature = crypto
    .createHmac('sha256', CASHFREE_SECRET_KEY)
    .update(rawBody)
    .digest('base64');
    
  return computedSignature === signature;
}
