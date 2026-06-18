const REQUIRED_ENV_VARS = [
  'PORT',
  'DB_HOST',
  'DB_PORT',
  'DB_NAME',
  'DB_USER',
  'DB_PASSWORD',
  'CLIENT_URL',
  'JWT_SECRET',
  'JWT_EXPIRES_IN',
  'GEMINI_API_KEY',
  'CASHFREE_APP_ID',
  'CASHFREE_SECRET_KEY',
  'CASHFREE_ENV',
  'PREMIUM_AMOUNT',
  'SMTP_HOST',
  'SMTP_PORT',
  'SMTP_USER',
  'SMTP_PASSWORD',
  'SMTP_FROM_EMAIL',
  'FRONTEND_URL',
];

// Vars that have known weak/placeholder values we should also reject,
// not just check for presence. Catches the common mistake of copying
// .env.example over .env without actually filling in real secrets.
const PLACEHOLDER_VALUES = new Set([
  '',
  'your_jwt_secret_here',
  'your_gemini_api_key_here',
  'your_test_app_id',
  'your_test_secret_key',
  'replace_this_with_a_long_random_string_at_least_32_chars',
]);

/**
 * Validates that all required environment variables are present and
 * don't still contain obvious placeholder text. Throws on failure —
 * server.js catches this and exits the process immediately, rather
 * than starting in a broken state.
 */
const validateEnv = () => {
  const missing = [];
  const placeholder = [];

  for (const key of REQUIRED_ENV_VARS) {
    const value = process.env[key];

    if (value === undefined || value === null) {
      missing.push(key);
    } else if (PLACEHOLDER_VALUES.has(value)) {
      placeholder.push(key);
    }
  }

  if (missing.length > 0 || placeholder.length > 0) {
    let message = 'Environment validation failed.\n';
    if (missing.length > 0) {
      message += `  Missing variables: ${missing.join(', ')}\n`;
    }
    if (placeholder.length > 0) {
      message += `  Variables still set to placeholder values: ${placeholder.join(', ')}\n`;
    }
    message += '  Check your .env file against .env.example.';

    throw new Error(message);
  }

  // Extra check: JWT_SECRET should be reasonably long, not just present.
  if (process.env.JWT_SECRET.length < 32) {
    throw new Error(
      'JWT_SECRET is too short (must be at least 32 characters). Generate one with:\n' +
        '  node -e "console.log(require(\'crypto\').randomBytes(48).toString(\'hex\'))"'
    );
  }
};

module.exports = validateEnv;