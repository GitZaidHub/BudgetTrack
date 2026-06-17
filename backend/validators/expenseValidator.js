const { body, param } = require('express-validator');
const { EXPENSE_CATEGORIES } = require('../utils/categories');

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

module.exports = { createExpenseValidator, expenseIdValidator };