// src/middleware/validators/faculty.validators.js
// express-validator chains for faculty routes.

const { body } = require("express-validator");

const createFacultyValidation = [
  body("facultyId")
    .trim()
    .notEmpty().withMessage("Faculty ID is required.")
    .isLength({ min: 2, max: 20 }).withMessage("Faculty ID must be 2-20 characters."),

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

  body("department")
    .trim()
    .notEmpty().withMessage("Department is required."),

  body("designation")
    .optional()
    .trim()
    .isLength({ max: 100 }).withMessage("Designation must be at most 100 characters."),
];

const updateFacultyValidation = [
  body("name")
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 }).withMessage("Name must be 2-100 characters."),

  body("email")
    .optional()
    .trim()
    .isEmail().withMessage("Must be a valid email address.")
    .normalizeEmail(),

  body("department")
    .optional()
    .trim()
    .notEmpty().withMessage("Department cannot be empty."),

  body("designation")
    .optional()
    .trim()
    .isLength({ max: 100 }).withMessage("Designation must be at most 100 characters."),

  body("isActive")
    .optional()
    .isBoolean().withMessage("isActive must be a boolean."),

  body("password")
    .optional()
    .isLength({ min: 6 }).withMessage("New password must be at least 6 characters."),
];

module.exports = { createFacultyValidation, updateFacultyValidation };
