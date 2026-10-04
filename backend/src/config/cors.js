// src/config/cors.js
// Centralized CORS configuration.
// Reads allowed origins from env.js so no hardcoded URLs here.

const cors = require("cors");
const { ALLOWED_ORIGINS } = require("./env");

const corsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (e.g. Postman, server-to-server)
    if (!origin) return callback(null, true);

    if (ALLOWED_ORIGINS.includes(origin)) {
      return callback(null, true);
    }

    callback(new Error(`CORS policy: origin ${origin} is not allowed.`));
  },
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  exposedHeaders: ["X-Total-Count"],
  credentials: true,
  optionsSuccessStatus: 204,
};

module.exports = cors(corsOptions);
