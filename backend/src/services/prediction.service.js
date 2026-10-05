// src/services/prediction.service.js
// Business logic for triggering and storing predictions.

const Student = require("../models/Student");
const Prediction = require("../models/Prediction");
const { predictSingle, predictBatch } = require("./ml.service");
const logger = require("../utils/logger");

/**
 * Normalize any ML risk label into schema enum:
 * LOW | MODERATE | HIGH | UNKNOWN
 */
const normalizeRiskLevel = (value) => {
  const v = String(value || "").trim().toLowerCase();

  if (!v) return "UNKNOWN";
  if (v.includes("high") || v === "2") return "HIGH";
  if (v.includes("mod") || v.includes("med") || v === "1") return "MODERATE";
  if (v.includes("low") || v === "0") return "LOW";

  // already enum-like
  if (["low", "moderate", "high", "unknown"].includes(v)) {
    return v.toUpperCase();
  }

  return "UNKNOWN";
};

/**
 * Normalize role for Prediction.triggeredByRole enum
 */
const normalizeTriggeredByRole = (role) => {
  const r = String(role || "").trim().toLowerCase();
  if (r === "admin" || r === "superadmin" || r === "faculty" || r === "student") {
    return r;
  }
  // safe fallback so save never crashes
  return "faculty";
};

/**
 * Build a UI-friendly recommendation string if ML didn't send one
 */
const buildRecommendationText = (featureData = {}, riskLevel = "UNKNOWN") => {
  const att = Number(featureData.attendancePercentage ?? 0);
  const marks = Number(featureData.internalMarksAverage ?? 0);
  const status = String(featureData.cpNcpStatus || "CP").toUpperCase();
  const backlogs = Number(featureData.previousBacklogs ?? 0);

  const tips = [];
  if (att < 75) tips.push(`Improve attendance (current ${att}%) to at least 75%.`);
  if (marks < 50) tips.push(`Focus on internals (current ${marks}/100).`);
  if (status === "NCP") tips.push("NCP status detected. Meet your mentor for remedial support.");
  if (backlogs > 0) tips.push(`Clear ${backlogs} backlog(s) on priority.`);
  if (riskLevel === "HIGH") tips.push("Immediate faculty counseling is recommended.");
  if (tips.length === 0) tips.push("Keep consistency in attendance and internals.");

  return tips.join(" ");
};

/**
 * Run a prediction for a single student and persist the result.
 * @param {string} studentObjectId - MongoDB _id of the student
 * @param {object} triggeredBy - { id, role } from req.user
 * @returns {Promise<object>} Saved Prediction document
 */
const runPredictionForStudent = async (studentObjectId, triggeredBy = null) => {
  const student = await Student.findById(studentObjectId);
  if (!student) {
    const err = new Error("Student not found.");
    err.statusCode = 404;
    throw err;
  }

  const featureData = {
    attendancePercentage: student.attendancePercentage,
    internalMarksAverage: student.internalMarksAverage,
    cpNcpStatus: student.cpNcpStatus,
    semester: student.semester,
    department: student.department,
    previousBacklogs: student.previousBacklogs ?? 0,
  };

  // Call ML service (Manshi)
  // expected flexible output keys:
  // riskLevel / risk_category / prediction
  const mlResultRaw = await predictSingle({
    student_id: student.studentId,
    attendance_pct: featureData.attendancePercentage,
    internal_marks: featureData.internalMarksAverage,
    cp_ncp: featureData.cpNcpStatus,
    semester: featureData.semester,
    previous_backlogs: featureData.previousBacklogs,
    // also pass camelCase for compatibility
    ...featureData,
  });

  const mlResult = mlResultRaw || {};
  const riskLevel = normalizeRiskLevel(
    mlResult.riskLevel || mlResult.risk_category || mlResult.prediction || mlResult.risk
  );

  const confidenceScore =
    mlResult.confidenceScore ??
    mlResult.confidence_score ??
    mlResult.confidence ??
    null;

  const recommendation =
    mlResult.recommendation ||
    (Array.isArray(mlResult.recommendations) && mlResult.recommendations.length
      ? mlResult.recommendations.map((r) => r.message || r).join(" ")
      : buildRecommendationText(featureData, riskLevel));

  const recommendations = Array.isArray(mlResult.recommendations)
    ? mlResult.recommendations
    : [];

  const contributingFactors =
    mlResult.contributingFactors || mlResult.contributing_factors || {};

  const triggeredByRole = normalizeTriggeredByRole(triggeredBy?.role);

  const prediction = await Prediction.create({
    student: student._id,
    studentId: student.studentId,
    inputFeatures: featureData,
    riskLevel,
    confidenceScore,
    recommendation,
    recommendations,
    contributingFactors,
    rawMlResponse: mlResult.rawMlResponse || mlResult,
    triggeredBy: triggeredBy?.id || triggeredBy?._id || null,
    triggeredByRole,
  });

  // Update latest risk level on the student document
  await Student.findByIdAndUpdate(student._id, {
    latestRiskLevel: riskLevel,
  });

  if (logger && logger.info) {
    logger.info(`Prediction saved for student ${student.studentId}: ${riskLevel}`);
  }

  // Return a response that frontend can consume easily
  return {
    ...prediction.toObject(),
    // aliases used by frontend
    risk_category:
      riskLevel === "HIGH"
        ? "High Risk"
        : riskLevel === "MODERATE"
        ? "Moderate Risk"
        : riskLevel === "LOW"
        ? "Low Risk"
        : "Unknown",
    confidence_score: confidenceScore,
    contributing_factors: contributingFactors,
  };
};

