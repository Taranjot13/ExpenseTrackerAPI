const express = require('express');
const router = express.Router();
const authenticate = require('../middleware/authenticate');
const { getAnalytics, getExpensesWithCategory } = require('../utils/postgresSync');
const { isAvailable } = require('../config/postgres');

// All routes are protected
router.use(authenticate);

// @desc    Get PostgreSQL analytics (demonstrates SQL queries)
// @route   GET /api/postgres/analytics
// @access  Private
router.get('/analytics', async (req, res, next) => {
  try {
    if (!isAvailable()) {
      return res.status(503).json({
        success: false,
        message: 'PostgreSQL is not available. Please configure PostgreSQL in .env file.'
      });
    }

    const { startDate, endDate } = req.query;

    // Default to current month if not provided
    const start = startDate || new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0];
    const end = endDate || new Date().toISOString().split('T')[0];

    const analytics = await getAnalytics(req.user._id, start, end);

    res.status(200).json({
      success: true,
      message: 'Analytics retrieved from PostgreSQL',
      data: {
        period: { startDate: start, endDate: end },
        ...analytics
      }
    });

  } catch (error) {
    next(error);
  }
});

// @desc    Get expenses with category details using SQL JOIN
// @route   GET /api/postgres/expenses
// @access  Private
router.get('/expenses', async (req, res, next) => {
  try {
    if (!isAvailable()) {
      return res.status(503).json({
        success: false,
        message: 'PostgreSQL is not available. Please configure PostgreSQL in .env file.'
      });
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    const expenses = await getExpensesWithCategory(req.user._id, limit, offset);

    res.status(200).json({
      success: true,
      message: 'Expenses retrieved from PostgreSQL using SQL JOIN',
      data: {
        expenses,
        pagination: {
          page,
          limit,
          hasMore: expenses.length === limit
        }
      }
    });

  } catch (error) {
    next(error);
  }
});

// @desc    Check PostgreSQL connection status
// @route   GET /api/postgres/status
// @access  Private
router.get('/status', async (req, res) => {
  res.status(200).json({
    success: true,
    data: {
      available: isAvailable(),
      message: isAvailable() 
        ? 'PostgreSQL is connected and ready' 
        : 'PostgreSQL is not configured or connection failed'
    }
  });
});

module.exports = router;
