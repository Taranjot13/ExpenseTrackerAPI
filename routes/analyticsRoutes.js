const express = require('express');
const router = express.Router();
const {
  getSummary,
  getSpendingByDate,
  getTrends,
  getTopCategories,
  getBudgetComparison,
  getRecentExpenses
} = require('../controllers/analyticsController');
const authenticate = require('../middleware/authenticate');
const { cache, generateAnalyticsCacheKey } = require('../middleware/cache');

// All routes are protected
router.use(authenticate);

// Analytics routes with aggressive caching (10 minutes)
router.get('/summary', cache(600, generateAnalyticsCacheKey), getSummary);
router.get('/by-date', cache(600, generateAnalyticsCacheKey), getSpendingByDate);
router.get('/trends', cache(600, generateAnalyticsCacheKey), getTrends);
router.get('/top-categories', cache(600, generateAnalyticsCacheKey), getTopCategories);
router.get('/by-category', cache(600, generateAnalyticsCacheKey), getTopCategories);
router.get('/budget-comparison', cache(600, generateAnalyticsCacheKey), getBudgetComparison);
router.get('/recent', cache(300), getRecentExpenses); // 5 minutes for recent

module.exports = router;