/**
 * Run batch predictions.
 * @param {string[]} studentObjectIds - Array of MongoDB _ids
 * @param {object} triggeredBy - { id, role } from req.user
 * @returns {Promise<object>} batch result
 */
const runBatchPredictions = async (studentObjectIds, triggeredBy = null) => {
  const students = await Student.find({ _id: { $in: studentObjectIds } });

  if (!students.length) {
    const err = new Error("No students found for the provided IDs.");
    err.statusCode = 404;
    throw err;
  }

  const batchJobId = `batch_${Date.now()}`;
  const triggeredByRole = normalizeTriggeredByRole(triggeredBy?.role);

  const featureList = students.map((s) => ({
    _student: s,
    student_id: s.studentId,
    attendancePercentage: s.attendancePercentage,
    internalMarksAverage: s.internalMarksAverage,
    cpNcpStatus: s.cpNcpStatus,
    semester: s.semester,
    department: s.department,
    previousBacklogs: s.previousBacklogs ?? 0,
    attendance_pct: s.attendancePercentage,
    internal_marks: s.internalMarksAverage,
    cp_ncp: s.cpNcpStatus,
    previous_backlogs: s.previousBacklogs ?? 0,
  }));

  let mlResults = [];
  try {
    mlResults = await predictBatch(featureList);
  } catch (e) {
    // fallback one-by-one if batch endpoint unavailable
    mlResults = [];
    for (const f of featureList) {
      try {
        mlResults.push(await predictSingle(f));
      } catch (_) {
        mlResults.push({ riskLevel: "UNKNOWN", confidenceScore: null });
      }
    }
  }

  const predictions = await Promise.all(
    students.map(async (student, i) => {
      const mlResult = mlResults[i] || {};
      const riskLevel = normalizeRiskLevel(
        mlResult.riskLevel || mlResult.risk_category || mlResult.prediction || mlResult.risk
      );
      const confidenceScore =
        mlResult.confidenceScore ?? mlResult.confidence_score ?? mlResult.confidence ?? null;

      const recommendation =
        mlResult.recommendation ||
        buildRecommendationText(featureList[i], riskLevel);

      const prediction = await Prediction.create({
        student: student._id,
        studentId: student.studentId,
        inputFeatures: {
          attendancePercentage: featureList[i].attendancePercentage,
          internalMarksAverage: featureList[i].internalMarksAverage,
          cpNcpStatus: featureList[i].cpNcpStatus,
          semester: featureList[i].semester,
          department: featureList[i].department,
          previousBacklogs: featureList[i].previousBacklogs,
        },
        riskLevel,
        confidenceScore,
        recommendation,
        recommendations: Array.isArray(mlResult.recommendations) ? mlResult.recommendations : [],
        contributingFactors: mlResult.contributingFactors || mlResult.contributing_factors || {},
        rawMlResponse: mlResult.rawMlResponse || mlResult,
        triggeredBy: triggeredBy?.id || triggeredBy?._id || null,
        triggeredByRole,
        batchJobId,
      });

      await Student.findByIdAndUpdate(student._id, { latestRiskLevel: riskLevel });
      return prediction;
    })
  );

  if (logger && logger.info) {
    logger.info(`Batch prediction complete. Job: ${batchJobId} | Count: ${predictions.length}`);
  }

  return { batchJobId, predictions };
};

module.exports = { runPredictionForStudent, runBatchPredictions };