// src/controllers/student.controller.js
// Full Student CRUD controller.

const Student = require("../models/Student");
const Prediction = require("../models/Prediction");
const { sendSuccess, sendError } = require("../utils/response.utils");
const logger = require("../utils/logger");
const mongoose = require("mongoose");

// ─── Helper ───────────────────────────────────────────────────────────────────

/**
 * Validate that a string is a valid MongoDB ObjectId.
 */
const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

// ─── GET /api/students ────────────────────────────────────────────────────────
const getAllStudents = async (req, res, next) => {
  try {
    const {
      department,
      semester,
      riskLevel,
      search,
      isActive,
      page = 1,
      limit = 20,
      sortBy = "createdAt",
      sortOrder = "desc",
    } = req.query;

    // Build filter
    const filter = {};
    if (department) filter.department = new RegExp(department, "i");
    if (semester) filter.semester = parseInt(semester, 10);
    if (riskLevel) filter.latestRiskLevel = riskLevel.toUpperCase();
    if (isActive !== undefined) filter.isActive = isActive === "true";
    if (search) {
      filter.$or = [
        { name: new RegExp(search, "i") },
        { studentId: new RegExp(search, "i") },
        { email: new RegExp(search, "i") },
      ];
    }

    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10)));
    const skip = (pageNum - 1) * limitNum;
    const sortDir = sortOrder === "asc" ? 1 : -1;

    const [students, total] = await Promise.all([
      Student.find(filter)
        .sort({ [sortBy]: sortDir })
        .skip(skip)
        .limit(limitNum)
        .populate("assignedFaculty", "name email facultyId department"),
      Student.countDocuments(filter),
    ]);

    return sendSuccess(res, 200, "Students fetched successfully.", students, {
      total,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(total / limitNum),
    });
  } catch (err) {
    next(err);
  }
};

// ─── POST /api/students ───────────────────────────────────────────────────────
const createStudent = async (req, res, next) => {
  try {
    const {
      studentId, name, email, department, semester,
      section, batch, cpNcpStatus, attendancePercentage,
      internalMarksAverage, previousBacklogs, assignedFaculty,
    } = req.body;

    // Check for duplicate studentId or email
    const existing = await Student.findOne({
      $or: [{ studentId: studentId.toUpperCase() }, { email: email.toLowerCase() }],
    });
    if (existing) {
      const field = existing.studentId === studentId.toUpperCase() ? "Student ID" : "Email";
      return sendError(res, 409, `${field} already exists.`);
    }

    const student = await Student.create({
      studentId,
      name,
      email,
      department,
      semester,
      section,
      batch,
      cpNcpStatus: cpNcpStatus || "UNKNOWN",
      attendancePercentage: attendancePercentage ?? null,
      internalMarksAverage: internalMarksAverage ?? null,
      previousBacklogs: previousBacklogs ?? 0,
      assignedFaculty: assignedFaculty || null,
    });

    logger.info(`Student created: ${student.studentId} by user ${req.user?.id}`);
    return sendSuccess(res, 201, "Student created successfully.", student);
  } catch (err) {
    next(err);
  }
};

// ─── GET /api/students/:id ────────────────────────────────────────────────────
const getStudentById = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Accept either MongoDB _id or studentId string
    let student;
    if (isValidObjectId(id)) {
      student = await Student.findById(id).populate("assignedFaculty", "name email facultyId department");
    } else {
      student = await Student.findOne({ studentId: id.toUpperCase() })
        .populate("assignedFaculty", "name email facultyId department");
    }

    if (!student) {
      return sendError(res, 404, "Student not found.");
    }

    return sendSuccess(res, 200, "Student fetched successfully.", student);
  } catch (err) {
    next(err);
  }
};

// ─── PUT /api/students/:id ────────────────────────────────────────────────────
const updateStudent = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Prevent changing studentId directly
    delete req.body.studentId;

    // Find by _id or studentId
    let student;
    if (isValidObjectId(id)) {
      student = await Student.findById(id);
    } else {
      student = await Student.findOne({ studentId: id.toUpperCase() });
    }

    if (!student) {
      return sendError(res, 404, "Student not found.");
    }

    // If email is changing, check it's not taken by another student
    if (req.body.email && req.body.email.toLowerCase() !== student.email) {
      const emailTaken = await Student.findOne({
        email: req.body.email.toLowerCase(),
        _id: { $ne: student._id },
      });
      if (emailTaken) {
        return sendError(res, 409, "Email is already in use by another student.");
      }
    }

    const allowedFields = [
      "name", "email", "department", "semester", "section", "batch",
      "cpNcpStatus", "attendancePercentage", "internalMarksAverage",
      "previousBacklogs", "assignedFaculty", "isActive",
    ];

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        student[field] = req.body[field];
      }
    });

    await student.save();

    logger.info(`Student updated: ${student.studentId} by user ${req.user?.id}`);
    return sendSuccess(res, 200, "Student updated successfully.", student);
  } catch (err) {
    next(err);
  }
};

// ─── DELETE /api/students/:id ─────────────────────────────────────────────────
const deleteStudent = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Soft delete by default (set isActive = false)
    // Permanently delete only if ?permanent=true AND role is admin/superadmin
    const permanent = req.query.permanent === "true";

    let student;
    if (isValidObjectId(id)) {
      student = await Student.findById(id);
    } else {
      student = await Student.findOne({ studentId: id.toUpperCase() });
    }

    if (!student) {
      return sendError(res, 404, "Student not found.");
    }

    if (permanent) {
      if (!["admin", "superadmin"].includes(req.user?.role)) {
        return sendError(res, 403, "Only admins can permanently delete students.");
      }
      await Student.findByIdAndDelete(student._id);
      logger.warn(`Student permanently deleted: ${student.studentId} by admin ${req.user?.id}`);
      return sendSuccess(res, 200, "Student permanently deleted.");
    }

    // Soft delete
    student.isActive = false;
    await student.save();
    logger.info(`Student deactivated: ${student.studentId} by user ${req.user?.id}`);
    return sendSuccess(res, 200, "Student deactivated successfully.", { studentId: student.studentId, isActive: false });
  } catch (err) {
    next(err);
  }
};

// ─── GET /api/students/:id/history ───────────────────────────────────────────
const getStudentHistory = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { page = 1, limit = 10 } = req.query;

    let student;
    if (isValidObjectId(id)) {
      student = await Student.findById(id);
    } else {
      student = await Student.findOne({ studentId: id.toUpperCase() });
    }

    if (!student) {
      return sendError(res, 404, "Student not found.");
    }

    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.min(50, Math.max(1, parseInt(limit, 10)));
    const skip = (pageNum - 1) * limitNum;

    const [predictions, total] = await Promise.all([
      Prediction.find({ student: student._id })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .select("-rawMlResponse"),   // omit raw ML dump from list view
      Prediction.countDocuments({ student: student._id }),
    ]);

    return sendSuccess(
      res,
      200,
      `Prediction history for student ${student.studentId}.`,
      { student: { id: student._id, studentId: student.studentId, name: student.name }, predictions },
      { total, page: pageNum, limit: limitNum, totalPages: Math.ceil(total / limitNum) }
    );
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getAllStudents,
  createStudent,
  getStudentById,
  updateStudent,
  deleteStudent,
  getStudentHistory,
};
