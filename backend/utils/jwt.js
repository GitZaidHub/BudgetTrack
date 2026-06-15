const jwt = require('jsonwebtoken');

/**
 * Sign a JWT token for a given user.
 * Keep the payload minimal — never put sensitive data (passwords, etc.) in it,
 * since JWT payloads are base64-encoded, NOT encrypted.
 * @param {{ id: number, email: string }} payload
 * @returns {string}
 */
const generateToken = (payload) => {
  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
};

/**
 * Verify and decode a JWT token.
 * Throws if invalid or expired — caller must catch.
 * @param {string} token
 * @returns {object} decoded payload
 */
const verifyToken = (token) => {
  return jwt.verify(token, process.env.JWT_SECRET);
};

module.exports = { generateToken, verifyToken };