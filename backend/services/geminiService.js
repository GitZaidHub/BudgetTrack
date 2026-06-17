const { GoogleGenerativeAI } = require('@google/generative-ai');
const { EXPENSE_CATEGORIES } = require('../utils/categories');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const TIMEOUT_MS = 5000;

/**
 * Wraps a promise with a timeout so a slow/hanging Gemini call
 * never blocks the request indefinitely.
 */
const withTimeout = (promise, ms) => {
  return Promise.race([
    promise,
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Gemini request timed out')), ms)
    ),
  ]);
};

/**
 * Asks Gemini to categorize an expense description into one of
 * our fixed EXPENSE_CATEGORIES. Returns null on any failure —
 * callers must treat null as "no suggestion available" and
 * fail gracefully, never as an error to surface to the user.
 *
 * @param {string} description
 * @returns {Promise<string|null>} a value from EXPENSE_CATEGORIES, or null
 */
const suggestCategory = async (description) => {
  try {
    const model = genAI.getGenerativeModel({
      model: process.env.GEMINI_MODEL || 'gemini-3.5-flash',
    });

    const prompt = `You are a strict classifier for a personal expense tracker.
Classify the following expense description into EXACTLY ONE of these categories:
${EXPENSE_CATEGORIES.join(', ')}

Rules:
- Respond with ONLY the category name, nothing else. No punctuation, no explanation.
- The category MUST be exactly one of the list above, character-for-character.
- If nothing fits well, respond with "Other".

Expense description: "${description}"

Category:`;

    const result = await withTimeout(model.generateContent(prompt), TIMEOUT_MS);
    const rawText = result.response.text().trim();

    // Defensive parsing: Gemini occasionally adds stray punctuation or
    // whitespace despite instructions. Normalize and match against the
    // known list rather than trusting the raw output directly.
    const matched = EXPENSE_CATEGORIES.find(
      (cat) => cat.toLowerCase() === rawText.toLowerCase().replace(/[.\s]+$/, '')
    );

    return matched || null;
  } catch (error) {
    console.error('[geminiService] suggestCategory failed:', error.message);
    return null; // Never throw — caller treats null as "no suggestion"
  }
};

module.exports = { suggestCategory };