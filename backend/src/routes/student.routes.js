// src/routes/student.routes.js

const express = require("express");
const router = express.Router();
const {
  getAllStudents, createStudent, getStudentById,
  updateStudent, deleteStudent, getStudentHistory,
} = require("../controllers/student.controller");
const { protect } = require("../middleware/auth.middleware");
const { authorize } = require("../middleware/role.middleware");
const { validate } = require("../middleware/validate.middleware");
const {
  createStudentValidation,
  updateStudentValidation,
  listStudentsValidation,
} = require("../middleware/validators/student.validators");

// All student routes require authentication
router.use(protect);

// GET /api/students  — any authenticated user
router.get("/", listStudentsValidation, validate, getAllStudents);

// POST /api/students  — admin only
router.post("/", authorize("admin", "superadmin"), createStudentValidation, validate, createStudent);

// GET /api/students/:id  — any authenticated user
router.get("/:id", getStudentById);

// PUT /api/students/:id  — admin or faculty
router.put("/:id", authorize("admin", "superadmin", "faculty"), updateStudentValidation, validate, updateStudent);

// DELETE /api/students/:id  — admin only
router.delete("/:id", authorize("admin", "superadmin"), deleteStudent);

// GET /api/students/:id/history  — any authenticated user
router.get("/:id/history", getStudentHistory);

module.exports = router;
