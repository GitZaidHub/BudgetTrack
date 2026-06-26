const { suggestCategory, summarizeExpenses, suggestBudget } = require('../services/geminiService');
const { Expense } = require('../models');

const suggestCategoryHandler = async (req, res, next) => {
  const { description } = req.body;
  try {
    const category = await suggestCategory(description);
    return res.status(200).json({ category });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/ai/summarize
 * Premium only — returns an AI-generated summary of the user's expenses.
 */
const summarizeHandler = async (req, res, next) => {
  const userId = req.user.id;
  try {
    const expenses = await Expense.findAll({
      where: { userId },
      order: [['createdAt', 'DESC']],
      limit: 100, // cap to last 100 expenses to keep token count manageable
      attributes: ['amount', 'description', 'category', 'createdAt'],
    });

    const summary = await summarizeExpenses(expenses);

    return res.status(200).json({ summary });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/ai/budget-suggestion
 * Premium only — returns per-category budget recommendations.
 */
const budgetSuggestionHandler = async (req, res, next) => {
  const userId = req.user.id;
  try {
    const expenses = await Expense.findAll({
      where: { userId },
      attributes: ['amount', 'category'],
    });

    const suggestions = await suggestBudget(expenses);

    return res.status(200).json({ suggestions });
  } catch (error) {
    next(error);
  }
};

module.exports = { suggestCategoryHandler, summarizeHandler, budgetSuggestionHandler };