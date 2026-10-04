// src/models/Student.js
// Mongoose schema for a Student document.

const mongoose = require("mongoose");

const studentSchema = new mongoose.Schema(
  {
    // -- Identification --
    studentId: {
      type: String,
      required: [true, "Student ID is required"],
      unique: true,
      trim: true,
      uppercase: true,
    },
    name: {
      type: String,
      required: [true, "Student name is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
    },

    // -- Academic Info --
    department: {
      type: String,
      required: [true, "Department is required"],
      trim: true,
    },
    semester: {
      type: Number,
      required: [true, "Semester is required"],
      min: 1,
      max: 8,
    },
    section: {
      type: String,
      trim: true,
    },
    batch: {
      type: String,   // e.g. "2022-2026"
      trim: true,
    },

    // -- CP/NCP Status --
    // CP = Campus Placement; NCP = Non-Campus Placement
    cpNcpStatus: {
      type: String,
      enum: ["CP", "NCP", "UNKNOWN"],
      default: "UNKNOWN",
    },

    // -- Attendance (percentage) --
    attendancePercentage: {
      type: Number,
      min: 0,
      max: 100,
      default: null,
    },

    // -- Internal Marks (aggregate average) --
    internalMarksAverage: {
      type: Number,
      min: 0,
      max: 100,
      default: null,
    },

    // -- Previous Backlogs -- (Required by ML model, range 0-5)
    previousBacklogs: {
      type: Number,
      min: 0,
      max: 5,
      default: 0,
    },

    // -- Risk Classification (latest) --
    // Updated by prediction service after every prediction run
    latestRiskLevel: {
      type: String,
      enum: ["LOW", "MODERATE", "HIGH", "UNKNOWN"],
      default: "UNKNOWN",
    },

    // -- Reference to assigned faculty --
    assignedFaculty: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Faculty",
      default: null,
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,   // adds createdAt and updatedAt
    versionKey: false,
  }
);

// Index for common queries
studentSchema.index({ department: 1, semester: 1 });
studentSchema.index({ latestRiskLevel: 1 });

const Student = mongoose.model("Student", studentSchema);

module.exports = Student;
