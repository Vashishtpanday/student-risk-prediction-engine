// src/controllers/student.controller.js
const Student = require("../models/Student");
const Prediction = require("../models/Prediction");
const { sendSuccess, sendError } = require("../utils/response.utils");
const logger = require("../utils/logger");
const mongoose = require("mongoose");

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
      limit = 5000, // <--- Defaults to 5000 when no limit query param is sent
      sortBy = "createdAt",
      sortOrder = "desc",
    } = req.query;

    const filter = {};
    if (department && department !== "All") filter.department = new RegExp(department, "i");
    if (semester && semester !== "All") filter.semester = parseInt(semester, 10);
    if (riskLevel && riskLevel !== "All") {
      const cleanRisk = riskLevel.replace(/ risk/i, "");
      filter.$or = [
        { latestRiskLevel: new RegExp(cleanRisk, "i") },
        { riskCategory: new RegExp(cleanRisk, "i") },
        { risk_category: new RegExp(cleanRisk, "i") },
      ];
    }
    if (isActive !== undefined) filter.isActive = isActive === "true";
    if (search) {
      filter.$or = [
        { name: new RegExp(search, "i") },
        { studentId: new RegExp(search, "i") },
        { student_id: new RegExp(search, "i") },
        { email: new RegExp(search, "i") },
      ];
    }

    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.max(1, parseInt(limit, 10));
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

const createStudent = async (req, res, next) => {
  try {
    const {
      studentId, student_id, name, email, department, semester,
      section, batch, cpNcpStatus, cp_ncp, attendancePercentage, attendance_pct,
      internalMarksAverage, internal_marks, previousBacklogs, previous_backlogs, assignedFaculty,
    } = req.body;

    const finalStudentId = (studentId || student_id || "").toUpperCase();
    const finalEmail = (email || "").toLowerCase();

    const existing = await Student.findOne({
      $or: [{ studentId: finalStudentId }, { student_id: finalStudentId }, { email: finalEmail }],
    });
    if (existing) {
      const field = (existing.studentId === finalStudentId || existing.student_id === finalStudentId) ? "Student ID" : "Email";
      return sendError(res, 409, `${field} already exists.`);
    }

    const att = attendancePercentage ?? attendance_pct ?? null;
    const marks = internalMarksAverage ?? internal_marks ?? null;
    const backlogs = previousBacklogs ?? previous_backlogs ?? 0;
    const status = cpNcpStatus || cp_ncp || "UNKNOWN";

    const student = await Student.create({
      studentId: finalStudentId,
      student_id: finalStudentId,
      name,
      email: finalEmail,
      department,
      semester,
      section,
      batch,
      cpNcpStatus: status,
      cp_ncp: status,
      attendancePercentage: att,
      attendance_pct: att,
      internalMarksAverage: marks,
      internal_marks: marks,
      previousBacklogs: backlogs,
      previous_backlogs: backlogs,
      assignedFaculty: assignedFaculty || null,
    });

    if (logger && logger.info) {
      logger.info(`Student created: ${student.studentId} by user ${req.user?.id}`);
    }
    return sendSuccess(res, 201, "Student created successfully.", student);
  } catch (err) {
    next(err);
  }
};

const getStudentById = async (req, res, next) => {
  try {
    const { id } = req.params;

    let student;
    if (isValidObjectId(id)) {
      student = await Student.findById(id).populate("assignedFaculty", "name email facultyId department");
    }
    
    if (!student) {
      student = await Student.findOne({
        $or: [{ studentId: id.toUpperCase() }, { student_id: id.toUpperCase() }, { email: id.toLowerCase() }],
      }).populate("assignedFaculty", "name email facultyId department");
    }

    if (!student) {
      return sendError(res, 404, "Student not found.");
    }

    return sendSuccess(res, 200, "Student fetched successfully.", student);
  } catch (err) {
    next(err);
  }
};

const updateStudent = async (req, res, next) => {
  try {
    const { id } = req.params;

    delete req.body.studentId;
    delete req.body.student_id;

    let student;
    if (isValidObjectId(id)) {
      student = await Student.findById(id);
    }
    if (!student) {
      student = await Student.findOne({
        $or: [{ studentId: id.toUpperCase() }, { student_id: id.toUpperCase() }],
      });
    }

    if (!student) {
      return sendError(res, 404, "Student not found.");
    }

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
      "cpNcpStatus", "cp_ncp", "attendancePercentage", "attendance_pct",
      "internalMarksAverage", "internal_marks", "previousBacklogs", "previous_backlogs",
      "assignedFaculty", "isActive", "latestRiskLevel", "risk_category"
    ];

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        student[field] = req.body[field];
      }
    });

    await student.save();

    if (logger && logger.info) {
      logger.info(`Student updated: ${student.studentId} by user ${req.user?.id}`);
    }
    return sendSuccess(res, 200, "Student updated successfully.", student);
  } catch (err) {
    next(err);
  }
};

const deleteStudent = async (req, res, next) => {
  try {
    const { id } = req.params;
    const permanent = req.query.permanent === "true";

    let student;
    if (isValidObjectId(id)) {
      student = await Student.findById(id);
    }
    if (!student) {
      student = await Student.findOne({
        $or: [{ studentId: id.toUpperCase() }, { student_id: id.toUpperCase() }],
      });
    }

    if (!student) {
      return sendError(res, 404, "Student not found.");
    }

    if (permanent) {
      if (!["admin", "superadmin"].includes(req.user?.role)) {
        return sendError(res, 403, "Only admins can permanently delete students.");
      }
      await Student.findByIdAndDelete(student._id);
      if (logger && logger.warn) {
        logger.warn(`Student permanently deleted: ${student.studentId} by admin ${req.user?.id}`);
      }
      return sendSuccess(res, 200, "Student permanently deleted.");
    }

    student.isActive = false;
    await student.save();
    if (logger && logger.info) {
      logger.info(`Student deactivated: ${student.studentId} by user ${req.user?.id}`);
    }
    return sendSuccess(res, 200, "Student deactivated successfully.", { studentId: student.studentId, isActive: false });
  } catch (err) {
    next(err);
  }
};

const getStudentHistory = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { page = 1, limit = 50 } = req.query;

    let student;
    if (isValidObjectId(id)) {
      student = await Student.findById(id);
    }
    if (!student) {
      student = await Student.findOne({
        $or: [{ studentId: id.toUpperCase() }, { student_id: id.toUpperCase() }],
      });
    }

    if (!student) {
      return sendError(res, 404, "Student not found.");
    }

    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10)));
    const skip = (pageNum - 1) * limitNum;

    const [predictions, total] = await Promise.all([
      Prediction.find({ student: student._id })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .select("-rawMlResponse"),
      Prediction.countDocuments({ student: student._id }),
    ]);

    return sendSuccess(
      res,
      200,
      `Prediction history for student ${student.studentId || student.student_id}.`,
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