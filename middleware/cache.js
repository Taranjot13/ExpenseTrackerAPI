const { getCache, setCache, deleteCache, deleteCachePattern } = require('../config/redis');

/**
 * Redis Cache Middleware
 * Implements server-side caching for API responses
 * 
 * Usage:
 * router.get('/expenses', cache(300), getExpenses);
 * 
 * @param {number} duration - Cache duration in seconds (default: 300)
 * @param {function} keyGenerator - Custom key generator function
 * @returns {function} Express middleware
 */
const cache = (duration = 300, keyGenerator = null) => {
  return async (req, res, next) => {
    // Skip caching for non-GET requests
    if (req.method !== 'GET') {
      return next();
    }

    try {
      // Generate cache key
      const cacheKey = keyGenerator 
        ? keyGenerator(req)
        : `cache:${req.user?._id || 'public'}:${req.originalUrl}`;

      // Try to get cached response
      const cachedData = await getCache(cacheKey);

      if (cachedData) {
        // Return cached response
        return res.status(200).json({
          ...cachedData,
          cached: true,
          cacheKey
        });
      }

      // Store original res.json function
      const originalJson = res.json.bind(res);

      // Override res.json to cache the response
      res.json = function(data) {
        // Only cache successful responses
        if (res.statusCode === 200 && data.success !== false) {
          setCache(cacheKey, data, duration).catch(err => {
            console.error('[Cache Middleware] Error setting cache:', err);
          });
        }
        return originalJson(data);
      };

      next();

    } catch (error) {
      console.error('[Cache Middleware] Error:', error.message);
      // Continue without caching on error
      next();
    }
  };
};

/**
 * Invalidate cache for specific user
 * @param {string} userId - User ID
 * @param {string} resource - Resource type (e.g., 'expenses', 'categories')
 */
const invalidateUserCache = async (userId, resource = '*') => {
  try {
    const pattern = `cache:${userId}:*${resource}*`;
    await deleteCachePattern(pattern);
  } catch (error) {
    console.error('[Cache] Error invalidating user cache:', error.message);
  }
};

/**
 * Invalidate specific cache key
 * @param {string} key - Cache key
 */
const invalidateCache = async (key) => {
  try {
    await deleteCache(key);
  } catch (error) {
    console.error('[Cache] Error invalidating cache:', error.message);
  }
};

/**
 * Cache invalidation middleware for mutations
 * Automatically invalidates cache after POST, PUT, PATCH, DELETE
 * 
 * Usage:
 * router.post('/expenses', authenticate, invalidateCacheAfter('expenses'), createExpense);
 * 
 * @param {string} resource - Resource type to invalidate
 * @returns {function} Express middleware
 */
const invalidateCacheAfter = (resource) => {
  return async (req, res, next) => {
    // Store original res.json function
    const originalJson = res.json.bind(res);

    // Override res.json to invalidate cache after response
    res.json = function(data) {
      // Invalidate cache on successful mutations
      if (res.statusCode >= 200 && res.statusCode < 300) {
        invalidateUserCache(req.user?._id, resource).catch(err => {
          console.error('[Cache Middleware] Error invalidating cache:', err);
        });
      }
      return originalJson(data);
    };

    next();
  };
};

/**
 * Generate cache key for user-specific resources
 * @param {object} req - Express request object
 * @returns {string} Cache key
 */
const generateUserCacheKey = (req) => {
  const userId = req.user?._id || 'public';
  const queryString = JSON.stringify(req.query);
  return `cache:${userId}:${req.path}:${queryString}`;
};

/**
 * Generate cache key for analytics
 * @param {object} req - Express request object
 * @returns {string} Cache key
 */
const generateAnalyticsCacheKey = (req) => {
  const userId = req.user?._id;
  const { startDate, endDate, period } = req.query;
  return `cache:analytics:${userId}:${startDate || 'all'}:${endDate || 'all'}:${period || 'monthly'}`;
};

module.exports = {
  cache,
  invalidateUserCache,
  invalidateCache,
  invalidateCacheAfter,
  generateUserCacheKey,
  generateAnalyticsCacheKey
};
