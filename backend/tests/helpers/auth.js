// tests/helpers/auth.js
// Utility to register and login a test admin, returning a JWT token.

const request = require("supertest");
const app = require("../../src/app");

const TEST_ADMIN = {
  role: "admin",
  name: "Test Admin",
  email: "testadmin@jest.com",
  password: "testpass123",
  adminId: "TESTADM01",
};

const TEST_FACULTY = {
  role: "faculty",
  name: "Test Faculty",
  email: "testfaculty@jest.com",
  password: "testpass123",
  facultyId: "TESTFAC01",
  department: "CSE",
};

/**
 * Register admin and return JWT token.
 */
const getAdminToken = async () => {
  const res = await request(app)
    .post("/api/auth/register")
    .send(TEST_ADMIN);
  return res.body.data.token;
};

/**
 * Register faculty and return JWT token.
 */
const getFacultyToken = async () => {
  const res = await request(app)
    .post("/api/auth/register")
    .send(TEST_FACULTY);
  return res.body.data.token;
};

module.exports = { getAdminToken, getFacultyToken, TEST_ADMIN, TEST_FACULTY };
