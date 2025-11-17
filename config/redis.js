const redis = require('redis');

let redisClient = null;

const connectRedis = async () => {
  // Skip Redis if not configured
  if (!process.env.REDIS_HOST) {
    console.log('⏭️  Redis not configured - caching disabled');
    return;
  }

  try {
    redisClient = redis.createClient({
      socket: {
        host: process.env.REDIS_HOST || 'localhost',
        port: process.env.REDIS_PORT || 6379
      },
      password: process.env.REDIS_PASSWORD || undefined,
      database: process.env.REDIS_DB || 0
    });

    redisClient.on('error', (err) => {
      console.error('❌ Redis Client Error:', err);
    });

    redisClient.on('connect', () => {
      console.log('🔗 Redis Connected');
    });

    redisClient.on('ready', () => {
      console.log('✅ Redis Ready to use');
    });

    redisClient.on('end', () => {
      console.log('🔌 Redis connection closed');
    });

    await redisClient.connect();

  } catch (error) {
    console.error('❌ Redis connection failed:', error.message);
    console.log('⏭️  Continuing without Redis caching...');
    // Don't exit process, allow app to run without Redis caching
  }
};

// Cache utility functions
const getCache = async (key) => {
  try {
    if (!redisClient || !redisClient.isOpen) return null;
    const data = await redisClient.get(key);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('Redis get error:', error);
    return null;
  }
};

const setCache = async (key, value, expirationInSeconds = 3600) => {
  try {
    if (!redisClient || !redisClient.isOpen) return false;
    await redisClient.setEx(key, expirationInSeconds, JSON.stringify(value));
    return true;
  } catch (error) {
    console.error('Redis set error:', error);
    return false;
  }
};

const deleteCache = async (key) => {
  try {
    if (!redisClient || !redisClient.isOpen) return false;
    await redisClient.del(key);
    return true;
  } catch (error) {
    console.error('Redis delete error:', error);
    return false;
  }
};

const deleteCachePattern = async (pattern) => {
  try {
    if (!redisClient || !redisClient.isOpen) return false;
    const keys = await redisClient.keys(pattern);
    if (keys.length > 0) {
      await redisClient.del(keys);
    }
    return true;
  } catch (error) {
    console.error('Redis delete pattern error:', error);
    return false;
  }
};

module.exports = {
  connectRedis,
  redisClient: () => redisClient,
  getCache,
  setCache,
  deleteCache,
  deleteCachePattern
};
