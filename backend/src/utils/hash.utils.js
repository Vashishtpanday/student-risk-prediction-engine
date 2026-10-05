// src/utils/hash.utils.js
// Password hashing helpers using bcryptjs.

const bcrypt = require("bcryptjs");

const SALT_ROUNDS = 12;

/**
 * Hash a plain-text password.
 * @param {string} password
 * @returns {Promise<string>} Hashed password
 */
const hashPassword = async (password) => {
  const salt = await bcrypt.genSalt(SALT_ROUNDS);
  return bcrypt.hash(password, salt);
};

/**
 * Compare a plain-text password with a hash.
 * @param {string} password - Plain text
 * @param {string} hash - Stored hash
 * @returns {Promise<boolean>}
 */
const comparePassword = async (password, hash) => {
  return bcrypt.compare(password, hash);
};

module.exports = { hashPassword, comparePassword };
