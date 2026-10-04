// src/routes/report.routes.js

const express = require("express");
const router = express.Router();
const {
  getDepartmentReport,
  getSemesterReport,
  exportReport,
} = require("../controllers/report.controller");
const { protect } = require("../middleware/auth.middleware");

router.use(protect);

// GET /api/reports/department?semester=3
router.get("/department", getDepartmentReport);

// GET /api/reports/semester?department=CSE
router.get("/semester", getSemesterReport);

// GET /api/reports/export?format=csv&department=CSE&semester=3&riskLevel=HIGH
router.get("/export", exportReport);

module.exports = router;
