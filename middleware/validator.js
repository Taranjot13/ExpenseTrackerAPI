const Joi = require('joi');

// Validation middleware factory
const validate = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body, {
      abortEarly: false, // Return all errors
      stripUnknown: true // Remove unknown fields
    });

    if (error) {
      const errors = error.details.map(detail => detail.message);
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors
      });
    }

    next();
  };
};

// User validation schemas
const registerSchema = Joi.object({
  username: Joi.string().min(3).max(30).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  firstName: Joi.string().max(50).optional(),
  lastName: Joi.string().max(50).optional(),
  currency: Joi.string().length(3).uppercase().optional()
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required()
});

// Expense validation schemas
const expenseSchema = Joi.object({
  amount: Joi.number().min(0).required(),
  currency: Joi.string().length(3).uppercase().optional(),
  category: Joi.string().required(),
  description: Joi.string().max(500).required(),
  date: Joi.date().optional(),
  paymentMethod: Joi.string().valid('cash', 'credit_card', 'debit_card', 'bank_transfer', 'digital_wallet', 'other').optional(),
  tags: Joi.array().items(Joi.string()).optional(),
  notes: Joi.string().max(1000).optional(),
  isRecurring: Joi.boolean().optional(),
  recurringPeriod: Joi.string().valid('daily', 'weekly', 'monthly', 'yearly').when('isRecurring', {
    is: true,
    then: Joi.required(),
    otherwise: Joi.optional()
  })
});

// Category validation schemas
const categorySchema = Joi.object({
  name: Joi.string().max(50).required(),
  color: Joi.string().pattern(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/).optional(),
  icon: Joi.string().optional(),
  budget: Joi.number().min(0).optional().allow(null),
  description: Joi.string().max(200).optional()
});

module.exports = {
  validate,
  registerSchema,
  loginSchema,
  expenseSchema,
  categorySchema
};
