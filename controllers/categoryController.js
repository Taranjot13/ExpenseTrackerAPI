const Category = require('../models/Category');
const Expense = require('../models/Expense');
const { deleteCachePattern } = require('../config/redis');

// @desc    Create new category
// @route   POST /api/categories
// @access  Private
const createCategory = async (req, res, next) => {
  try {
    const { name, color, icon, budget, description } = req.body;

    // Check if category with same name exists for this user
    const existingCategory = await Category.findOne({
      user: req.user._id,
      name: { $regex: new RegExp(`^${name}$`, 'i') }
    });

    if (existingCategory) {
      return res.status(400).json({
        success: false,
        message: 'Category with this name already exists'
      });
    }

    // Create category
    const category = await Category.create({
      user: req.user._id,
      name,
      color,
      icon,
      budget,
      description
    });

    // Clear cache
    await deleteCachePattern(`categories:${req.user._id}:*`);

    // Send WebSocket notification
    const io = req.app.get('io');
    io.to(`user_${req.user._id}`).emit('category_created', {
      message: 'New category created',
      category
    });

    res.status(201).json({
      success: true,
      message: 'Category created successfully',
      data: category
    });

  } catch (error) {
    next(error);
  }
};

// @desc    Get all categories for user
// @route   GET /api/categories
// @access  Private
const getCategories = async (req, res, next) => {
  try {
    const { includeStats } = req.query;

    const categories = await Category.find({
      user: req.user._id,
      isActive: true
    }).sort({ name: 1 });

    // Optionally include spending statistics
    if (includeStats === 'true') {
      const categoriesWithStats = await Promise.all(
        categories.map(async (category) => {
          const totalSpent = await Expense.aggregate([
            {
              $match: {
                user: req.user._id,
                category: category._id
              }
            },
            {
              $group: {
                _id: null,
                total: { $sum: '$amount' },
                count: { $sum: 1 }
              }
            }
          ]);

          const stats = totalSpent[0] || { total: 0, count: 0 };

          return {
            ...category.toObject(),
            totalSpent: stats.total,
            expenseCount: stats.count,
            budgetUtilization: category.budget ? (stats.total / category.budget) * 100 : null,
            isOverBudget: category.budget ? stats.total > category.budget : false
          };
        })
      );

      return res.status(200).json({
        success: true,
        data: categoriesWithStats
      });
    }

    res.status(200).json({
      success: true,
      data: categories
    });

  } catch (error) {
    next(error);
  }
};

// @desc    Get single category
// @route   GET /api/categories/:id
// @access  Private
const getCategory = async (req, res, next) => {
  try {
    const category = await Category.findOne({
      _id: req.params.id,
      user: req.user._id
    });

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }

    // Get spending statistics for this category
    const stats = await Expense.aggregate([
      {
        $match: {
          user: req.user._id,
          category: category._id
        }
      },
      {
        $group: {
          _id: null,
          totalSpent: { $sum: '$amount' },
          expenseCount: { $sum: 1 },
          avgExpense: { $avg: '$amount' }
        }
      }
    ]);

    const categoryData = {
      ...category.toObject(),
      stats: stats[0] || { totalSpent: 0, expenseCount: 0, avgExpense: 0 }
    };

    res.status(200).json({
      success: true,
      data: categoryData
    });

  } catch (error) {
    next(error);
  }
};

// @desc    Update category
// @route   PUT /api/categories/:id
// @access  Private
const updateCategory = async (req, res, next) => {
  try {
    const { name, color, icon, budget, description, isActive } = req.body;

    const category = await Category.findOne({
      _id: req.params.id,
      user: req.user._id
    });

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }

    // Check for duplicate name if name is being updated
    if (name && name !== category.name) {
      const existingCategory = await Category.findOne({
        user: req.user._id,
        name: { $regex: new RegExp(`^${name}$`, 'i') },
        _id: { $ne: category._id }
      });

      if (existingCategory) {
        return res.status(400).json({
          success: false,
          message: 'Category with this name already exists'
        });
      }
    }

    // Update fields
    if (name !== undefined) category.name = name;
    if (color !== undefined) category.color = color;
    if (icon !== undefined) category.icon = icon;
    if (budget !== undefined) category.budget = budget;
    if (description !== undefined) category.description = description;
    if (isActive !== undefined) category.isActive = isActive;

    await category.save();

    // Clear cache
    await deleteCachePattern(`categories:${req.user._id}:*`);
    await deleteCachePattern(`expenses:${req.user._id}:*`);

    // Send WebSocket notification
    const io = req.app.get('io');
    io.to(`user_${req.user._id}`).emit('category_updated', {
      message: 'Category updated',
      category
    });

    res.status(200).json({
      success: true,
      message: 'Category updated successfully',
      data: category
    });

  } catch (error) {
    next(error);
  }
};

// @desc    Delete category
// @route   DELETE /api/categories/:id
// @access  Private
const deleteCategory = async (req, res, next) => {
  try {
    const category = await Category.findOne({
      _id: req.params.id,
      user: req.user._id
    });

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }

    // Check if category has expenses
    const expenseCount = await Expense.countDocuments({
      category: category._id
    });

    if (expenseCount > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete category. It has ${expenseCount} associated expenses. Please delete or reassign those expenses first.`
      });
    }

    await category.deleteOne();

    // Clear cache
    await deleteCachePattern(`categories:${req.user._id}:*`);

    // Send WebSocket notification
    const io = req.app.get('io');
    io.to(`user_${req.user._id}`).emit('category_deleted', {
      message: 'Category deleted',
      categoryId: req.params.id
    });

    res.status(200).json({
      success: true,
      message: 'Category deleted successfully'
    });

  } catch (error) {
    next(error);
  }
};

module.exports = {
  createCategory,
  getCategories,
  getCategory,
  updateCategory,
  deleteCategory
};
