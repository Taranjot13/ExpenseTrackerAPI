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
const { validate, expenseSchema } = require('../middleware/validator');
const cacheMiddleware = require('../middleware/cache');

// All routes are protected
router.use(authenticate);

// Expense routes
router.route('/')
  .get(cacheMiddleware('expenses', 300), getExpenses) // Cache for 5 minutes
  .post(validate(expenseSchema), createExpense);

router.route('/:id')
  .get(getExpense)
  .put(validate(expenseSchema), updateExpense)
  .delete(deleteExpense);

// Bulk operations
router.post('/bulk-delete', bulkDeleteExpenses);

module.exports = router;
