// View Routes - Frontend pages
const express = require('express');
const router = express.Router();
const viewController = require('../controllers/viewController');

// Public routes
router.get('/', viewController.getHome);
router.get('/login', viewController.getLogin);
router.get('/register', viewController.getRegister);

// Protected routes
router.get('/dashboard', viewController.requireAuth, viewController.getDashboard);
router.get('/expenses', viewController.requireAuth, viewController.getExpenses);
router.get('/expenses/new', viewController.requireAuth, viewController.getNewExpense);
router.get('/expenses/edit/:id', viewController.requireAuth, viewController.getEditExpense);
router.get('/categories', viewController.requireAuth, viewController.getCategories);
router.get('/analytics', viewController.requireAuth, viewController.getAnalytics);
router.get('/users', viewController.requireAuth, viewController.getUsers);
router.get('/logout', viewController.logout);

module.exports = router;
