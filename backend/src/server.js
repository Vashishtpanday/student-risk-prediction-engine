// src/server.js
// Application entry point.
// Connects to MongoDB, then starts the HTTP server.

// Load env FIRST before anything else
require("./config/env");

const app = require("./app");
const connectDB = require("./config/db");
const logger = require("./utils/logger");
const { PORT } = require("./config/env");

const start = async () => {
  await connectDB();

  const server = app.listen(PORT, () => {
    logger.info(`Server running on http://localhost:${PORT}`);
    logger.info(`Health check: http://localhost:${PORT}/api/health`);
    logger.info(`Environment: ${process.env.NODE_ENV}`);
  });

  // Handle unhandled promise rejections
  process.on("unhandledRejection", (reason, promise) => {
    logger.error(`Unhandled Rejection at: ${promise}, reason: ${reason}`);
    server.close(() => process.exit(1));
  });
};

start();
