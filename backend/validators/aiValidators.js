const { body } = require('express-validator');

const suggestCategoryValidator = [
  body('description')
    .trim()
    .notEmpty()
    .withMessage('Description is required')
    .isLength({ min: 2, max: 255 })
    .withMessage('Description must be between 2 and 255 characters'),
];

module.exports = { suggestCategoryValidator };