const { User, ForgotPasswordRequest, sequelize } = require('../models');
const { hashPassword } = require('../utils/passwordUtils');
const { sendPasswordResetEmail } = require('../services/mailService');

const RESET_LINK_EXPIRY_MINUTES = 30;

/**
 * POST /api/password/forgotpassword
 * Generates a reset request and emails the link.
 * Always responds with the same generic message regardless of
 * whether the email exists — never confirm/deny account existence.
 */
const forgotPassword = async (req, res, next) => {
  const { email } = req.body;
  const genericResponse = {
    message: 'If an account with that email exists, a reset link has been sent.',
  };

  try {
    const user = await User.findOne({ where: { email } });

    if (!user) {
      return res.status(200).json(genericResponse);
    }

    // Both writes now share one transaction — deactivating old requests
    // and creating the new one succeed or fail together.
    const transaction = await sequelize.transaction();
    let request;

    try {
      await ForgotPasswordRequest.update(
        { isActive: false },
        { where: { userId: user.id, isActive: true }, transaction }
      );

      request = await ForgotPasswordRequest.create({ userId: user.id }, { transaction });

      await transaction.commit();
    } catch (txError) {
      await transaction.rollback();
      throw txError;
    }

    const resetUrl = `${process.env.FRONTEND_URL}/password/resetpassword/${request.id}`;

    try {
      await sendPasswordResetEmail(user.email, resetUrl);
    } catch (mailError) {
      console.error('[mailService] Failed to send reset email:', mailError.message);
    }

    return res.status(200).json(genericResponse);
  } catch (error) {
    next(error);
  }
};
/**
 * GET /api/password/resetpassword/:id
 * Validates a reset link before showing the "set new password" form.
 * Checks both isActive AND expiry (30 minutes from creation).
 */
const checkResetLink = async (req, res, next) => {
  const { id } = req.params;

  try {
    const request = await ForgotPasswordRequest.findByPk(id);

    if (!request || !request.isActive) {
      return res.status(400).json({
        error: { message: 'This reset link is invalid or has already been used' },
      });
    }

    const ageMinutes = (Date.now() - new Date(request.createdAt).getTime()) / 60000;
    if (ageMinutes > RESET_LINK_EXPIRY_MINUTES) {
      // Expired links are deactivated on first detection — no need
      // to wait for a cleanup job, this self-heals on access.
      request.isActive = false;
      await request.save();

      return res.status(400).json({
        error: { message: 'This reset link has expired. Please request a new one.' },
      });
    }

    return res.status(200).json({ valid: true });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/password/resetpassword/:id
 * Sets the new password and permanently deactivates the link.
 */
const resetPassword = async (req, res, next) => {
  const { id } = req.params;
  const { newPassword } = req.body;

  const transaction = await sequelize.transaction();

  try {
    const request = await ForgotPasswordRequest.findByPk(id, { transaction });

    if (!request || !request.isActive) {
      await transaction.rollback();
      return res.status(400).json({
        error: { message: 'This reset link is invalid or has already been used' },
      });
    }

    const ageMinutes = (Date.now() - new Date(request.createdAt).getTime()) / 60000;
    if (ageMinutes > RESET_LINK_EXPIRY_MINUTES) {
      request.isActive = false;
      await request.save({ transaction });
      await transaction.commit();

      return res.status(400).json({
        error: { message: 'This reset link has expired. Please request a new one.' },
      });
    }

    const hashedPassword = await hashPassword(newPassword);

    await User.update(
      { password: hashedPassword },
      { where: { id: request.userId }, transaction }
    );

    // Deactivate immediately — this is what makes the link single-use.
    request.isActive = false;
    await request.save({ transaction });

    await transaction.commit();

    return res.status(200).json({ message: 'Password updated successfully' });
  } catch (error) {
    await transaction.rollback();
    next(error);
  }
};

module.exports = { forgotPassword, checkResetLink, resetPassword };