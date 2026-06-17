const { Expense, sequelize } = require('../models');

/**
 * POST /api/expenses
 * Creates a new expense for the authenticated user.
 * userId is taken from req.user (set by authMiddleware) — NEVER from req.body.
 */
const createExpense = async (req, res, next) => {
  const { amount, description, category } = req.body;
  const userId = req.user.id;

  const transaction = await sequelize.transaction();

  try {
    const expense = await Expense.create(
      { amount, description, category, userId },
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
 * GET /api/expenses
 * Lists all expenses belonging to the authenticated user, newest first.
 * Pagination is added in Milestone 11 — for now, returns the full list.
 */
const getExpenses = async (req, res, next) => {
  const userId = req.user.id;

  try {
    const expenses = await Expense.findAll({
      where: { userId },
      order: [['createdAt', 'DESC']],
    });

    return res.status(200).json({ expenses });
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