const express = require('express');
const router = express.Router();

const {
  forgotPassword,
  checkResetLink,
  resetPassword,
} = require('../controllers/passwordController');
const { authRateLimiter } = require('../middleware/rateLimiter');
const {
  forgotPasswordValidator,
  resetIdValidator,
  resetPasswordValidator,
} = require('../validators/passwordValidators');
const validate = require('../middleware/validate');

// No authMiddleware on this entire router — by definition, a user
// requesting a password reset is NOT logged in.
router.post('/forgotpassword', authRateLimiter, forgotPasswordValidator, validate, forgotPassword);
router.get('/resetpassword/:id', resetIdValidator, validate, checkResetLink);
router.post('/resetpassword/:id', resetPasswordValidator, validate, resetPassword);

module.exports = router;