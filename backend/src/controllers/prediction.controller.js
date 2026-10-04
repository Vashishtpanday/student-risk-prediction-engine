// src/controllers/prediction.controller.js
// Prediction controller — calls prediction.service which calls ml.service.
//
// NOTE: ML integration points are marked in src/services/ml.service.js.
// These endpoints wire up correctly but ML calls will fail until the
// Python service (port 5001) is running with a confirmed API contract.

const mongoose = require("mongoose");
const Student = require("../models/Student");
const Prediction = require("../models/Prediction");
const { runPredictionForStudent, runBatchPredictions } = require("../services/prediction.service");
const { sendSuccess, sendError } = require("../utils/response.utils");
const logger = require("../utils/logger");

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

// ─── Resolve studentId string → MongoDB _id ───────────────────────────────────
const resolveStudent = async (idParam) => {
  if (isValidObjectId(idParam)) {
    return Student.findById(idParam);
  }
  return Student.findOne({ studentId: idParam.toUpperCase() });
};

// ─── POST /api/predict ────────────────────────────────────────────────────────
// Body: { studentId: "<_id or studentId string>" }
const predictSingle = async (req, res, next) => {
  try {
    const { studentId } = req.body;

    const student = await resolveStudent(studentId);
    if (!student) {
      return sendError(res, 404, `Student not found: ${studentId}`);
    }

    if (!student.isActive) {
      return sendError(res, 400, "Cannot predict for a deactivated student.");
    }

    // Validate that minimum required ML features exist
    if (student.attendancePercentage === null || student.internalMarksAverage === null) {
      return sendError(
        res,
        422,
        "Student is missing attendance_pct or internal_marks data. Update the student record before predicting."
      );
    }

    const prediction = await runPredictionForStudent(student._id, req.user);

    logger.info(`Single prediction triggered by ${req.user.role} ${req.user.id} for student ${student.studentId}`);
    return sendSuccess(res, 201, "Prediction completed successfully.", prediction);
  } catch (err) {
    // Surface ML service errors with a clear message
    if (err.message && err.message.toLowerCase().includes("ml service")) {
      return sendError(res, 503, err.message);
    }
    next(err);
  }
};

// ─── POST /api/predict/batch ──────────────────────────────────────────────────
// Body: { studentIds: ["<_id or studentId>", ...] }
const predictBatch = async (req, res, next) => {
  try {
    const { studentIds } = req.body;

    // Resolve all studentId strings → MongoDB _ids
    const resolvedIds = [];
    const notFound = [];

    for (const sid of studentIds) {
      const student = await resolveStudent(sid);
      if (!student) {
        notFound.push(sid);
      } else {
        resolvedIds.push(student._id);
      }
    }

    if (!resolvedIds.length) {
      return sendError(res, 404, "None of the provided student IDs were found.", { notFound });
    }

    const result = await runBatchPredictions(resolvedIds, req.user);

    logger.info(
      `Batch prediction job ${result.batchJobId} — ${result.predictions.length} successful, ${notFound.length} not found`
    );

    return sendSuccess(res, 201, "Batch prediction completed.", {
      batchJobId: result.batchJobId,
      processed: result.predictions.length,
      notFound,
      predictions: result.predictions,
    });
  } catch (err) {
    if (err.message && err.message.toLowerCase().includes("ml service")) {
      return sendError(res, 503, err.message);
    }
    next(err);
  }
};

// ─── GET /api/predict/:studentId ─────────────────────────────────────────────
// Returns paginated prediction history for a student.
const getPredictionsByStudent = async (req, res, next) => {
  try {
    const { studentId } = req.params;
    const { page = 1, limit = 10, riskLevel } = req.query;

    const student = await resolveStudent(studentId);
    if (!student) {
      return sendError(res, 404, `Student not found: ${studentId}`);
    }

    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.min(50, Math.max(1, parseInt(limit, 10)));
    const skip = (pageNum - 1) * limitNum;

    const filter = { student: student._id };
    if (riskLevel) filter.riskLevel = riskLevel.toUpperCase();

    const [predictions, total] = await Promise.all([
      Prediction.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .select("-rawMlResponse"),
      Prediction.countDocuments(filter),
    ]);

    return sendSuccess(
      res,
      200,
      `Predictions for student ${student.studentId}.`,
      {
        student: {
          id: student._id,
          studentId: student.studentId,
          name: student.name,
          latestRiskLevel: student.latestRiskLevel,
        },
        predictions,
      },
      { total, page: pageNum, limit: limitNum, totalPages: Math.ceil(total / limitNum) }
    );
  } catch (err) {
    next(err);
  }
};

module.exports = { predictSingle, predictBatch, getPredictionsByStudent };
