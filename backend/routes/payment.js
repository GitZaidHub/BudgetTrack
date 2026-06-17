const express = require('express');
const router = express.Router();

const { createOrderHandler, verifyPaymentHandler } = require('../controllers/paymentController');
const { verifyPaymentValidator } = require('../validators/paymentValidators');
const validate = require('../middleware/validate');
const authMiddleware = require('../middleware/authMiddleware');

router.use(authMiddleware);

router.post('/create-order', createOrderHandler);
router.post('/verify', verifyPaymentValidator, validate, verifyPaymentHandler);

module.exports = router;