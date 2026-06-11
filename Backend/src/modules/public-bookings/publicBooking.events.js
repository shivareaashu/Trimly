import redisClient from '../../config/redis.js';

/**
 * Publishes a booking event to Redis for event-driven workflows.
 * 
 * @param {string} eventName - Type of event (e.g. 'booking.created', 'booking.cancelled')
 * @param {Object} payload - Event data payload
 */
export async function emitBookingEvent(eventName, payload) {
  try {
    const message = JSON.stringify({
      event: eventName,
      timestamp: new Date().toISOString(),
      data: payload,
    });

    console.log(`📡 Public Booking Event Dispatched [${eventName}]:`, payload.id);

    if (redisClient && redisClient.isOpen) {
      await redisClient.publish('booking-events', message);
    }
  } catch (error) {
    console.error('Failed to emit public booking event:', error.message);
  }
}
