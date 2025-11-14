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
const cacheMiddleware = require('../middleware/cache');

// All routes are protected
router.use(authenticate);

// Category routes
router.route('/')
  .get(cacheMiddleware('categories', 600), getCategories) // Cache for 10 minutes
  .post(validate(categorySchema), createCategory);

router.route('/:id')
  .get(getCategory)
  .put(validate(categorySchema), updateCategory)
  .delete(deleteCategory);

module.exports = router;
