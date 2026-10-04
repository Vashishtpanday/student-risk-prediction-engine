// src/routes/faculty.routes.js

const express = require("express");
const router = express.Router();
const {
  getAllFaculty,
  createFaculty,
  getFacultyById,
  updateFaculty,
  deleteFaculty,
  getFacultyStudents,
} = require("../controllers/faculty.controller");
const { protect } = require("../middleware/auth.middleware");
const { authorize } = require("../middleware/role.middleware");
const { validate } = require("../middleware/validate.middleware");
const {
  createFacultyValidation,
  updateFacultyValidation,
} = require("../middleware/validators/faculty.validators");

router.use(protect);

// GET /api/faculty — admin only
router.get("/", authorize("admin", "superadmin"), getAllFaculty);

// POST /api/faculty — admin only
router.post("/", authorize("admin", "superadmin"), createFacultyValidation, validate, createFaculty);

// GET /api/faculty/:id — admin or the faculty member themselves
router.get("/:id", authorize("admin", "superadmin", "faculty"), getFacultyById);

// PUT /api/faculty/:id — admin only (faculty can change own password via profile — future)
router.put("/:id", authorize("admin", "superadmin"), updateFacultyValidation, validate, updateFaculty);

// DELETE /api/faculty/:id — admin only
router.delete("/:id", authorize("admin", "superadmin"), deleteFaculty);

// GET /api/faculty/:id/students — admin or the faculty member themselves
router.get("/:id/students", authorize("admin", "superadmin", "faculty"), getFacultyStudents);

module.exports = router;
