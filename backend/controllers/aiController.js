const { suggestCategory } = require('../services/geminiService');

/**
 * POST /api/ai/suggest-category
 * Returns an AI-suggested category for a given expense description.
 * Protected route — requires authentication, but doesn't touch the DB,
 * so no transaction is needed here.
 */
const suggestCategoryHandler = async (req, res, next) => {
  const { description } = req.body;

  try {
    const category = await suggestCategory(description);

    // category will be null if Gemini failed or returned something
    // unusable — this is a normal, expected outcome, not an error.
    return res.status(200).json({ category });
  } catch (error) {
    // suggestCategory is designed to never throw, but guard anyway —
    // a 500 here should be genuinely exceptional.
    next(error);
  }
};

module.exports = { suggestCategoryHandler };