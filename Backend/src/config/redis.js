import { createClient } from 'redis';

const redisUrl = process.env.REDIS_URL;
let redisClient = null;
let redisDisabled = false;

function disableRedis(reason) {
  if (redisDisabled) return;
  redisDisabled = true;

  if (redisClient) {
    redisClient.removeAllListeners();
    redisClient = null;
  }

  console.warn(`Redis unavailable, caching disabled: ${reason}`);
}

if (process.env.NODE_ENV !== 'test' && redisUrl) {
  redisClient = createClient({
    url: redisUrl,
    socket: {
      reconnectStrategy: () => false,
    },
  });

  redisClient.on('error', (err) => {
    disableRedis(err.message);
  });

  redisClient.on('connect', () => {
    console.log('Redis client connected');
  });

  // Connect asynchronously but do not block startup.
  redisClient.connect().catch((err) => {
    disableRedis(err.message);
  });
} else if (process.env.NODE_ENV !== 'test') {
  console.info('Redis URL not configured, running without cache.');
}

export default redisClient;
