// src/controllers/faculty.controller.js
// Full Faculty CRUD controller.

const mongoose = require("mongoose");
const Faculty = require("../models/Faculty");
const Student = require("../models/Student");
const { hashPassword } = require("../utils/hash.utils");
const { sendSuccess, sendError } = require("../utils/response.utils");
const logger = require("../utils/logger");

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

const resolveFaculty = async (id) => {
  if (isValidObjectId(id)) return Faculty.findById(id);
  return Faculty.findOne({ facultyId: id.toUpperCase() });
};

// ─── GET /api/faculty ─────────────────────────────────────────────────────────
// Query: ?department=CSE&search=name&page=1&limit=20
const getAllFaculty = async (req, res, next) => {
  try {
    const { department, search, isActive, page = 1, limit = 20 } = req.query;

    const filter = {};
    if (department) filter.department = new RegExp(department, "i");
    if (isActive !== undefined) filter.isActive = isActive === "true";
    if (search) {
      filter.$or = [
        { name: new RegExp(search, "i") },
        { email: new RegExp(search, "i") },
        { facultyId: new RegExp(search, "i") },
      ];
    }

    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10)));
    const skip = (pageNum - 1) * limitNum;

    const [faculty, total] = await Promise.all([
      Faculty.find(filter)
        .sort({ department: 1, name: 1 })
        .skip(skip)
        .limit(limitNum)
        .select("-passwordHash"),
      Faculty.countDocuments(filter),
    ]);

    return sendSuccess(res, 200, "Faculty list fetched.", faculty, {
      total,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(total / limitNum),
    });
  } catch (err) {
    next(err);
  }
};

// ─── POST /api/faculty ────────────────────────────────────────────────────────
const createFaculty = async (req, res, next) => {
  try {
    const { facultyId, name, email, password, department, designation } = req.body;

    const existing = await Faculty.findOne({
      $or: [{ email: email.toLowerCase() }, { facultyId: facultyId.toUpperCase() }],
    });
    if (existing) {
      const field = existing.facultyId === facultyId.toUpperCase() ? "Faculty ID" : "Email";
      return sendError(res, 409, `${field} already exists.`);
    }

    const passwordHash = await hashPassword(password);

    const faculty = await Faculty.create({
      facultyId,
      name,
      email,
      passwordHash,
      department,
      designation: designation || undefined,
    });

    const result = faculty.toObject();
    delete result.passwordHash;

    logger.info(`Faculty created: ${faculty.facultyId} by admin ${req.user?.id}`);
    return sendSuccess(res, 201, "Faculty member created successfully.", result);
  } catch (err) {
    next(err);
  }
};

// ─── GET /api/faculty/:id ─────────────────────────────────────────────────────
const getFacultyById = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Faculty can only view their own profile; admin can view any
    if (req.user.role === "faculty" && req.user.id !== id &&
        !(await Faculty.findOne({ _id: req.user.id, facultyId: id.toUpperCase() }))) {
      // Allow if id matches their own _id or facultyId
      const self = await Faculty.findById(req.user.id);
      if (!self || (self._id.toString() !== id && self.facultyId !== id.toUpperCase())) {
        return sendError(res, 403, "Faculty members can only view their own profile.");
      }
    }

    const faculty = await resolveFaculty(id);
    if (!faculty) return sendError(res, 404, "Faculty member not found.");

    const result = faculty.toObject();
    delete result.passwordHash;

    return sendSuccess(res, 200, "Faculty member fetched.", result);
  } catch (err) {
    next(err);
  }
};

// ─── PUT /api/faculty/:id ─────────────────────────────────────────────────────
const updateFaculty = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Prevent changing facultyId directly
    delete req.body.facultyId;

    const faculty = await resolveFaculty(id);
    if (!faculty) return sendError(res, 404, "Faculty member not found.");

    // Email uniqueness check
    if (req.body.email && req.body.email.toLowerCase() !== faculty.email) {
      const taken = await Faculty.findOne({
        email: req.body.email.toLowerCase(),
        _id: { $ne: faculty._id },
      });
      if (taken) return sendError(res, 409, "Email is already in use by another faculty member.");
    }

    const allowedFields = ["name", "email", "department", "designation", "isActive"];
    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) faculty[field] = req.body[field];
    });

    // If password is being updated, hash it
    if (req.body.password) {
      faculty.passwordHash = await hashPassword(req.body.password);
    }

    await faculty.save();

    const result = faculty.toObject();
    delete result.passwordHash;

    logger.info(`Faculty updated: ${faculty.facultyId} by ${req.user.role} ${req.user.id}`);
    return sendSuccess(res, 200, "Faculty member updated successfully.", result);
  } catch (err) {
    next(err);
  }
};

// ─── DELETE /api/faculty/:id ──────────────────────────────────────────────────
const deleteFaculty = async (req, res, next) => {
  try {
    const { id } = req.params;
    const permanent = req.query.permanent === "true";

    const faculty = await resolveFaculty(id);
    if (!faculty) return sendError(res, 404, "Faculty member not found.");

    if (permanent) {
      await Faculty.findByIdAndDelete(faculty._id);
      logger.warn(`Faculty permanently deleted: ${faculty.facultyId} by admin ${req.user?.id}`);
      return sendSuccess(res, 200, "Faculty member permanently deleted.");
    }

    faculty.isActive = false;
    await faculty.save();
    logger.info(`Faculty deactivated: ${faculty.facultyId} by admin ${req.user?.id}`);
    return sendSuccess(res, 200, "Faculty member deactivated.", {
      facultyId: faculty.facultyId,
      isActive: false,
    });
  } catch (err) {
    next(err);
  }
};

// ─── GET /api/faculty/:id/students ───────────────────────────────────────────
// Returns all students assigned to a faculty member
const getFacultyStudents = async (req, res, next) => {
  try {
    const { id } = req.params;

    const faculty = await resolveFaculty(id);
    if (!faculty) return sendError(res, 404, "Faculty member not found.");

    const students = await Student.find({
      assignedFaculty: faculty._id,
      isActive: true,
    })
      .sort({ name: 1 })
      .select(
        "studentId name email department semester section cpNcpStatus attendancePercentage internalMarksAverage latestRiskLevel"
      );

    return sendSuccess(
      res,
      200,
      `Students assigned to ${faculty.name}.`,
      students,
      { count: students.length, faculty: { facultyId: faculty.facultyId, name: faculty.name } }
    );
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getAllFaculty,
  createFaculty,
  getFacultyById,
  updateFaculty,
  deleteFaculty,
  getFacultyStudents,
};
