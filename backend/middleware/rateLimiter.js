const rateLimit = require('express-rate-limit');

/**
 * Strict limiter for auth endpoints prone to brute-forcing
 * (login, signup, forgot-password). 10 requests per minute per IP.
 */
const authRateLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  standardHeaders: true, // adds RateLimit-* response headers
  legacyHeaders: false,
  message: {
    error: { message: 'Too many requests. Please try again in a minute.' },
  },
});

/**
 * Looser limiter for general API traffic — generous enough that
 * normal usage never hits it, but protects against runaway clients
 * or scripts hammering the API.
 */
const generalRateLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: { message: 'Too many requests. Please slow down.' },
  },
});

module.exports = { authRateLimiter, generalRateLimiter };