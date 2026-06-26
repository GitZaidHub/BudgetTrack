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
/**
 * Generates a natural language summary of the user's expenses.
 * @param {Array} expenses - array of { amount, description, category, createdAt }
 * @returns {Promise<string|null>}
 */
const summarizeExpenses = async (expenses) => {
  try {
    if (!expenses || expenses.length === 0) return null;

    const model = genAI.getGenerativeModel({
      model: process.env.GEMINI_MODEL || 'gemini-2.0-flash',
    });

    const expenseText = expenses
      .map(
        (e) =>
          `- ${new Date(e.createdAt).toLocaleDateString('en-IN')}: ${e.description} | ${e.category} | ₹${e.amount}`
      )
      .join('\n');

    const prompt = `You are a personal finance assistant. Analyze the following expense records and provide a concise, friendly summary (3-5 sentences) covering:
1. Total spending and top spending categories
2. Any notable spending patterns or trends
3. One specific observation worth highlighting

Expenses:
${expenseText}

Provide a helpful, conversational summary. Do not use bullet points — write in natural flowing paragraphs.`;

    const result = await withTimeout(model.generateContent(prompt), 10000);
    return result.response.text().trim();
  } catch (error) {
    console.error('[geminiService] summarizeExpenses failed:', error.message);
    return null;
  }
};

/**
 * Suggests a monthly budget per category based on spending history.
 * @param {Array} expenses
 * @returns {Promise<Array<{category: string, currentAvg: number, suggestedBudget: number, tip: string}>|null>}
 */
const suggestBudget = async (expenses) => {
  try {
    if (!expenses || expenses.length === 0) return null;

    const model = genAI.getGenerativeModel({
      model: process.env.GEMINI_MODEL || 'gemini-2.0-flash',
    });

    // Aggregate by category before sending to Gemini —
    // reduces token count and gives the model cleaner input.
    const categoryTotals = expenses.reduce((acc, e) => {
      if (!acc[e.category]) acc[e.category] = 0;
      acc[e.category] += parseFloat(e.amount);
      return acc;
    }, {});

    const summaryText = Object.entries(categoryTotals)
      .map(([cat, total]) => `${cat}: ₹${total.toFixed(2)}`)
      .join('\n');

    const prompt = `You are a personal finance coach. Based on the following total spending by category, suggest a reasonable monthly budget for each category and one short tip.

Spending data:
${summaryText}

Respond ONLY with a valid JSON array. No explanation, no markdown, no backticks. Example format:
[{"category":"Food","currentSpend":3200,"suggestedBudget":2800,"tip":"Cook at home 3 days a week to save ₹400."}]

Rules:
- suggestedBudget should be a realistic reduction (5-20% lower than currentSpend) or the same if already reasonable.
- tip must be specific and actionable, under 15 words.
- Output ONLY the JSON array.`;

    const result = await withTimeout(model.generateContent(prompt), 10000);
    const rawText = result.response.text().trim().replace(/```json|```/g, '');
    return JSON.parse(rawText);
  } catch (error) {
    console.error('[geminiService] suggestBudget failed:', error.message);
    return null;
  }
};

module.exports = { suggestCategory, summarizeExpenses, suggestBudget };
