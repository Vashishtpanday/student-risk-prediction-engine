// src/controllers/auth.controller.js
// Full authentication controller.
// Supports roles: 'admin' (Admin model) and 'faculty' (Faculty model).

const Admin = require("../models/Admin");
const Faculty = require("../models/Faculty");
const { signToken } = require("../utils/jwt.utils");
const { hashPassword, comparePassword } = require("../utils/hash.utils");
const { sendSuccess, sendError } = require("../utils/response.utils");
const logger = require("../utils/logger");

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Return the correct Mongoose model based on role string.
 */
const getModelByRole = (role) => {
  if (role === "admin" || role === "superadmin") return Admin;
  if (role === "faculty") return Faculty;
  return null;
};

/**
 * Build a safe user object to return in responses (no passwordHash).
 */
const sanitizeUser = (user, role) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  role,
  department: user.department || undefined,
  ...(role === "faculty" ? { facultyId: user.facultyId } : { adminId: user.adminId }),
});

// ─── POST /api/auth/register ──────────────────────────────────────────────────
const register = async (req, res, next) => {
  try {
    const { role, name, email, password, department, facultyId, adminId, designation } = req.body;

    const Model = getModelByRole(role);
    if (!Model) {
      return sendError(res, 400, "Invalid role. Must be 'admin' or 'faculty'.");
    }

    // Check for duplicate email
    const existingUser = await Model.findOne({ email });
    if (existingUser) {
      return sendError(res, 409, "An account with this email already exists.");
    }

    // Check for duplicate role-specific ID
    if (role === "faculty") {
      const existingFacultyId = await Faculty.findOne({ facultyId: facultyId.toUpperCase() });
      if (existingFacultyId) {
        return sendError(res, 409, `Faculty ID '${facultyId}' is already registered.`);
      }
    }
    if (role === "admin") {
      const existingAdminId = await Admin.findOne({ adminId: adminId.toUpperCase() });
      if (existingAdminId) {
        return sendError(res, 409, `Admin ID '${adminId}' is already registered.`);
      }
    }

    const passwordHash = await hashPassword(password);

    let newUser;
    if (role === "faculty") {
      newUser = await Faculty.create({
        facultyId,
        name,
        email,
        passwordHash,
        department,
        designation: designation || undefined,
        role: "faculty",
      });
    } else {
      newUser = await Admin.create({
        adminId,
        name,
        email,
        passwordHash,
        role: "admin",
      });
    }

    const token = signToken({ id: newUser._id, role: newUser.role });

    logger.info(`New ${role} registered: ${email}`);

    return sendSuccess(res, 201, "Registration successful.", {
      token,
      user: sanitizeUser(newUser, newUser.role),
    });
  } catch (err) {
    next(err);
  }
};

// ─── POST /api/auth/login ─────────────────────────────────────────────────────
const login = async (req, res, next) => {
  try {
    const { email, password, role } = req.body;

    const Model = getModelByRole(role);
    if (!Model) {
      return sendError(res, 400, "Invalid role.");
    }

    // Explicitly select passwordHash (it has select:false on the schema)
    const user = await Model.findOne({ email }).select("+passwordHash");
    if (!user) {
      return sendError(res, 401, "Invalid email or password.");
    }

    if (!user.isActive) {
      return sendError(res, 403, "Your account has been deactivated. Contact the administrator.");
    }

    const isMatch = await comparePassword(password, user.passwordHash);
    if (!isMatch) {
      return sendError(res, 401, "Invalid email or password.");
    }

    const token = signToken({ id: user._id, role: user.role });

    logger.info(`${role} logged in: ${email}`);

    return sendSuccess(res, 200, "Login successful.", {
      token,
      user: sanitizeUser(user, user.role),
    });
  } catch (err) {
    next(err);
  }
};

// ─── POST /api/auth/logout ────────────────────────────────────────────────────
// JWT is stateless — logout is handled client-side by discarding the token.
// This endpoint exists for API completeness and future token-blacklist support.
const logout = async (req, res, next) => {
  try {
    // Future: add token to a Redis blacklist here if needed.
    logger.info(`User ${req.user.id} (${req.user.role}) logged out.`);
    return sendSuccess(res, 200, "Logout successful. Please discard your token client-side.");
  } catch (err) {
    next(err);
  }
};

// ─── GET /api/auth/me ─────────────────────────────────────────────────────────
const getMe = async (req, res, next) => {
  try {
    const { id, role } = req.user;

    const Model = getModelByRole(role);
    if (!Model) {
      return sendError(res, 400, "Invalid role in token.");
    }

    const user = await Model.findById(id);
    if (!user || !user.isActive) {
      return sendError(res, 404, "User not found or deactivated.");
    }

    return sendSuccess(res, 200, "Authenticated user fetched.", sanitizeUser(user, role));
  } catch (err) {
    next(err);
  }
};

module.exports = { register, login, logout, getMe };
