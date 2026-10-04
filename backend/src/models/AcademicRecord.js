// src/models/AcademicRecord.js
// Semester-wise academic record for a student.
// Stores attendance and internal marks per subject per semester.

const mongoose = require("mongoose");

const subjectRecordSchema = new mongoose.Schema(
  {
    subjectCode: { type: String, trim: true },
    subjectName: { type: String, trim: true },
    attendancePercentage: { type: Number, min: 0, max: 100 },
    internalMark1: { type: Number, min: 0 },
    internalMark2: { type: Number, min: 0 },
    internalAverage: { type: Number, min: 0 },
  },
  { _id: false }
);

const academicRecordSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: [true, "Student reference is required"],
    },
    studentId: {
      type: String,
      required: true,
    },
    semester: {
      type: Number,
      required: [true, "Semester is required"],
      min: 1,
      max: 8,
    },
    academicYear: {
      type: String,   // e.g. "2024-25"
      trim: true,
    },
    subjects: [subjectRecordSchema],

    // Aggregated values (computed and stored for fast reporting)
    overallAttendance: { type: Number, min: 0, max: 100, default: null },
    overallInternalAverage: { type: Number, min: 0, max: 100, default: null },

    // Data source: "manual" (entered by faculty) or "imported" (CSV/system)
    dataSource: {
      type: String,
      enum: ["manual", "imported"],
      default: "manual",
    },
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      refPath: "uploadedByRole",
      default: null,
    },
    uploadedByRole: {
      type: String,
      enum: ["Admin", "Faculty"],
      default: null,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

academicRecordSchema.index({ student: 1, semester: 1 }, { unique: true });

const AcademicRecord = mongoose.model("AcademicRecord", academicRecordSchema);

module.exports = AcademicRecord;
