const { verifyToken } = require('../utils/jwt');
const { User } = require('../models');

/**
 * Protects a route by requiring a valid JWT in the Authorization header.
 * Expected format: "Authorization: Bearer <token>"
 *
 * On success, attaches `req.user` = { id, username, email, isPremium }
 * On failure, responds 401 — never calls next(err) for auth failures,
 * since these are expected client errors, not server errors.
 */
const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        error: { message: 'Authentication required' },
      });
    }

    const token = authHeader.split(' ')[1];

    let decoded;
    try {
      decoded = verifyToken(token);
    } catch (err) {
      return res.status(401).json({
        error: { message: 'Invalid or expired token' },
      });
    }

    // Fetch the user fresh from DB so isPremium etc. is always current
    // (rather than trusting a potentially stale JWT payload).
    const user = await User.findByPk(decoded.id, {
      attributes: ['id', 'username', 'email', 'isPremium'],
    });

    if (!user) {
      return res.status(401).json({
        error: { message: 'User no longer exists' },
      });
    }

    req.user = user;
    next();
  } catch (error) {
    next(error); // genuinely unexpected error (e.g., DB down) → 500
  }
};

module.exports = authMiddleware;