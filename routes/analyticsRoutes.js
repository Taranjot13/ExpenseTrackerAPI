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

// All routes are protected
router.use(authenticate);

// Analytics routes
router.get('/summary', getSummary);
router.get('/by-date', getSpendingByDate);
router.get('/top-categories', getTopCategories);
router.get('/budget-comparison', getBudgetComparison);
router.get('/recent', getRecentExpenses);

module.exports = router;
