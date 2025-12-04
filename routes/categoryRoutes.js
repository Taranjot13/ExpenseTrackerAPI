const express = require('express');
const router = express.Router();
const {
  createCategory,
  getCategories,
  getCategory,
  updateCategory,
  deleteCategory
} = require('../controllers/categoryController');
const authenticate = require('../middleware/authenticate');
const { validate, categorySchema } = require('../middleware/validator');
const { cache, invalidateCacheAfter } = require('../middleware/cache');

// All routes are protected
router.use(authenticate);

// Category routes with caching
router.route('/')
  .get(cache(600), getCategories) // Cache for 10 minutes
  .post(validate(categorySchema), invalidateCacheAfter('categories'), createCategory);

router.route('/:id')
  .get(cache(600), getCategory)
  .put(validate(categorySchema), invalidateCacheAfter('categories'), updateCategory)
  .delete(invalidateCacheAfter('categories'), deleteCategory);

module.exports = router;

