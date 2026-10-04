// src/routes/prediction.routes.js

const express = require("express");
const router = express.Router();
const {
  predictSingle, predictBatch, getPredictionsByStudent,
} = require("../controllers/prediction.controller");
const { protect } = require("../middleware/auth.middleware");
const { validate } = require("../middleware/validate.middleware");
const {
  predictSingleValidation,
  predictBatchValidation,
} = require("../middleware/validators/prediction.validators");

router.use(protect);

// POST /api/predict  — single prediction
router.post("/", predictSingleValidation, validate, predictSingle);

// POST /api/predict/batch  — batch prediction
router.post("/batch", predictBatchValidation, validate, predictBatch);

// GET /api/predict/:studentId  — history
router.get("/:studentId", getPredictionsByStudent);

module.exports = router;
