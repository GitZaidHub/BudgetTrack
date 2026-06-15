const { User, sequelize } = require('../models');
const { hashPassword } = require('../utils/passwordUtils');

/**
 * POST /api/auth/signup
 * Creates a new user account.
 */
const signup = async (req, res, next) => {
  const { username, email, password } = req.body;

  // Use a transaction so that if anything fails mid-way,
  // no partial user record is left behind.
  const transaction = await sequelize.transaction();

  try {
    // Check for existing user with this email
    const existingUser = await User.findOne({
      where: { email },
      transaction,
    });

    if (existingUser) {
      await transaction.rollback();
      return res.status(409).json({
        error: { message: 'User already exists' },
      });
    }

    const hashedPassword = await hashPassword(password);

    const newUser = await User.create(
      {
        username,
        email,
        password: hashedPassword,
      },
      { transaction }
    );

    await transaction.commit();

    return res.status(201).json({
      message: 'User created successfully',
      user: {
        id: newUser.id,
        username: newUser.username,
        email: newUser.email,
        isPremium: newUser.isPremium,
        createdAt: newUser.createdAt,
      },
    });
  } catch (error) {
    await transaction.rollback();

    // Handle the DB-level unique constraint as a fallback
    // (in case of a race condition between the findOne check and create)
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(409).json({
        error: { message: 'User already exists' },
      });
    }

    next(error);
  }
};

module.exports = { signup };