// src/services/ml.service.js
// HTTP client for the Python ML service (Flask) running on port 5001.
//
// API CONTRACT — Confirmed from ml-service/src/app.py (Manshi, ml-service/manshi branch)
// ========================================================================================
//
// ENDPOINTS:
//   GET  /health
//   POST /predict
//   POST /batch-predict
//
// POST /predict — Request body:
//   {
//     "attendance_pct"     : number (0-100),
//     "internal_marks"     : number (0-100),
//     "semester"           : integer (1-8),
//     "previous_backlogs"  : integer (0-5)
//   }
//
// POST /predict — Response body:
//   {
//     "success"    : true,
//     "model"      : "Decision Tree",
//     "input"      : { ...echoed fields },
//     "prediction" : {
//       "risk_category"  : "Low Risk" | "Moderate Risk" | "High Risk",
//       "confidence"     : 0.9234,           // optional (if model supports predict_proba)
//       "probabilities"  : { "Low Risk": 0.1, "Moderate Risk": 0.2, "High Risk": 0.7 }
//     }
//   }
//
// POST /batch-predict — Request body: JSON ARRAY (NOT wrapped in an object)
//   [
//     { "attendance_pct": 72, "internal_marks": 65, "semester": 3, "previous_backlogs": 0 },
//     { "attendance_pct": 55, "internal_marks": 40, "semester": 5, "previous_backlogs": 2 }
//   ]
//
// POST /batch-predict — Response body:
//   {
//     "success" : true,
//     "count"   : 2,
//     "results" : [
//       { "index": 0, "success": true, "risk_category": "Low Risk",  "confidence": 0.91 },
//       { "index": 1, "success": true, "risk_category": "High Risk", "confidence": 0.87 }
//     ]
//   }
//
// NOTE: risk_category values from ML service use Title Case with spaces:
//   "Low Risk" | "Moderate Risk" | "High Risk"
//   These are normalized to uppercase in parseMLResponse() for storage.
// ========================================================================================

const axios = require("axios");
const { ML_SERVICE_URL } = require("../config/env");
const logger = require("../utils/logger");

// Axios instance scoped to ML service
const mlClient = axios.create({
  baseURL: ML_SERVICE_URL,
  timeout: 30000,
  headers: { "Content-Type": "application/json" },
});

// Map ML service risk_category string → our enum value
const normalizeRiskLevel = (riskCategory) => {
  if (!riskCategory) return "UNKNOWN";
  const lower = riskCategory.toLowerCase().replace(/\s+/g, "");
  if (lower === "lowrisk")      return "LOW";
  if (lower === "moderaterisk") return "MODERATE";
  if (lower === "highrisk")     return "HIGH";
  return "UNKNOWN";
};

/**
 * Build ML service request payload from student data.
 * Field names match exactly what Manshi's app.py expects.
 */
const buildRequestPayload = (studentData) => ({
  attendance_pct:    Number(studentData.attendancePercentage),
  internal_marks:    Number(studentData.internalMarksAverage),
  semester:          parseInt(studentData.semester, 10),
  previous_backlogs: parseInt(studentData.previousBacklogs ?? 0, 10),
});

/**
 * Parse a single ML service prediction response into our normalized shape.
 */
const parseMLResponse = (mlData) => ({
  riskLevel:      normalizeRiskLevel(mlData.prediction?.risk_category),
  confidenceScore: mlData.prediction?.confidence ?? null,
  recommendation:  null,   // ML service does not return recommendations yet
  rawMlResponse:   mlData,
});

// ─── Single Prediction ────────────────────────────────────────────────────────

/**
 * Call ML /predict for a single student.
 * @param {object} studentData - { attendancePercentage, internalMarksAverage, semester, previousBacklogs }
 * @returns {Promise<{ riskLevel, confidenceScore, recommendation, rawMlResponse }>}
 */
const predictSingle = async (studentData) => {
  try {
    logger.debug(`ML /predict → ${ML_SERVICE_URL}/predict`);
    const response = await mlClient.post("/predict", buildRequestPayload(studentData));

    if (!response.data?.success) {
      throw new Error(`ML service error: ${response.data?.error || "Unknown error"}`);
    }

    logger.debug(`ML /predict ← risk_category: ${response.data.prediction?.risk_category}`);
    return parseMLResponse(response.data);
  } catch (err) {
    if (err.response) {
      const msg = err.response.data?.error || JSON.stringify(err.response.data);
      logger.error(`ML /predict [${err.response.status}]: ${msg}`);
      throw new Error(`ML service error (${err.response.status}): ${msg}`);
    }
    if (err.code === "ECONNREFUSED") {
      logger.error("ML service is not running on port 5001.");
      throw new Error("ML service is unavailable. Please ensure the Python service is running on port 5001.");
    }
    throw err;
  }
};

// ─── Batch Prediction ─────────────────────────────────────────────────────────

/**
 * Call ML /batch-predict for multiple students.
 * NOTE: Manshi's endpoint expects a RAW JSON array — not wrapped in an object.
 * @param {Array<object>} studentsArray - Array of student feature objects
 * @returns {Promise<Array<{ riskLevel, confidenceScore, recommendation, rawMlResponse }>>}
 */
const predictBatch = async (studentsArray) => {
  try {
    // Build array payload (plain array, NOT { students: [...] })
    const payload = studentsArray.map(buildRequestPayload);

    logger.debug(`ML /batch-predict → ${ML_SERVICE_URL}/batch-predict (${payload.length} students)`);
    const response = await mlClient.post("/batch-predict", payload);

    if (!response.data?.success) {
      throw new Error(`ML batch error: ${response.data?.error || "Unknown error"}`);
    }

    logger.debug(`ML /batch-predict ← ${response.data.count} results`);

    // Map each result back — preserve index order
    return response.data.results.map((r) => {
      if (!r.success) {
        logger.warn(`ML batch: index ${r.index} failed — ${r.error}`);
        return {
          riskLevel:      "UNKNOWN",
          confidenceScore: null,
          recommendation:  null,
          rawMlResponse:   r,
        };
      }
      return parseMLResponse({
        prediction: {
          risk_category: r.risk_category,
          confidence:    r.confidence ?? null,
        },
        _batchResult: r,
      });
    });
  } catch (err) {
    if (err.response) {
      const msg = err.response.data?.error || JSON.stringify(err.response.data);
      logger.error(`ML /batch-predict [${err.response.status}]: ${msg}`);
      throw new Error(`ML service batch error (${err.response.status}): ${msg}`);
    }
    if (err.code === "ECONNREFUSED") {
      throw new Error("ML service is unavailable. Please ensure the Python service is running on port 5001.");
    }
    throw err;
  }
};

// ─── Health Check ─────────────────────────────────────────────────────────────

/**
 * Ping ML service /health endpoint.
 * @returns {Promise<boolean>}
 */
const checkMLHealth = async () => {
  try {
    const response = await mlClient.get("/health");
    return response.status === 200 && response.data?.status === "healthy";
  } catch {
    return false;
  }
};

module.exports = { predictSingle, predictBatch, checkMLHealth, buildRequestPayload };
