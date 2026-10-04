// src/app.js
// Express application factory.
// Keeps app and server separate for easier testing.

const express = require("express");
const corsMiddleware = require("./config/cors");
const { notFound, errorHandler } = require("./middleware/error.middleware");
const logger = require("./utils/logger");

const app = express();

// ── Global Middleware ──────────────────────────────────────────
app.use(corsMiddleware);
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Simple request logger (development)
app.use((req, res, next) => {
  logger.debug(`${req.method} ${req.originalUrl}`);
  next();
});

// ── API Routes ────────────────────────────────────────────────
app.use("/api", require("./routes/index"));

// ── Error Handling (MUST be last) ─────────────────────────────
app.use(notFound);
app.use(errorHandler);

module.exports = app;
