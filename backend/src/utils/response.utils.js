// src/utils/response.utils.js
// Standardized API response helpers.
// Every controller should use these so responses are consistent.

/**
 * Send a success response.
 * @param {object} res - Express response object
 * @param {number} statusCode - HTTP status code (default 200)
 * @param {string} message - Human-readable message
 * @param {*} data - Payload to return
 * @param {object} meta - Optional pagination/meta info
 */
const sendSuccess = (res, statusCode = 200, message = "Success", data = null, meta = null) => {
  const body = { success: true, message };
  if (data !== null) body.data = data;
  if (meta !== null) body.meta = meta;
  return res.status(statusCode).json(body);
};

/**
 * Send an error response.
 * @param {object} res - Express response object
 * @param {number} statusCode - HTTP status code (default 500)
 * @param {string} message - Human-readable error message
 * @param {*} errors - Optional validation errors or details
 */
const sendError = (res, statusCode = 500, message = "Internal Server Error", errors = null) => {
  const body = { success: false, message };
  if (errors !== null) body.errors = errors;
  return res.status(statusCode).json(body);
};

module.exports = { sendSuccess, sendError };
