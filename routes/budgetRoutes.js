// This file defines the API routes for budget-related operations.

const express = require('express');
const router = express.Router();
const budgetController = require('../controllers/budgetController');

router.post('/', budgetController.createBudget);
router.get('/:userId', budgetController.getBudget);
router.put('/:userId', budgetController.updateBudget);
router.delete('/:userId', budgetController.deleteBudget);

module.exports = router;
