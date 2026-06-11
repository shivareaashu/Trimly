import redisClient from '../../config/redis.js';

/**
 * Emit website configuration changes.
 * 
 * @param {string} eventName
 * @param {Object} payload
 */
export async function emitWebsiteEvent(eventName, payload) {
  try {
    const message = JSON.stringify({
      event: eventName,
      timestamp: new Date().toISOString(),
      data: payload,
    });

    console.log(`📡 Website Event Dispatched [${eventName}]`);

    if (redisClient && redisClient.isOpen) {
      await redisClient.publish('website-events', message);
    }
  } catch (error) {
    console.error('Failed to emit website event:', error.message);
  }
}
export default emitWebsiteEvent;
