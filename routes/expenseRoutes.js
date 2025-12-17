const express = require('express');
const router = express.Router();
const {
  createExpense,
  getExpenses,
  getExpense,
  updateExpense,
  deleteExpense,
  bulkDeleteExpenses
} = require('../controllers/expenseController');
const authenticate = require('../middleware/authenticate');
const { validate, expenseSchema, expenseUpdateSchema } = require('../middleware/validator');
const { cache, invalidateCacheAfter, generateUserCacheKey } = require('../middleware/cache');

// All routes are protected
router.use(authenticate);

// Expense routes with caching
router.route('/')
  .get(cache(300, generateUserCacheKey), getExpenses) // Cache for 5 minutes
  .post(validate(expenseSchema), invalidateCacheAfter('expenses'), createExpense);

router.route('/:id')
  .get(cache(300), getExpense) // Cache individual expense
  .put(validate(expenseUpdateSchema), invalidateCacheAfter('expenses'), updateExpense)
  .delete(invalidateCacheAfter('expenses'), deleteExpense);

// Bulk operations
router.post('/bulk-delete', invalidateCacheAfter('expenses'), bulkDeleteExpenses);

module.exports = router;

