const { getCache, setCache } = require('../config/redis');

// Cache middleware factory
const cacheMiddleware = (keyPrefix, expirationInSeconds = 3600) => {
  return async (req, res, next) => {
    try {
      // Create cache key based on user and request parameters
      const userId = req.user ? req.user._id.toString() : 'anonymous';
      const queryString = JSON.stringify(req.query);
      const cacheKey = `${keyPrefix}:${userId}:${queryString}`;

      // Try to get cached data
      const cachedData = await getCache(cacheKey);

      if (cachedData) {
        console.log(`Cache hit: ${cacheKey}`);
        return res.status(200).json({
          success: true,
          cached: true,
          data: cachedData
        });
      }

      // Store original res.json function
      const originalJson = res.json.bind(res);

      // Override res.json to cache the response
      res.json = function(data) {
        // Only cache successful responses
        if (data.success && data.data) {
          setCache(cacheKey, data.data, expirationInSeconds)
            .then(() => console.log(`Cached: ${cacheKey}`))
            .catch(err => console.error('Cache set error:', err));
        }
        return originalJson(data);
      };

      next();

    } catch (error) {
      console.error('Cache middleware error:', error);
      // Continue without caching if there's an error
      next();
    }
  };
};

module.exports = cacheMiddleware;
