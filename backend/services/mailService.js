const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: false, // false for port 587 (STARTTLS), true would be for port 465
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});

/**
 * Sends the password reset email containing the reset link.
 * Throws on failure — the controller decides how to handle that
 * (e.g., still returning a generic success message to the client
 * regardless, to avoid leaking whether the email send succeeded).
 */
const sendPasswordResetEmail = async (toEmail, resetUrl) => {
  await transporter.sendMail({
    from: `"${process.env.SMTP_FROM_NAME}" <${process.env.SMTP_FROM_EMAIL}>`,
    to: toEmail,
    subject: 'Reset your password',
    html: `
      <div style="font-family: sans-serif; max-width: 480px;">
        <h2>Reset your password</h2>
        <p>We received a request to reset your password for AI Expense Tracker.</p>
        <p>
          <a href="${resetUrl}"
             style="display:inline-block;padding:10px 20px;background:#4f46e5;
                    color:#fff;text-decoration:none;border-radius:6px;">
            Reset password
          </a>
        </p>
        <p>This link can only be used once. If you didn't request this, you can safely ignore this email.</p>
      </div>
    `,
  });
};

module.exports = { sendPasswordResetEmail };