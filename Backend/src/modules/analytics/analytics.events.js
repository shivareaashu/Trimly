import redisClient from '../../config/redis.js';

/**
 * Emit events related to analytics (e.g. daily reports).
 * 
 * @param {string} eventName
 * @param {Object} payload
 */
export async function emitAnalyticsEvent(eventName, payload) {
  try {
    const message = JSON.stringify({
      event: eventName,
      timestamp: new Date().toISOString(),
      data: payload,
    });

    console.log(`📡 Analytics Event Dispatched [${eventName}]`);

    if (redisClient && redisClient.isOpen) {
      await redisClient.publish('analytics-events', message);
    }
  } catch (error) {
    console.error('Failed to emit analytics event:', error.message);
  }
}
