// tests/helpers/db.js
// Test database helper — connects to a separate test database.

const mongoose = require("mongoose");

const TEST_DB = process.env.MONGO_URI_TEST ||
  "mongodb://localhost:27017/student_risk_test_db";

const connect = async () => {
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(TEST_DB);
  }
};

const closeAndClean = async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
};

const clearCollections = async () => {
  const collections = mongoose.connection.collections;
  await Promise.all(
    Object.values(collections).map((col) => col.deleteMany({}))
  );
};

module.exports = { connect, closeAndClean, clearCollections };
