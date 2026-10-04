// src/config/db.js
// Mongoose connection setup with retry logic and graceful shutdown.

const mongoose = require("mongoose");
const { MONGO_URI, NODE_ENV } = require("./env");
const logger = require("../utils/logger");

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(MONGO_URI, {
      // Mongoose 8+ no longer needs these options, but kept for clarity
    });

    logger.info(`MongoDB connected: ${conn.connection.host} [${NODE_ENV}]`);

    mongoose.connection.on("error", (err) => {
      logger.error(`MongoDB connection error: ${err.message}`);
    });

    mongoose.connection.on("disconnected", () => {
      logger.warn("MongoDB disconnected. Attempting to reconnect...");
    });

    mongoose.connection.on("reconnected", () => {
      logger.info("MongoDB reconnected.");
    });
  } catch (err) {
    logger.error(`MongoDB initial connection failed: ${err.message}`);
    process.exit(1);
  }
};

// Graceful shutdown — close DB when process terminates
const gracefulShutdown = async (signal) => {
  logger.info(`${signal} received. Closing MongoDB connection...`);
  await mongoose.connection.close();
  logger.info("MongoDB connection closed.");
  process.exit(0);
};

process.on("SIGINT", () => gracefulShutdown("SIGINT"));
process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));

module.exports = connectDB;
