// src/middleware/validators/prediction.validators.js
// express-validator chains for prediction routes.

const { body, param } = require("express-validator");

const predictSingleValidation = [
  body("studentId")
    .trim()
    .notEmpty().withMessage("studentId is required (MongoDB _id or studentId string)."),
];

const predictBatchValidation = [
  body("studentIds")
    .isArray({ min: 1, max: 100 })
    .withMessage("studentIds must be a non-empty array (max 100 entries)."),
  body("studentIds.*")
    .trim()
    .notEmpty().withMessage("Each studentId must be a non-empty string."),
];

module.exports = { predictSingleValidation, predictBatchValidation };


