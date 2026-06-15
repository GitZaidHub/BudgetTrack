const { validationResult } = require('express-validator');

/**
 * Runs after express-validator rule chains.
 * If any validation failed, responds with 422 and a structured error list.
 * Otherwise calls next().
 */
const validate = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(422).json({
      error: {
        message: 'Validation failed',
        details: errors.array().map((e) => ({
          field: e.path,
          message: e.msg,
        })),
      },
    });
  }

  next();
};

module.exports = validate;