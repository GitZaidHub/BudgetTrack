const express = require('express');
const router = express.Router();

const { signup } = require('../controllers/authController');
const { signupValidator } = require('../validators/authValidators');
const validate = require('../middleware/validate');

router.post('/signup', signupValidator, validate, signup);

module.exports = router;