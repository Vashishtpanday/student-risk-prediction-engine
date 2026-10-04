// src/utils/logger.js
// Lightweight console-based logger.
// Replace with winston/pino if more advanced logging is needed later.

const { NODE_ENV } = require("../config/env");

const LEVELS = { error: 0, warn: 1, info: 2, debug: 3 };
const CURRENT_LEVEL = NODE_ENV === "production" ? "warn" : "debug";

const timestamp = () => new Date().toISOString();

const log = (level, ...args) => {
  if (LEVELS[level] <= LEVELS[CURRENT_LEVEL]) {
    const prefix = `[${timestamp()}] [${level.toUpperCase()}]`;
    if (level === "error") {
      console.error(prefix, ...args);
    } else if (level === "warn") {
      console.warn(prefix, ...args);
    } else {
      console.log(prefix, ...args);
    }
  }
};

module.exports = {
  error: (...args) => log("error", ...args),
  warn: (...args) => log("warn", ...args),
  info: (...args) => log("info", ...args),
  debug: (...args) => log("debug", ...args),
};
