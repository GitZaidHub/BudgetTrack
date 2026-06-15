const { User, sequelize } = require('../models');
const { hashPassword, comparePassword } = require('../utils/passwordUtils');
const { generateToken } = require('../utils/jwt');

/**
 * POST /api/auth/signup
 * Creates a new user account.
 */
const signup = async (req, res, next) => {
  const { username, email, password } = req.body;

  const transaction = await sequelize.transaction();

  try {
    const existingUser = await User.findOne({ where: { email }, transaction });

    if (existingUser) {
      await transaction.rollback();
      return res.status(409).json({
        error: { message: 'User already exists' },
      });
    }

    const hashedPassword = await hashPassword(password);

    const newUser = await User.create(
      { username, email, password: hashedPassword },
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

    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(409).json({
        error: { message: 'User already exists' },
      });
    }

    next(error);
  }
};

/**
 * POST /api/auth/login
 * Authenticates a user and returns a JWT token.
 */
const login = async (req, res, next) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ where: { email } });

    // Deliberately the SAME error message and status for both
    // "no such email" and "wrong password" — never reveal which one it was.
    if (!user) {
      return res.status(401).json({
        error: { message: 'Invalid credentials' },
      });
    }

    const isMatch = await comparePassword(password, user.password);

    if (!isMatch) {
      return res.status(401).json({
        error: { message: 'Invalid credentials' },
      });
    }

    const token = generateToken({ id: user.id, email: user.email });

    return res.status(200).json({
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        isPremium: user.isPremium,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/auth/me
 * Returns the currently authenticated user's profile.
 * Protected by authMiddleware — req.user is already populated.
 */
const getMe = async (req, res) => {
  return res.status(200).json({ user: req.user });
};

module.exports = { signup, login, getMe };