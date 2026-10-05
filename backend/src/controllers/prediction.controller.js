// src/controllers/prediction.controller.js
// Prediction controller — calls prediction.service which calls ml.service.

const mongoose = require("mongoose");
const Student = require("../models/Student");
const Prediction = require("../models/Prediction");
const {
  runPredictionForStudent,
  runBatchPredictions,
} = require("../services/prediction.service");
const { sendSuccess, sendError } = require("../utils/response.utils");
const logger = require("../utils/logger");

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

// ─── Resolve studentId string → Student doc ───────────────────────────────────
const resolveStudent = async (idParam) => {
  if (!idParam) return null;
  const raw = String(idParam).trim();

  if (isValidObjectId(raw)) {
    const byId = await Student.findById(raw);
    if (byId) return byId;
  }

  return Student.findOne({
    $or: [
      { studentId: raw.toUpperCase() },
      { student_id: raw.toUpperCase() },
      { studentId: raw },
      { student_id: raw },
      { email: raw.toLowerCase() },
    ],
  });
};

// ─── POST /api/predict ────────────────────────────────────────────────────────
// Body: { studentId: "<_id or studentId string>" }
const predictSingle = async (req, res, next) => {
  try {
    // accept multiple key aliases from frontend
    const studentId =
      req.body.studentId ||
      req.body.student_id ||
      req.body.id ||
      req.body._id;

    const student = await resolveStudent(studentId);
    if (!student) {
      return sendError(res, 404, `Student not found: ${studentId}`);
    }

    if (student.isActive === false) {
      return sendError(res, 400, "Cannot predict for a deactivated student.");
    }

    // Validate that minimum required ML features exist
    if (
      student.attendancePercentage === null ||
      student.attendancePercentage === undefined ||
      student.internalMarksAverage === null ||
      student.internalMarksAverage === undefined
    ) {
      return sendError(
        res,
        422,
        "Student is missing attendance or internal marks data. Update the student record before predicting."
      );
    }

    // IMPORTANT: pass role normalized; service will sanitize for enum
    const prediction = await runPredictionForStudent(student._id, req.user);

    if (logger && logger.info) {
      logger.info(
        `Single prediction triggered by ${req.user?.role} ${req.user?.id} for student ${student.studentId}`
      );
    }

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
    const studentIds = req.body.studentIds || req.body.students || [];

    // Resolve all studentId strings → MongoDB _ids
    const resolvedIds = [];
    const notFound = [];

    for (const sid of studentIds) {
      // if objects were sent, extract id
      const value =
        typeof sid === "object"
          ? sid.studentId || sid.student_id || sid._id || sid.id
          : sid;

      const student = await resolveStudent(value);
      if (!student) notFound.push(value);
      else resolvedIds.push(student._id);
    }

    if (!resolvedIds.length) {
      return sendError(res, 404, "None of the provided student IDs were found.", {
        notFound,
      });
    }

    const result = await runBatchPredictions(resolvedIds, req.user);

    if (logger && logger.info) {
      logger.info(
        `Batch prediction job ${result.batchJobId} — ${result.predictions.length} successful, ${notFound.length} not found`
      );
    }

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
    if (riskLevel) filter.riskLevel = String(riskLevel).toUpperCase();

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
      {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum),
      }
    );
  } catch (err) {
    next(err);
  }
};

module.exports = {
  predictSingle,
  predictBatch,
  getPredictionsByStudent,
  // aliases used by some route files
  predictStudent: predictSingle,
  batchPredict: predictBatch,
  getStudentPredictionHistory: getPredictionsByStudent,
};