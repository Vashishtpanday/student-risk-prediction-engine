// // src/models/Prediction.js
// // Stores each ML prediction result for a student.

// const mongoose = require("mongoose");

// const predictionSchema = new mongoose.Schema(
//   {
//     student: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "Student",
//       required: [true, "Student reference is required"],
//     },
//     studentId: {
//       // Denormalized for fast queries without populate
//       type: String,
//       required: true,
//     },

//     // -------------------------------------------------------
//     // ML Service Input Snapshot
//     // These are the exact feature values sent to the ML model.
//     // -------------------------------------------------------
//     inputFeatures: {
//       attendancePercentage: { type: Number },
//       internalMarksAverage: { type: Number },
//       cpNcpStatus: { type: String },
//       semester: { type: Number },
//       department: { type: String },
//       // Additional features may be added by ML team — do NOT hardcode more here
//       // until the ML API contract is finalized (see ml.service.js).
//     },

//     // -------------------------------------------------------
//     // ML Service Output
//     // Field names below are PLACEHOLDERS until Manshi (ML team)
//     // finalizes the API response contract.
//     // See: src/services/ml.service.js — ML_INTEGRATION_POINT
//     // -------------------------------------------------------
//     riskLevel: {
//       type: String,
//       enum: ["LOW", "MODERATE", "HIGH", "UNKNOWN"],
//       required: [true, "Risk level is required"],
//     },
//     confidenceScore: {
//       type: Number,       // 0.0 – 1.0
//       default: null,
//     },
//     recommendation: {
//       type: String,
//       default: null,
//     },
//     // Raw ML response stored for debugging / audit
//     rawMlResponse: {
//       type: mongoose.Schema.Types.Mixed,
//       default: null,
//     },

//     // Who triggered the prediction
//     triggeredBy: {
//       type: mongoose.Schema.Types.ObjectId,
//       refPath: "triggeredByRole",
//       default: null,
//     },
//     triggeredByRole: {
//       type: String,
//       enum: ["admin", "superadmin", "faculty"],
//       default: null,
//     },

//     // Batch prediction job ID (null for individual predictions)
//     batchJobId: {
//       type: String,
//       default: null,
//     },
//   },
//   {
//     timestamps: true,
//     versionKey: false,
//   }
// );

// // Indexes for common queries
// predictionSchema.index({ student: 1, createdAt: -1 });
// predictionSchema.index({ riskLevel: 1 });
// predictionSchema.index({ batchJobId: 1 });

// const Prediction = mongoose.model("Prediction", predictionSchema);

// module.exports = Prediction;



// src/models/Prediction.js
// Stores each ML prediction result for a student.

const mongoose = require("mongoose");

// Clear cached model so old enum does not stay in memory
if (mongoose.models.Prediction) {
  delete mongoose.models.Prediction;
}

const predictionSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: [true, "Student reference is required"],
    },
    studentId: {
      // Denormalized for fast queries without populate
      type: String,
      required: true,
    },

    // -------------------------------------------------------
    // ML Service Input Snapshot
    // -------------------------------------------------------
    inputFeatures: {
      attendancePercentage: { type: Number },
      internalMarksAverage: { type: Number },
      cpNcpStatus: { type: String },
      semester: { type: Number },
      department: { type: String },
      previousBacklogs: { type: Number },
    },

    // -------------------------------------------------------
    // ML Service Output
    // -------------------------------------------------------
    riskLevel: {
      type: String,
      enum: ["LOW", "MODERATE", "HIGH", "UNKNOWN"],
      required: [true, "Risk level is required"],
    },
    confidenceScore: {
      type: Number, // 0.0 – 1.0
      default: null,
    },
    recommendation: {
      type: String,
      default: null,
    },
    recommendations: {
      type: [mongoose.Schema.Types.Mixed],
      default: [],
    },
    contributingFactors: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    // Raw ML response stored for debugging / audit
    rawMlResponse: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },

    // Who triggered the prediction
    triggeredBy: {
      type: mongoose.Schema.Types.ObjectId,
      // keep flexible (student/faculty/admin ids)
      default: null,
    },
    triggeredByRole: {
      type: String,
      // ✅ FIX: allow student as well (case-insensitive normalized values)
      enum: ["admin", "superadmin", "faculty", "student"],
      default: null,
    },

    // Batch prediction job ID (null for individual predictions)
    batchJobId: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

// Indexes for common queries
predictionSchema.index({ student: 1, createdAt: -1 });
predictionSchema.index({ riskLevel: 1 });
predictionSchema.index({ batchJobId: 1 });
predictionSchema.index({ studentId: 1, createdAt: -1 });

const Prediction = mongoose.model("Prediction", predictionSchema);

module.exports = Prediction;