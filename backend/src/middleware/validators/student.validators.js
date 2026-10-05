// src/middleware/validators/student.validators.js
// express-validator chains for student routes.

const { body, query, param } = require("express-validator");

const createStudentValidation = [
  body("studentId")
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 }).withMessage("Student ID must be 2-50 characters."),

  body("student_id")
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 }).withMessage("Student ID must be 2-50 characters."),

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
    .trim(),

  body("attendancePercentage")
    .optional()
    .isFloat({ min: 0, max: 100 }).withMessage("Attendance must be between 0 and 100."),

  body("internalMarksAverage")
    .optional()
    .isFloat({ min: 0, max: 100 }).withMessage("Internal marks average must be between 0 and 100."),

  body("previousBacklogs")
    .optional()
    .isInt({ min: 0, max: 50 }).withMessage("previousBacklogs must be an integer between 0 and 50."),
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
    .trim(),

  body("attendancePercentage")
    .optional()
    .isFloat({ min: 0, max: 100 }).withMessage("Attendance must be between 0 and 100."),

  body("internalMarksAverage")
    .optional()
    .isFloat({ min: 0, max: 100 }).withMessage("Internal marks average must be between 0 and 100."),

  body("previousBacklogs")
    .optional()
    .isInt({ min: 0, max: 50 }).withMessage("previousBacklogs must be an integer between 0 and 50."),

  body("isActive")
    .optional()
    .isBoolean().withMessage("isActive must be a boolean."),
];

const listStudentsValidation = [
  query("department").optional().trim(),
  query("semester").optional().trim(),
  query("riskLevel").optional().trim(),
  query("page")
    .optional()
    .isInt({ min: 1 }).withMessage("Page must be a positive integer."),
  query("limit")
    .optional()
    .isInt({ min: 1, max: 10000 }).withMessage("Limit must be between 1 and 10000."), // <--- Increased from 100 to 10000!
  query("search").optional().trim(),
  query("all").optional().trim(),
];

module.exports = {
  createStudentValidation,
  updateStudentValidation,
  listStudentsValidation,
  createRules: createStudentValidation,
  updateRules: updateStudentValidation,
};