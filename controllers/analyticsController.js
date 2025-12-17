const Expense = require('../models/Expense');
const Category = require('../models/Category');

// @desc    Get expense summary
// @route   GET /api/analytics/summary
// @access  Private
const getSummary = async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;

    // Build date filter
    const dateFilter = { user: req.user._id };
    if (startDate || endDate) {
      dateFilter.date = {};
      if (startDate) dateFilter.date.$gte = new Date(startDate);
      if (endDate) dateFilter.date.$lte = new Date(endDate);
    }

    // Total expenses
    const totalExpenses = await Expense.countDocuments(dateFilter);

    // Total amount spent
    const totalAmountResult = await Expense.aggregate([
      { $match: dateFilter },
      {
        $group: {
          _id: null,
          total: { $sum: '$amount' },
          average: { $avg: '$amount' }
        }
      }
    ]);

    const { total = 0, average = 0 } = totalAmountResult[0] || {};

    // Spending by category
    const byCategory = await Expense.aggregate([
      { $match: dateFilter },
      {
        $group: {
          _id: '$category',
          total: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      },
      { $sort: { total: -1 } },
      {
        $lookup: {
          from: 'categories',
          localField: '_id',
          foreignField: '_id',
          as: 'categoryInfo'
        }
      },
      { $unwind: '$categoryInfo' },
      {
        $project: {
          _id: 1,
          total: 1,
          count: 1,
          name: '$categoryInfo.name',
          color: '$categoryInfo.color',
          icon: '$categoryInfo.icon'
        }
      }
    ]);

    // Spending by payment method
    const byPaymentMethod = await Expense.aggregate([
      { $match: dateFilter },
      {
        $group: {
          _id: '$paymentMethod',
          total: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      },
      { $sort: { total: -1 } }
    ]);

    // Monthly trend (last 6 months if no date filter)
    const monthlyTrend = await Expense.aggregate([
      { $match: dateFilter },
      {
        $group: {
          _id: {
            year: { $year: '$date' },
            month: { $month: '$date' }
          },
          total: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    res.status(200).json({
      success: true,
      data: {
        // Backward-compatible top-level fields (used by tests / some clients)
        totalExpenses: total,
        expenseCount: totalExpenses,
        totalAmount: total,
        averageExpense: average,
        currency: req.user.currency,
        overview: {
          totalExpenses,
          totalAmount: total,
          averageExpense: average,
          currency: req.user.currency
        },
        byCategory,
        byPaymentMethod,
        monthlyTrend
      }
    });

  } catch (error) {
    next(error);
  }
};

// @desc    Get spending by date range
// @route   GET /api/analytics/by-date
// @access  Private
const getSpendingByDate = async (req, res, next) => {
  try {
    const { startDate, endDate, groupBy = 'day' } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: 'Start date and end date are required'
      });
    }

    const dateFilter = {
      user: req.user._id,
      date: {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      }
    };

    // Determine grouping format
    let groupFormat;
    switch (groupBy) {
      case 'day':
        groupFormat = {
          year: { $year: '$date' },
          month: { $month: '$date' },
          day: { $dayOfMonth: '$date' }
        };
        break;
      case 'week':
        groupFormat = {
          year: { $year: '$date' },
          week: { $week: '$date' }
        };
        break;
      case 'month':
        groupFormat = {
          year: { $year: '$date' },
          month: { $month: '$date' }
        };
        break;
      default:
        groupFormat = {
          year: { $year: '$date' },
          month: { $month: '$date' },
          day: { $dayOfMonth: '$date' }
        };
    }

    const result = await Expense.aggregate([
      { $match: dateFilter },
      {
        $group: {
          _id: groupFormat,
          total: { $sum: '$amount' },
          count: { $sum: 1 },
          average: { $avg: '$amount' }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } }
    ]);

    res.status(200).json({
      success: true,
      data: result
    });

  } catch (error) {
    next(error);
  }
};

// @desc    Get spending trends (monthly/weekly/daily)
// @route   GET /api/analytics/trends
// @access  Private
const getTrends = async (req, res, next) => {
  try {
    const { period = 'monthly', startDate, endDate } = req.query;

    const dateFilter = { user: req.user._id };
    if (startDate || endDate) {
      dateFilter.date = {};
      if (startDate) dateFilter.date.$gte = new Date(startDate);
      if (endDate) dateFilter.date.$lte = new Date(endDate);
    }

    let groupId;
    let sortSpec;

    if (period === 'daily') {
      groupId = {
        year: { $year: '$date' },
        month: { $month: '$date' },
        day: { $dayOfMonth: '$date' }
      };
      sortSpec = { '_id.year': 1, '_id.month': 1, '_id.day': 1 };
    } else if (period === 'weekly') {
      groupId = {
        year: { $year: '$date' },
        week: { $week: '$date' }
      };
      sortSpec = { '_id.year': 1, '_id.week': 1 };
    } else {
      // default monthly
      groupId = {
        year: { $year: '$date' },
        month: { $month: '$date' }
      };
      sortSpec = { '_id.year': 1, '_id.month': 1 };
    }

    const trend = await Expense.aggregate([
      { $match: dateFilter },
      {
        $group: {
          _id: groupId,
          total: { $sum: '$amount' },
          count: { $sum: 1 },
          average: { $avg: '$amount' }
        }
      },
      { $sort: sortSpec }
    ]);

    res.status(200).json({
      success: true,
      data: trend
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get top spending categories
// @route   GET /api/analytics/top-categories
// @access  Private
const getTopCategories = async (req, res, next) => {
  try {
    const { limit = 5, startDate, endDate } = req.query;

    const dateFilter = { user: req.user._id };
    if (startDate || endDate) {
      dateFilter.date = {};
      if (startDate) dateFilter.date.$gte = new Date(startDate);
      if (endDate) dateFilter.date.$lte = new Date(endDate);
    }

    const topCategories = await Expense.aggregate([
      { $match: dateFilter },
      {
        $group: {
          _id: '$category',
          total: { $sum: '$amount' },
          count: { $sum: 1 },
          average: { $avg: '$amount' }
        }
      },
      { $sort: { total: -1 } },
      { $limit: parseInt(limit) },
      {
        $lookup: {
          from: 'categories',
          localField: '_id',
          foreignField: '_id',
          as: 'categoryInfo'
        }
      },
      { $unwind: '$categoryInfo' },
      {
        $project: {
          _id: 1,
          total: 1,
          count: 1,
          average: 1,
          category: {
            name: '$categoryInfo.name',
            color: '$categoryInfo.color',
            icon: '$categoryInfo.icon',
            budget: '$categoryInfo.budget'
          }
        }
      }
    ]);

    res.status(200).json({
      success: true,
      data: topCategories
    });

  } catch (error) {
    next(error);
  }
};

// @desc    Get budget vs actual spending
// @route   GET /api/analytics/budget-comparison
// @access  Private
const getBudgetComparison = async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;

    // Get all categories with budgets
    const categories = await Category.find({
      user: req.user._id,
      budget: { $ne: null, $gt: 0 }
    });

    const dateFilter = { user: req.user._id };
    if (startDate || endDate) {
      dateFilter.date = {};
      if (startDate) dateFilter.date.$gte = new Date(startDate);
      if (endDate) dateFilter.date.$lte = new Date(endDate);
    }

    // Get actual spending for each category
    const comparisons = await Promise.all(
      categories.map(async (category) => {
        const spendingResult = await Expense.aggregate([
          {
            $match: {
              ...dateFilter,
              category: category._id
            }
          },
          {
            $group: {
              _id: null,
              actualSpending: { $sum: '$amount' },
              transactionCount: { $sum: 1 }
            }
          }
        ]);

        const { actualSpending = 0, transactionCount = 0 } = spendingResult[0] || {};
        const budget = category.budget;
        const remaining = budget - actualSpending;
        const percentageUsed = (actualSpending / budget) * 100;

        return {
          category: {
            id: category._id,
            name: category.name,
            color: category.color,
            icon: category.icon
          },
          budget,
          actualSpending,
          remaining,
          percentageUsed,
          isOverBudget: actualSpending > budget,
          transactionCount
        };
      })
    );

    // Sort by percentage used (descending)
    comparisons.sort((a, b) => b.percentageUsed - a.percentageUsed);

    res.status(200).json({
      success: true,
      data: comparisons
    });

  } catch (error) {
    next(error);
  }
};

// @desc    Get recent expenses
// @route   GET /api/analytics/recent
// @access  Private
const getRecentExpenses = async (req, res, next) => {
  try {
    const { limit = 10 } = req.query;

    const recentExpenses = await Expense.find({ user: req.user._id })
      .populate('category', 'name color icon')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit));

    res.status(200).json({
      success: true,
      data: recentExpenses
    });

  } catch (error) {
    next(error);
  }
};

module.exports = {
  getSummary,
  getSpendingByDate,
  getTrends,
  getTopCategories,
  getBudgetComparison,
  getRecentExpenses
};
