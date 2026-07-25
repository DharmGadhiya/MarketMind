import Redis from "ioredis";

// Custom retry strategy to prevent log flooding on connection failure
const retryStrategy = (times) => {
  if (times <= 3) {
    return times * 1000;
  }
  return 15000;
};

// Auto-detect Upstash and secure connection details
const getRedisUrl = () => {
  const url = process.env.REDIS_URL;
  if (!url) return "";
  if (url.includes("upstash.io") && url.startsWith("redis://")) {
    return url.replace("redis://", "rediss://");
  }
  return url;
};

const redisUrl = getRedisUrl();
const redisOptions = {
  maxRetriesPerRequest: 3,
  lazyConnect: true,
  enableOfflineQueue: false, // Don't queue commands when offline
  retryStrategy,
};

// Enable SSL/TLS encryption options if using a secure URL
if (redisUrl.startsWith("rediss://")) {
  redisOptions.tls = {
    rejectUnauthorized: false,
  };
}

// Instantiate the Redis client
const redisClient = new Redis(redisUrl, redisOptions);

let hasLoggedError = false;

// Handle connection/error events gracefully to prevent crashing and rate-limit logs
redisClient.on("error", (err) => {
  if (!hasLoggedError) {
    console.error("[Redis Cache Error] Client connection failed:", err.message);
    console.warn("[Redis Cache] Cache is now disabled. Falling back to live queries.");
    hasLoggedError = true;
  }
});

redisClient.on("ready", () => {
  console.log("[Redis Cache] Connected and ready.");
  hasLoggedError = false;
});

redisClient.on("end", () => {
  if (!hasLoggedError) {
    console.warn("[Redis Cache] Connection closed.");
    hasLoggedError = true;
  }
});

// Trigger connection
redisClient.connect().catch((err) => {
  // handled by error listener
});

/**
 * Fetch data from Redis cache by key.
 * Checks if Redis is ready before attempting query.
 * @param {string} key 
 * @returns {Promise<any|null>} Parsed JSON value or null
 */
export const getCache = async (key) => {
  if (redisClient.status !== "ready") {
    return null; // Silent fallback when Redis is offline
  }
  try {
    const data = await redisClient.get(key);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error(`[Redis Get Error] Failed for key ${key}:`, error.message);
    return null;
  }
};

/**
 * Store data in Redis cache with an expiration time.
 * Checks if Redis is ready before attempting query.
 * @param {string} key 
 * @param {any} value 
 * @param {number} expireSeconds Cache duration in seconds (default 300 seconds / 5 minutes)
 */
export const setCache = async (key, value, expireSeconds = 300) => {
  if (redisClient.status !== "ready") {
    return; // Silent fallback when Redis is offline
  }
  try {
    await redisClient.set(key, JSON.stringify(value), "EX", expireSeconds);
  } catch (error) {
    console.error(`[Redis Set Error] Failed for key ${key}:`, error.message);
  }
};

export default redisClient;
