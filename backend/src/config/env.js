// src/config/env.js
// Loads and validates environment variables at startup.
// All other modules import from here — never read process.env directly.

require("dotenv").config();

const required = ["MONGO_URI", "JWT_SECRET"];

required.forEach((key) => {
  if (!process.env[key]) {
    console.error(`[env] FATAL: Missing required environment variable: ${key}`);
    process.exit(1);
  }
});

module.exports = {
  NODE_ENV: process.env.NODE_ENV || "development",
  PORT: parseInt(process.env.PORT, 10) || 5000,

  // MongoDB
  MONGO_URI: process.env.MONGO_URI,

  // JWT
  JWT_SECRET: process.env.JWT_SECRET,
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || "7d",

  // ML Service (Python Flask — port 5001)
  ML_SERVICE_URL: process.env.ML_SERVICE_URL || "http://localhost:5001",

  // AI Assistant API (port 5002)
  AI_SERVICE_URL: process.env.AI_SERVICE_URL || "http://localhost:5002",

  // CORS allowed origins
  ALLOWED_ORIGINS: process.env.ALLOWED_ORIGINS
    ? process.env.ALLOWED_ORIGINS.split(",").map((o) => o.trim())
    : ["http://localhost:5173", "http://localhost:3000"],
};
