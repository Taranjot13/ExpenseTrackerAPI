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

// All routes are protected
router.use(authenticate);

// Expense routes
router.route('/')
  .get(getExpenses)
  .post(validate(expenseSchema), createExpense);

router.route('/:id')
  .get(getExpense)
  .put(validate(expenseSchema), updateExpense)
  .delete(deleteExpense);

// Bulk operations
router.post('/bulk-delete', bulkDeleteExpenses);

module.exports = router;
