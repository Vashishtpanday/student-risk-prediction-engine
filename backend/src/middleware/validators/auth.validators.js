// src/middleware/validators/auth.validators.js
// express-validator chains for auth routes.

const { body } = require("express-validator");

const registerValidation = [
  body("role")
    .trim()
    .notEmpty().withMessage("Role is required.")
    .isIn(["admin", "faculty"]).withMessage("Role must be 'admin' or 'faculty'."),

  body("name")
    .trim()
    .notEmpty().withMessage("Name is required.")
    .isLength({ min: 2, max: 100 }).withMessage("Name must be 2-100 characters."),

  body("email")
    .trim()
    .notEmpty().withMessage("Email is required.")
    .isEmail().withMessage("Must be a valid email address.")
    .normalizeEmail(),

  body("password")
    .notEmpty().withMessage("Password is required.")
    .isLength({ min: 6 }).withMessage("Password must be at least 6 characters."),

  // Role-specific fields
  body("facultyId")
    .if(body("role").equals("faculty"))
    .trim()
    .notEmpty().withMessage("Faculty ID is required for role 'faculty'."),

  body("adminId")
    .if(body("role").equals("admin"))
    .trim()
    .notEmpty().withMessage("Admin ID is required for role 'admin'."),

  body("department")
    .if(body("role").equals("faculty"))
    .trim()
    .notEmpty().withMessage("Department is required for faculty."),
];

const loginValidation = [
  body("email")
    .trim()
    .notEmpty().withMessage("Email is required.")
    .isEmail().withMessage("Must be a valid email address.")
    .normalizeEmail(),

  body("password")
    .notEmpty().withMessage("Password is required."),

  body("role")
    .trim()
    .notEmpty().withMessage("Role is required.")
    .isIn(["admin", "faculty"]).withMessage("Role must be 'admin' or 'faculty'."),
];

module.exports = { registerValidation, loginValidation };
