// src/routes/index.js
// Central route aggregator — mounts all feature routers.

const express = require("express");
const router = express.Router();

const { checkMLHealth } = require("../services/ml.service");
const { sendSuccess } = require("../utils/response.utils");

// -- Health check (public, no auth required) --
router.get("/health", async (req, res) => {
  const mlOnline = await checkMLHealth();
  return sendSuccess(res, 200, "Backend is healthy.", {
    service: "student-risk-prediction-backend",
    status: "OK",
    timestamp: new Date().toISOString(),
    uptime: Math.floor(process.uptime()),
    ml_service: mlOnline ? "ONLINE" : "OFFLINE",
  });
});

// -- Feature routers --
router.use("/auth",       require("./auth.routes"));
router.use("/students",   require("./student.routes"));
router.use("/faculty",    require("./faculty.routes"));
router.use("/predict",    require("./prediction.routes"));
router.use("/reports",    require("./report.routes"));
router.use("/dashboard",  require("./dashboard.routes"));

module.exports = router;
