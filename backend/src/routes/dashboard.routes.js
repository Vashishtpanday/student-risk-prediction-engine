// src/routes/dashboard.routes.js

const express = require("express");
const router = express.Router();
const { getDashboardStats, getRiskyStudents } = require("../controllers/dashboard.controller");
const { protect } = require("../middleware/auth.middleware");

router.use(protect);

// GET /api/dashboard/stats
router.get("/stats", getDashboardStats);

// GET /api/dashboard/risky?riskLevel=HIGH&department=CSE&semester=3&page=1&limit=20
router.get("/risky", getRiskyStudents);

module.exports = router;
