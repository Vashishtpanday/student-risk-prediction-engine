// src/routes/auth.routes.js

const express = require("express");
const router = express.Router();
const { register, login, logout, getMe } = require("../controllers/auth.controller");
const { protect } = require("../middleware/auth.middleware");
const { validate } = require("../middleware/validate.middleware");
const { registerValidation, loginValidation } = require("../middleware/validators/auth.validators");

// POST /api/auth/register
router.post("/register", registerValidation, validate, register);

// POST /api/auth/login
router.post("/login", loginValidation, validate, login);

// POST /api/auth/logout  (requires valid token)
router.post("/logout", protect, logout);

// GET /api/auth/me  (requires valid token)
router.get("/me", protect, getMe);

module.exports = router;
