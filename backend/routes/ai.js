const express = require('express');
const router = express.Router();

const {
  suggestCategoryHandler,
  summarizeHandler,
  budgetSuggestionHandler,
} = require('../controllers/aiController');
const { suggestCategoryValidator } = require('../validators/aiValidators');
const validate = require('../middleware/validate');
const authMiddleware = require('../middleware/authMiddleware');
const premiumMiddleware = require('../middleware/premiumMiddleware');

router.use(authMiddleware);

// Available to all authenticated users
router.post('/suggest-category', suggestCategoryValidator, validate, suggestCategoryHandler);

// Premium only
router.post('/summarize', premiumMiddleware, summarizeHandler);
router.post('/budget-suggestion', premiumMiddleware, budgetSuggestionHandler);

module.exports = router;