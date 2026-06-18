/**
 * Must run AFTER authMiddleware (req.user must already be populated).
 * Blocks access to premium-only routes for non-premium users.
 */
const premiumMiddleware = (req, res, next) => {
  if (!req.user?.isPremium) {
    return res.status(403).json({
      error: { message: 'This feature requires a premium membership' },
    });
  }
  next();
};

module.exports = premiumMiddleware;