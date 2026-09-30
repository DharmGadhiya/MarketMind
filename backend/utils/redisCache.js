import Redis from "ioredis";

// Custom retry strategy to prevent log flooding on connection failure
const retryStrategy = (times) => {
  if (times <= 3) {
    return times * 1000;
  }
  return 15000;
};

// In-memory cache fallback store
const memoryCache = new Map();

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
let redisClient = null;

if (redisUrl) {
  const redisOptions = {
    maxRetriesPerRequest: 3,
    lazyConnect: true,
    enableOfflineQueue: false,
    retryStrategy,
  };

  if (redisUrl.startsWith("rediss://")) {
    redisOptions.tls = {
      rejectUnauthorized: false,
    };
  }

  try {
    redisClient = new Redis(redisUrl, redisOptions);
    let hasLoggedError = false;

    redisClient.on("error", (err) => {
      if (!hasLoggedError) {
        console.warn("[Redis Cache] Client connection failed:", err.message);
        console.warn("[Redis Cache] In-memory cache active as fallback.");
        hasLoggedError = true;
      }
    });

    redisClient.on("ready", () => {
      console.log("[Redis Cache] Connected and ready.");
      hasLoggedError = false;
    });

    redisClient.connect().catch(() => {});
  } catch (err) {
    console.warn("[Redis Cache] Initialization error, falling back to in-memory:", err.message);
  }
}

/**
 * Fetch data from in-memory cache or Redis cache by key.
 */
export const getCache = async (key) => {
  // 1. Check in-memory cache first
  const memItem = memoryCache.get(key);
  if (memItem) {
    if (Date.now() < memItem.expiry) {
      return memItem.value;
    }
    // Don't immediately delete expired so getLastKnownCache can still use it if upstream fails
  }

  // 2. Fall back to Redis if ready
  if (redisClient && redisClient.status === "ready") {
    try {
      const data = await redisClient.get(key);
      if (data) {
        const parsed = JSON.parse(data);
        // Sync into memory cache for 60 seconds to reduce Redis network latency
        memoryCache.set(key, { value: parsed, expiry: Date.now() + 60000 });
        return parsed;
      }
    } catch (error) {
      console.error(`[Redis Get Error] Failed for key ${key}:`, error.message);
    }
  }

  return null;
};

/**
 * Get last known cached value even if expired (safety net for Yahoo 429 errors)
 */
export const getLastKnownCache = (key) => {
  const memItem = memoryCache.get(key);
  return memItem ? memItem.value : null;
};

/**
 * Store data in in-memory cache and Redis cache with an expiration time.
 */
export const setCache = async (key, value, expireSeconds = 300) => {
  // Always write to in-memory cache
  memoryCache.set(key, {
    value,
    expiry: Date.now() + expireSeconds * 1000,
  });

  // Also write to Redis if ready
  if (redisClient && redisClient.status === "ready") {
    try {
      await redisClient.set(key, JSON.stringify(value), "EX", expireSeconds);
    } catch (error) {
      console.error(`[Redis Set Error] Failed for key ${key}:`, error.message);
    }
  }
};

export default redisClient;
