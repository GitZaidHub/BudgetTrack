const express = require('express');
const router = express.Router();

const { suggestCategoryHandler } = require('../controllers/aiController');
const { suggestCategoryValidator } = require('../validators/aiValidators');
const validate = require('../middleware/validate');
const authMiddleware = require('../middleware/authMiddleware');

router.use(authMiddleware);

router.post('/suggest-category', suggestCategoryValidator, validate, suggestCategoryHandler);

module.exports = router;