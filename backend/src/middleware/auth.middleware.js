// src/middleware/auth.middleware.js
// JWT authentication middleware.
// Attaches req.user = { id, role } on success.
// Full implementation pending — stub ready for auth controller integration.

const { verifyToken } = require("../utils/jwt.utils");
const { sendError } = require("../utils/response.utils");
const logger = require("../utils/logger");

const protect = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return sendError(res, 401, "No token provided. Authorization denied.");
    }

    const token = authHeader.split(" ")[1];
    const decoded = verifyToken(token);

    req.user = decoded;   // { id, role, iat, exp }
    next();
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      return sendError(res, 401, "Token has expired. Please log in again.");
    }
    logger.warn(`Auth middleware error: ${err.message}`);
    return sendError(res, 401, "Invalid token. Authorization denied.");
  }
};

module.exports = { protect };
