const express = require('express');
const router = express.Router();
const {
  register,
  login,
  refreshAccessToken,
  logout,
  getProfile,
  updateProfile,
  changePassword,
  getAllUsers
} = require('../controllers/authController');
const authenticate = require('../middleware/authenticate');
const { validate, registerSchema, loginSchema } = require('../middleware/validator');
const { authRateLimiter } = require('../middleware/rateLimiter');

// Public routes
router.post('/register', authRateLimiter, validate(registerSchema), register);
router.post('/login', authRateLimiter, validate(loginSchema), login);
router.post('/refresh', refreshAccessToken);

// Protected routes
router.post('/logout', authenticate, logout);
router.get('/me', authenticate, getProfile);
router.put('/profile', authenticate, updateProfile);
router.put('/password', authenticate, changePassword);
router.get('/users', authenticate, getAllUsers);

module.exports = router;
