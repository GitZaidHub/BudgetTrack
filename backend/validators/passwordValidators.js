const { body, param } = require('express-validator');

const forgotPasswordValidator = [
  body('email').trim().notEmpty().withMessage('Email is required').isEmail().withMessage('Please provide a valid email address').normalizeEmail(),
];

const resetIdValidator = [param('id').isUUID().withMessage('Invalid reset link')];

const resetPasswordValidator = [
  param('id').isUUID().withMessage('Invalid reset link'),
  body('newPassword')
    .notEmpty()
    .withMessage('New password is required')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long')
    .matches(/\d/)
    .withMessage('Password must contain at least one number'),
];

module.exports = { forgotPasswordValidator, resetIdValidator, resetPasswordValidator };