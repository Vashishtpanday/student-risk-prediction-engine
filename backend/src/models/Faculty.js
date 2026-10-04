// src/models/Faculty.js
// Mongoose schema for a Faculty document.

const mongoose = require("mongoose");

const facultySchema = new mongoose.Schema(
  {
    facultyId: {
      type: String,
      required: [true, "Faculty ID is required"],
      unique: true,
      trim: true,
      uppercase: true,
    },
    name: {
      type: String,
      required: [true, "Faculty name is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
    },
    passwordHash: {
      type: String,
      required: true,
      select: false,  // never returned in queries by default
    },
    department: {
      type: String,
      required: [true, "Department is required"],
      trim: true,
    },
    designation: {
      type: String,
      trim: true,
    },

    // Students assigned to this faculty for monitoring
    assignedStudents: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Student",
      },
    ],

    role: {
      type: String,
      enum: ["faculty"],
      default: "faculty",
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

facultySchema.index({ department: 1 });

const Faculty = mongoose.model("Faculty", facultySchema);

module.exports = Faculty;
