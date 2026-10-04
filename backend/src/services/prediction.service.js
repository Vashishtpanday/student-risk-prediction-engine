// src/services/prediction.service.js
// Business logic for triggering and storing predictions.
// Stub — full implementation after ML API contract is confirmed.

const Student = require("../models/Student");
const Prediction = require("../models/Prediction");
const { predictSingle, predictBatch } = require("./ml.service");
const logger = require("../utils/logger");

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

  const mlResult = await predictSingle(featureData);

  const prediction = await Prediction.create({
    student: student._id,
    studentId: student.studentId,
    inputFeatures: featureData,
    riskLevel: mlResult.riskLevel,
    confidenceScore: mlResult.confidenceScore,
    recommendation: mlResult.recommendation,
    rawMlResponse: mlResult.rawMlResponse,
    triggeredBy: triggeredBy?.id || null,
    triggeredByRole: triggeredBy?.role || null,
  });

  // Update latest risk level on the student document
  await Student.findByIdAndUpdate(student._id, {
    latestRiskLevel: mlResult.riskLevel,
  });

  logger.info(`Prediction saved for student ${student.studentId}: ${mlResult.riskLevel}`);
  return prediction;
};

/**
 * Run batch predictions.
 * @param {string[]} studentObjectIds - Array of MongoDB _ids
 * @param {object} triggeredBy - { id, role } from req.user
 * @returns {Promise<object[]>} Array of saved Prediction documents
 */
const runBatchPredictions = async (studentObjectIds, triggeredBy = null) => {
  const students = await Student.find({ _id: { $in: studentObjectIds } });

  if (!students.length) {
    const err = new Error("No students found for the provided IDs.");
    err.statusCode = 404;
    throw err;
  }

  const batchJobId = `batch_${Date.now()}`;

  const featureList = students.map((s) => ({
    _student: s,
    attendancePercentage: s.attendancePercentage,
    internalMarksAverage: s.internalMarksAverage,
    cpNcpStatus: s.cpNcpStatus,
    semester: s.semester,
    department: s.department,
    previousBacklogs: s.previousBacklogs ?? 0,
  }));

  const mlResults = await predictBatch(featureList);

  const predictions = await Promise.all(
    students.map(async (student, i) => {
      const mlResult = mlResults[i];
      const prediction = await Prediction.create({
        student: student._id,
        studentId: student.studentId,
        inputFeatures: featureList[i],
        riskLevel: mlResult.riskLevel,
        confidenceScore: mlResult.confidenceScore,
        recommendation: mlResult.recommendation,
        rawMlResponse: mlResult.rawMlResponse,
        triggeredBy: triggeredBy?.id || null,
        triggeredByRole: triggeredBy?.role || null,
        batchJobId,
      });
      await Student.findByIdAndUpdate(student._id, { latestRiskLevel: mlResult.riskLevel });
      return prediction;
    })
  );

  logger.info(`Batch prediction complete. Job: ${batchJobId} | Count: ${predictions.length}`);
  return { batchJobId, predictions };
};

module.exports = { runPredictionForStudent, runBatchPredictions };
