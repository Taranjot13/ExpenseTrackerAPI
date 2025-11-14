const express = require('express');
const router = express.Router();
const {
  getSummary,
  getSpendingByDate,
  getTopCategories,
  getBudgetComparison,
  getRecentExpenses
} = require('../controllers/analyticsController');
const authenticate = require('../middleware/authenticate');
const cacheMiddleware = require('../middleware/cache');

// All routes are protected
router.use(authenticate);

// Analytics routes with caching
router.get('/summary', cacheMiddleware('analytics', 300), getSummary);
router.get('/by-date', cacheMiddleware('analytics', 300), getSpendingByDate);
router.get('/top-categories', cacheMiddleware('analytics', 300), getTopCategories);
router.get('/budget-comparison', cacheMiddleware('analytics', 300), getBudgetComparison);
router.get('/recent', cacheMiddleware('analytics', 180), getRecentExpenses);

module.exports = router;
