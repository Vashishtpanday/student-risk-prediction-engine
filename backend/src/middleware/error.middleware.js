// src/middleware/error.middleware.js
// Centralized Express error handling middleware.
// Must be registered LAST in app.js (after all routes).

const logger = require("../utils/logger");
const { NODE_ENV } = require("../config/env");

// 404 handler — for unmatched routes
const notFound = (req, res, next) => {
  const err = new Error(`Route not found: ${req.method} ${req.originalUrl}`);
  err.statusCode = 404;
  next(err);
};

// Global error handler
const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal Server Error";

  // Log stack trace in non-production environments
  if (NODE_ENV !== "production") {
    logger.error(`[${statusCode}] ${message}`);
    if (err.stack) logger.debug(err.stack);
  } else {
    // In production only log 5xx errors
    if (statusCode >= 500) {
      logger.error(`[${statusCode}] ${message}`);
    }
  }

  // Handle specific Mongoose errors
  let responseMessage = message;
  let responseErrors = null;

  if (err.name === "CastError") {
    responseMessage = `Invalid ${err.path}: ${err.value}`;
    err.statusCode = 400;
  }

  if (err.code === 11000) {
    // Duplicate key error
    const field = Object.keys(err.keyValue || {})[0] || "field";
    responseMessage = `Duplicate value for field: ${field}`;
    err.statusCode = 409;
  }

  if (err.name === "ValidationError") {
    responseMessage = "Validation error";
    responseErrors = Object.values(err.errors).map((e) => ({
      field: e.path,
      message: e.message,
    }));
    err.statusCode = 422;
  }

  const body = {
    success: false,
    message: responseMessage,
  };

  if (responseErrors) body.errors = responseErrors;

  // Include stack trace only in development
  if (NODE_ENV === "development" && err.stack) {
    body.stack = err.stack;
  }

  res.status(err.statusCode || statusCode).json(body);
};

module.exports = { notFound, errorHandler };
