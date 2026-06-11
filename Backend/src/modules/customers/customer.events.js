import redisClient from '../../config/redis.js';

/**
 * Emit events related to the customer lifecycle (e.g. tag additions, spend updates).
 * 
 * @param {string} eventName
 * @param {Object} payload
 */
export async function emitCustomerEvent(eventName, payload) {
  try {
    const message = JSON.stringify({
      event: eventName,
      timestamp: new Date().toISOString(),
      data: payload,
    });

    console.log(`📡 Customer Event Dispatched [${eventName}]:`, payload.id);

    if (redisClient && redisClient.isOpen) {
      await redisClient.publish('customer-events', message);
    }
  } catch (error) {
    console.error('Failed to emit customer event:', error.message);
  }
}
