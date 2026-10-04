// src/middleware/validate.middleware.js
// express-validator result handler.
// Add this AFTER validation chains in any route definition.

const { validationResult } = require("express-validator");
const { sendError } = require("../utils/response.utils");

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return sendError(res, 422, "Validation failed.", errors.array());
  }
  next();
};

module.exports = { validate };
