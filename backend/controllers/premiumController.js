const { User, Expense, sequelize } = require('../models');

/**
 * GET /api/premium/leaderboard
 *
 * Returns every user with their total expense amount, ordered
 * highest-first. This is a single aggregated query using a LEFT JOIN —
 * NOT a findAll() on Users followed by a separate sum query per user
 * (which would be an N+1 query pattern that gets slower as users grow).
 *
 * LEFT JOIN (not INNER JOIN) ensures users with zero expenses still
 * appear on the leaderboard with a total of 0, rather than being
 * silently excluded.
 */
const getLeaderboard = async (req, res, next) => {
  try {
    const leaderboard = await User.findAll({
      attributes: [
        'id',
        'username',
        [sequelize.fn('COALESCE', sequelize.fn('SUM', sequelize.col('Expenses.amount')), 0), 'totalExpenses'],
      ],
      include: [
        {
          model: Expense,
          attributes: [], // we only need the aggregate, not individual rows
          required: false, // LEFT JOIN
        },
      ],
      group: ['User.id', 'User.username'],
      order: [[sequelize.literal('totalExpenses'), 'DESC']],
      subQuery: false, // required so LIMIT/GROUP BY work correctly with the include
    });

    return res.status(200).json({ leaderboard });
  } catch (error) {
    next(error);
  }
};

module.exports = { getLeaderboard };