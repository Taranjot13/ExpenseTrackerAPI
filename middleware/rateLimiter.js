const rateLimit = require('express-rate-limit');

const isTestEnv = process.env.NODE_ENV === 'test' || !!process.env.JEST_WORKER_ID;
const isDevEnv = process.env.NODE_ENV === 'development' || !process.env.NODE_ENV;
const isRateLimitDisabled = process.env.RATE_LIMIT_DISABLED === 'true';

const passthrough = (req, res, next) => next();

// Create rate limiter
const rateLimiter = (isTestEnv || isDevEnv || isRateLimitDisabled) ? passthrough : rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100, // Limit each IP to 100 requests per windowMs
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again later.'
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  // Skip rate limiting for certain routes
  skip: (req) => {
    return req.path === '/health';
  }
});

// Stricter rate limiter for auth routes
const authRateLimiter = (isTestEnv || isDevEnv || isRateLimitDisabled) ? passthrough : rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 requests per windowMs for login/register
  message: {
    success: false,
    message: 'Too many authentication attempts, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false
});

module.exports = rateLimiter;
module.exports.authRateLimiter = authRateLimiter;
