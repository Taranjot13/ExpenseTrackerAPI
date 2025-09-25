// This file defines the API routes for category-related operations.

const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryController');

router.get('/', categoryController.getAllCategories);
router.delete('/:id', categoryController.deleteCategory);

module.exports = router;
