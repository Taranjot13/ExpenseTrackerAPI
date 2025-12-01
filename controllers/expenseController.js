const Expense = require('../models/Expense');
const Category = require('../models/Category');
const { syncExpense, deleteExpense: deletePgExpense } = require('../utils/postgresSync');

// @desc    Create new expense
// @route   POST /api/expenses
// @access  Private
const createExpense = async (req, res, next) => {
  try {
    const { amount, currency, category, description, date, paymentMethod, tags, notes, isRecurring, recurringPeriod } = req.body;

    // Verify category belongs to user
    const categoryExists = await Category.findOne({
      _id: category,
      user: req.user._id
    });

    if (!categoryExists) {
      return res.status(404).json({
        success: false,
        message: 'Category not found or does not belong to you'
      });
    }

    // Create expense
    const expense = await Expense.create({
      user: req.user._id,
      amount,
      currency: currency || req.user.currency,
      category,
      description,
      date: date || new Date(),
      paymentMethod,
      tags,
      notes,
      isRecurring,
      recurringPeriod
    });

    // Populate category details
    await expense.populate('category', 'name color icon');

    // Sync to PostgreSQL (if available)
    await syncExpense(expense, req.user._id);

    // Send WebSocket notification
    const io = req.app.get('io');
    io.to(`user_${req.user._id}`).emit('expense_created', {
      message: 'New expense added',
      expense
    });

    res.status(201).json({
      success: true,
      message: 'Expense created successfully',
      data: expense
    });

  } catch (error) {
    next(error);
  }
};

// @desc    Get all expenses for user
// @route   GET /api/expenses
// @access  Private
const getExpenses = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, category, startDate, endDate, minAmount, maxAmount, paymentMethod, search } = req.query;

    // Build query
    const query = { user: req.user._id };

    if (category) query.category = category;
    if (paymentMethod) query.paymentMethod = paymentMethod;

    // Date range filter
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }

    // Amount range filter
    if (minAmount || maxAmount) {
      query.amount = {};
      if (minAmount) query.amount.$gte = parseFloat(minAmount);
      if (maxAmount) query.amount.$lte = parseFloat(maxAmount);
    }

    // Search in description
    if (search) {
      query.description = { $regex: search, $options: 'i' };
    }

    // Pagination
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    // Get expenses with pagination
    const expenses = await Expense.find(query)
      .populate('category', 'name color icon')
      .sort({ date: -1, createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    // Get total count
    const total = await Expense.countDocuments(query);

    res.status(200).json({
      success: true,
      data: expenses,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum)
      }
    });

  } catch (error) {
    next(error);
  }
};

// @desc    Get single expense
// @route   GET /api/expenses/:id
// @access  Private
const getExpense = async (req, res, next) => {
  try {
    const expense = await Expense.findOne({
      _id: req.params.id,
      user: req.user._id
    }).populate('category', 'name color icon budget');

    if (!expense) {
      return res.status(404).json({
        success: false,
        message: 'Expense not found'
      });
    }

    res.status(200).json({
      success: true,
      data: expense
    });

  } catch (error) {
    next(error);
  }
};

// @desc    Update expense
// @route   PUT /api/expenses/:id
// @access  Private
const updateExpense = async (req, res, next) => {
  try {
    const { amount, currency, category, description, date, paymentMethod, tags, notes, isRecurring, recurringPeriod } = req.body;

    // Find expense
    let expense = await Expense.findOne({
      _id: req.params.id,
      user: req.user._id
    });

    if (!expense) {
      return res.status(404).json({
        success: false,
        message: 'Expense not found'
      });
    }

    // Verify category if provided
    if (category) {
      const categoryExists = await Category.findOne({
        _id: category,
        user: req.user._id
      });

      if (!categoryExists) {
        return res.status(404).json({
          success: false,
          message: 'Category not found or does not belong to you'
        });
      }
    }

    // Update fields
    if (amount !== undefined) expense.amount = amount;
    if (currency !== undefined) expense.currency = currency;
    if (category !== undefined) expense.category = category;
    if (description !== undefined) expense.description = description;
    if (date !== undefined) expense.date = date;
    if (paymentMethod !== undefined) expense.paymentMethod = paymentMethod;
    if (tags !== undefined) expense.tags = tags;
    if (notes !== undefined) expense.notes = notes;
    if (isRecurring !== undefined) expense.isRecurring = isRecurring;
    if (recurringPeriod !== undefined) expense.recurringPeriod = recurringPeriod;

    await expense.save();
    await expense.populate('category', 'name color icon');

    // Send WebSocket notification
    const io = req.app.get('io');
    io.to(`user_${req.user._id}`).emit('expense_updated', {
      message: 'Expense updated',
      expense
    });

    res.status(200).json({
      success: true,
      message: 'Expense updated successfully',
      data: expense
    });

  } catch (error) {
    next(error);
  }
};

// @desc    Delete expense
// @route   DELETE /api/expenses/:id
// @access  Private
const deleteExpense = async (req, res, next) => {
  try {
    const expense = await Expense.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id
    });

    if (!expense) {
      return res.status(404).json({
        success: false,
        message: 'Expense not found'
      });
    }

    // Send WebSocket notification
    const io = req.app.get('io');
    io.to(`user_${req.user._id}`).emit('expense_deleted', {
      message: 'Expense deleted',
      expenseId: req.params.id
    });

    res.status(200).json({
      success: true,
      message: 'Expense deleted successfully'
    });

  } catch (error) {
    next(error);
  }
};

// @desc    Delete multiple expenses
// @route   POST /api/expenses/bulk-delete
// @access  Private
const bulkDeleteExpenses = async (req, res, next) => {
  try {
    const { expenseIds } = req.body;

    if (!Array.isArray(expenseIds) || expenseIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Please provide an array of expense IDs'
      });
    }

    const result = await Expense.deleteMany({
      _id: { $in: expenseIds },
      user: req.user._id
    });

    // Send WebSocket notification
    const io = req.app.get('io');
    io.to(`user_${req.user._id}`).emit('expenses_bulk_deleted', {
      message: `${result.deletedCount} expenses deleted`,
      count: result.deletedCount
    });

    res.status(200).json({
      success: true,
      message: `${result.deletedCount} expenses deleted successfully`,
      deletedCount: result.deletedCount
    });

  } catch (error) {
    next(error);
  }
};

module.exports = {
  createExpense,
  getExpenses,
  getExpense,
  updateExpense,
  deleteExpense,
  bulkDeleteExpenses
};
