const redis = require('redis');

let redisClient = null;
let isConnected = false;

/**
 * Connect to Redis server
 * Implements client-side and server-side caching strategy
 */
const connectRedis = async () => {
  // Skip Redis if not configured
  if (!process.env.REDIS_HOST && !process.env.REDIS_URL) {
    console.log('[Skip] Redis not configured - caching disabled');
    return null;
  }

  try {
    // Create Redis client
    const clientOptions = process.env.REDIS_URL 
      ? { url: process.env.REDIS_URL }
      : {
          socket: {
            host: process.env.REDIS_HOST || 'localhost',
            port: parseInt(process.env.REDIS_PORT) || 6379,
            reconnectStrategy: (retries) => {
              if (retries > 10) {
                console.error('[Redis] Max reconnection attempts reached');
                return new Error('Max reconnection attempts reached');
              }
              return retries * 100; // Exponential backoff
            }
          },
          password: process.env.REDIS_PASSWORD || undefined,
          database: parseInt(process.env.REDIS_DB) || 0
        };

    redisClient = redis.createClient(clientOptions);

    // Event handlers
    redisClient.on('error', (err) => {
      console.error('[Redis] Connection Error:', err.message);
      isConnected = false;
    });

    redisClient.on('connect', () => {
      console.log('[Redis] Connecting to Redis server...');
    });

    redisClient.on('ready', () => {
      console.log('[Redis] ✅ Redis Connected and Ready');
      isConnected = true;
    });

    redisClient.on('reconnecting', () => {
      console.log('[Redis] Reconnecting to Redis server...');
      isConnected = false;
    });

    redisClient.on('end', () => {
      console.log('[Redis] Connection closed');
      isConnected = false;
    });

    // Connect to Redis
    await redisClient.connect();

    return redisClient;

  } catch (error) {
    console.error('[Redis] Failed to connect:', error.message);
    console.log('[Skip] Continuing without Redis caching...');
    redisClient = null;
    isConnected = false;
    return null;
  }
};

/**
 * Get cached data from Redis
 * @param {string} key - Cache key
 * @returns {Promise<any|null>} Cached data or null
 */
const getCache = async (key) => {
  if (!redisClient || !isConnected) {
    return null;
  }

  try {
    const data = await redisClient.get(key);
    if (data) {
      console.log(`[Redis] Cache HIT: ${key}`);
      return JSON.parse(data);
    }
    console.log(`[Redis] Cache MISS: ${key}`);
    return null;
  } catch (error) {
    console.error('[Redis] Get cache error:', error.message);
    return null;
  }
};

/**
 * Set data in Redis cache
 * @param {string} key - Cache key
 * @param {any} value - Data to cache
 * @param {number} expiration - Expiration time in seconds (default: 3600)
 * @returns {Promise<boolean>} Success status
 */
const setCache = async (key, value, expiration = 3600) => {
  if (!redisClient || !isConnected) {
    return false;
  }

  try {
    await redisClient.setEx(key, expiration, JSON.stringify(value));
    console.log(`[Redis] Cache SET: ${key} (TTL: ${expiration}s)`);
    return true;
  } catch (error) {
    console.error('[Redis] Set cache error:', error.message);
    return false;
  }
};

/**
 * Delete cached data from Redis
 * @param {string} key - Cache key
 * @returns {Promise<boolean>} Success status
 */
const deleteCache = async (key) => {
  if (!redisClient || !isConnected) {
    return false;
  }

  try {
    await redisClient.del(key);
    console.log(`[Redis] Cache DELETED: ${key}`);
    return true;
  } catch (error) {
    console.error('[Redis] Delete cache error:', error.message);
    return false;
  }
};

/**
 * Delete all cached data matching a pattern
 * @param {string} pattern - Pattern to match (e.g., 'user:*')
 * @returns {Promise<number>} Number of keys deleted
 */
const deleteCachePattern = async (pattern) => {
  if (!redisClient || !isConnected) {
    return 0;
  }

  try {
    const keys = await redisClient.keys(pattern);
    if (keys.length > 0) {
      await redisClient.del(keys);
      console.log(`[Redis] Cache DELETED: ${keys.length} keys matching '${pattern}'`);
      return keys.length;
    }
    return 0;
  } catch (error) {
    console.error('[Redis] Delete pattern error:', error.message);
    return 0;
  }
};

/**
 * Check if Redis is connected
 * @returns {boolean} Connection status
 */
const isRedisConnected = () => {
  return isConnected && redisClient !== null;
};

/**
 * Get Redis client instance
 * @returns {object|null} Redis client
 */
const getRedisClient = () => {
  return redisClient;
};

/**
 * Close Redis connection
 */
const closeRedis = async () => {
  if (redisClient) {
    try {
      await redisClient.quit();
      console.log('[Redis] Connection closed gracefully');
      isConnected = false;
      redisClient = null;
    } catch (error) {
      console.error('[Redis] Error closing connection:', error.message);
    }
  }
};

// Graceful shutdown
process.on('SIGINT', async () => {
  await closeRedis();
  process.exit(0);
});

module.exports = {
  connectRedis,
  getCache,
  setCache,
  deleteCache,
  deleteCachePattern,
  isRedisConnected,
  getRedisClient,
  closeRedis
};
