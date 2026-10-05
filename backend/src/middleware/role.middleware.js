// src/middleware/role.middleware.js
// Role-based access control middleware.
// Usage: router.get("/admin-only", protect, authorize("admin", "superadmin"), handler)

const { sendError } = require("../utils/response.utils");

/**
 * Authorize one or more roles.
 * Must be used AFTER protect() middleware (req.user must exist).
 * @param  {...string} roles - Allowed roles (e.g. "admin", "faculty")
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return sendError(res, 401, "Not authenticated.");
    }

    if (!roles.includes(req.user.role)) {
      return sendError(
        res,
        403,
        `Access denied. Required role(s): ${roles.join(", ")}. Your role: ${req.user.role}`
      );
    }

    next();
  };
};

module.exports = { authorize };
