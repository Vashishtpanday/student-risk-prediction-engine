// src/utils/jwt.utils.js
// JWT sign and verify helpers.

const jwt = require("jsonwebtoken");
const { JWT_SECRET, JWT_EXPIRES_IN } = require("../config/env");

/**
 * Sign a JWT token.
 * @param {object} payload - Data to embed (e.g. { id, role })
 * @returns {string} Signed JWT token
 */
const signToken = (payload) => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
};

/**
 * Verify a JWT token.
 * @param {string} token
 * @returns {object} Decoded payload if valid
 * @throws {JsonWebTokenError|TokenExpiredError}
 */
const verifyToken = (token) => {
  return jwt.verify(token, JWT_SECRET);
};

module.exports = { signToken, verifyToken };
