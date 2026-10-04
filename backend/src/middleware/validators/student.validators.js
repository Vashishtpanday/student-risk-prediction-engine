// src/middleware/validators/student.validators.js
// express-validator chains for student routes.

const { body, query, param } = require("express-validator");

const createStudentValidation = [
  body("studentId")
    .trim()
    .notEmpty().withMessage("Student ID is required.")
    .isLength({ min: 2, max: 20 }).withMessage("Student ID must be 2-20 characters."),

  body("name")
    .trim()
    .notEmpty().withMessage("Student name is required.")
    .isLength({ min: 2, max: 100 }).withMessage("Name must be 2-100 characters."),

  body("email")
    .trim()
    .notEmpty().withMessage("Email is required.")
    .isEmail().withMessage("Must be a valid email address.")
    .normalizeEmail(),

  body("department")
    .trim()
    .notEmpty().withMessage("Department is required."),

  body("semester")
    .notEmpty().withMessage("Semester is required.")
    .isInt({ min: 1, max: 8 }).withMessage("Semester must be between 1 and 8."),

  body("section")
    .optional()
    .trim()
    .isLength({ max: 10 }).withMessage("Section must be at most 10 characters."),

  body("batch")
    .optional()
    .trim()
    .isLength({ max: 20 }).withMessage("Batch must be at most 20 characters."),

  body("cpNcpStatus")
    .optional()
    .isIn(["CP", "NCP", "UNKNOWN"]).withMessage("cpNcpStatus must be CP, NCP, or UNKNOWN."),

  body("attendancePercentage")
    .optional()
    .isFloat({ min: 0, max: 100 }).withMessage("Attendance must be between 0 and 100."),

  body("internalMarksAverage")
    .optional()
    .isFloat({ min: 0, max: 100 }).withMessage("Internal marks average must be between 0 and 100."),

  body("previousBacklogs")
    .optional()
    .isInt({ min: 0, max: 5 }).withMessage("previousBacklogs must be an integer between 0 and 5."),
];

const updateStudentValidation = [
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

  body("semester")
    .optional()
    .isInt({ min: 1, max: 8 }).withMessage("Semester must be between 1 and 8."),

  body("cpNcpStatus")
    .optional()
    .isIn(["CP", "NCP", "UNKNOWN"]).withMessage("cpNcpStatus must be CP, NCP, or UNKNOWN."),

  body("attendancePercentage")
    .optional()
    .isFloat({ min: 0, max: 100 }).withMessage("Attendance must be between 0 and 100."),

  body("internalMarksAverage")
    .optional()
    .isFloat({ min: 0, max: 100 }).withMessage("Internal marks average must be between 0 and 100."),

  body("previousBacklogs")
    .optional()
    .isInt({ min: 0, max: 5 }).withMessage("previousBacklogs must be an integer between 0 and 5."),

  body("isActive")
    .optional()
    .isBoolean().withMessage("isActive must be a boolean."),
];

const listStudentsValidation = [
  query("department").optional().trim(),
  query("semester").optional().isInt({ min: 1, max: 8 }).withMessage("Semester must be 1-8."),
  query("riskLevel")
    .optional()
    .isIn(["LOW", "MODERATE", "HIGH", "UNKNOWN"]).withMessage("Invalid riskLevel."),
  query("page")
    .optional()
    .isInt({ min: 1 }).withMessage("Page must be a positive integer."),
  query("limit")
    .optional()
    .isInt({ min: 1, max: 100 }).withMessage("Limit must be between 1 and 100."),
  query("search").optional().trim(),
];

module.exports = { createStudentValidation, updateStudentValidation, listStudentsValidation };
