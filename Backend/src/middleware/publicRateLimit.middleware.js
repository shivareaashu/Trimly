import redisClient from '../config/redis.js';

// Fallback in-memory rate limiter store for development/testing if Redis is unavailable
const memoryStore = new Map();

/**
 * Middleware to rate limit public bookings (e.g., 5 bookings/min per IP)
 */
export async function publicRateLimit(req, res, next) {
  const ip = req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown';
  const key = `booking-rate:${ip}`;
  const LIMIT = 5;
  const WINDOW_SECONDS = 60;

  // Check if Redis is running and connected
  if (redisClient && redisClient.isOpen) {
    try {
      const current = await redisClient.get(key);
      const requestCount = current ? parseInt(current, 10) : 0;

      if (requestCount >= LIMIT) {
        return res.status(429).json({
          error: 'Too many booking attempts. Please try again after a minute.',
        });
      }

      // Increment count
      const newCount = requestCount + 1;
      await redisClient.set(key, newCount.toString(), {
        EX: WINDOW_SECONDS,
      });

      // Also set headers
      res.setHeader('X-RateLimit-Limit', LIMIT);
      res.setHeader('X-RateLimit-Remaining', Math.max(0, LIMIT - newCount));
      
      return next();
    } catch (err) {
      console.warn('⚠️ Redis Rate Limiter Error, falling back to in-memory:', err.message);
      // Fall through to in-memory fallback
    }
  }

  // In-Memory Fallback
  const now = Date.now();
  const record = memoryStore.get(ip);

  if (record) {
    // Check if window expired
    if (now - record.startTime > WINDOW_SECONDS * 1000) {
      memoryStore.set(ip, { count: 1, startTime: now });
      res.setHeader('X-RateLimit-Limit', LIMIT);
      res.setHeader('X-RateLimit-Remaining', LIMIT - 1);
      return next();
    }

    if (record.count >= LIMIT) {
      return res.status(429).json({
        error: 'Too many booking attempts. Please try again after a minute.',
      });
    }

    record.count += 1;
    res.setHeader('X-RateLimit-Limit', LIMIT);
    res.setHeader('X-RateLimit-Remaining', Math.max(0, LIMIT - record.count));
    return next();
  } else {
    memoryStore.set(ip, { count: 1, startTime: now });
    res.setHeader('X-RateLimit-Limit', LIMIT);
    res.setHeader('X-RateLimit-Remaining', LIMIT - 1);
    return next();
  }
}
