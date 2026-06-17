const { body } = require('express-validator');

const verifyPaymentValidator = [
  body('orderId').trim().notEmpty().withMessage('Order ID is required'),
];

module.exports = { verifyPaymentValidator };