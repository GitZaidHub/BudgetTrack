const express = require('express');
const router = express.Router();

const { signup, login, getMe } = require('../controllers/authController');
const { signupValidator, loginValidator } = require('../validators/authValidators');
const validate = require('../middleware/validate');
const authMiddleware = require('../middleware/authMiddleware');

router.post('/signup', signupValidator, validate, signup);
router.post('/login', loginValidator, validate, login);
router.get('/me', authMiddleware, getMe);

module.exports = router;