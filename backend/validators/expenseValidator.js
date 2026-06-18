const { body, param } = require('express-validator');
const { EXPENSE_CATEGORIES } = require('../utils/categories');
const { query } = require('express-validator');

const ALLOWED_LIMITS = [5, 8, 10, 20, 40];

const paginationValidator = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('page must be a positive integer')
    .toInt(),

  query('limit')
    .optional()
    .isInt()
    .withMessage('limit must be an integer')
    .custom((value) => ALLOWED_LIMITS.includes(Number(value)))
    .withMessage(`limit must be one of: ${ALLOWED_LIMITS.join(', ')}`)
    .toInt(),
];

const createExpenseValidator = [
  body('amount')
    .notEmpty()
    .withMessage('Amount is required')
    .isFloat({ min: 0.01 })
    .withMessage('Amount must be a positive number'),

  body('description')
    .trim()
    .notEmpty()
    .withMessage('Description is required')
    .isLength({ max: 255 })
    .withMessage('Description must be 255 characters or fewer'),

  body('category')
    .notEmpty()
    .withMessage('Category is required')
    .isIn(EXPENSE_CATEGORIES)
    .withMessage(`Category must be one of: ${EXPENSE_CATEGORIES.join(', ')}`),
];

const expenseIdValidator = [
  param('id').isInt({ min: 1 }).withMessage('Invalid expense id'),
];

module.exports = { createExpenseValidator, expenseIdValidator, paginationValidator, ALLOWED_LIMITS };