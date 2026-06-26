const { Expense, sequelize } = require('../models');

/**
 * POST /api/expenses
 * Creates a new expense for the authenticated user.
 * userId is taken from req.user (set by authMiddleware) — NEVER from req.body.
 */
const createExpense = async (req, res, next) => {
  const { amount, description, category,note } = req.body;
  const userId = req.user.id;

  const transaction = await sequelize.transaction();

  try {
    const expense = await Expense.create(
      { amount, description, category,note: note || null, userId  },
      { transaction }
    );

    await transaction.commit();

    return res.status(201).json({
      message: 'Expense added successfully',
      expense,
    });
  } catch (error) {
    await transaction.rollback();
    next(error);
  }
};

/**
 * GET /api/expenses?page=1&limit=10
 * Lists the authenticated user's expenses, paginated.
 * Defaults to page=1, limit=10 if not provided.
 */
const getExpenses = async (req, res, next) => {
  const userId = req.user.id;

  // express-validator's .toInt() already coerced these, but default
  // here too in case the query params were omitted entirely.
 const page = Number(req.query.page) || 1;
const limit = Number(req.query.limit) || 10;
const offset = (page - 1) * limit;

  try {
    // findAndCountAll does both the paginated SELECT and the total
    // COUNT in a way Sequelize optimizes internally — no need to
    // run two separate queries by hand.
    console.log({
  page,
  limit,
  offset,
  pageType: typeof page,
  limitType: typeof limit,
});
    const { count, rows } = await Expense.findAndCountAll({
      where: { userId },
      order: [['createdAt', 'DESC']],
      limit,
      offset,
    });

    const totalPages = Math.max(1, Math.ceil(count / limit));

    return res.status(200).json({
      expenses: rows,
      totalCount: count,
      totalPages,
      currentPage: page,
      limit,
    });
  } catch (error) {
    next(error);
  }
};
/**
 * DELETE /api/expenses/:id
 * Deletes an expense — but only if it belongs to the authenticated user.
 */
const deleteExpense = async (req, res, next) => {
  const userId = req.user.id;
  const expenseId = req.params.id;

  const transaction = await sequelize.transaction();

  try {
    // Scoping the where clause to BOTH id AND userId is what makes
    // this "protected" — a user can never delete someone else's
    // expense, even if they guess a valid expense id.
    const expense = await Expense.findOne({
      where: { id: expenseId, userId },
      transaction,
    });

    if (!expense) {
      await transaction.rollback();
      return res.status(404).json({
        error: { message: 'Expense not found' },
      });
    }

    await expense.destroy({ transaction });
    await transaction.commit();

    return res.status(200).json({ message: 'Expense deleted successfully' });
  } catch (error) {
    await transaction.rollback();
    next(error);
  }
};

module.exports = { createExpense, getExpenses, deleteExpense };