// tests/student.test.js
// Integration tests for /api/students — CRUD, validation, pagination, soft delete.

const request = require("supertest");
const app = require("../src/app");
const { connect, closeAndClean, clearCollections } = require("./helpers/db");

let adminToken;
let createdStudentId;

const TEST_STUDENT = {
  studentId: "STU001",
  name: "Alice Kumar",
  email: "alice@test.com",
  department: "CSE",
  semester: 3,
  cpNcpStatus: "CP",
  attendancePercentage: 78.5,
  internalMarksAverage: 70.0,
  previousBacklogs: 0,
};

beforeAll(async () => { await connect(); });
afterEach(async () => { await clearCollections(); });
afterAll(async () => { await closeAndClean(); });

// Register a fresh admin before every test (afterEach wipes all collections)
beforeEach(async () => {
  const res = await request(app).post("/api/auth/register").send({
    role: "admin",
    name: "Test Admin",
    email: "admin@test.com",
    password: "testpass123",
    adminId: "ADM001",
  });
  adminToken = res.body.data.token;
});

// ─── CREATE STUDENT ───────────────────────────────────────────────────────────

describe("POST /api/students", () => {
  it("should create a student with all valid fields", async () => {
    const res = await request(app)
      .post("/api/students")
      .set("Authorization", `Bearer ${adminToken}`)
      .send(TEST_STUDENT);

    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.studentId).toBe("STU001");
    expect(res.body.data.department).toBe("CSE");
    expect(res.body.data.previousBacklogs).toBe(0);
    expect(res.body.data.latestRiskLevel).toBe("UNKNOWN");
    createdStudentId = res.body.data._id;
  });

  it("should reject duplicate studentId", async () => {
    await request(app)
      .post("/api/students")
      .set("Authorization", `Bearer ${adminToken}`)
      .send(TEST_STUDENT);

    const res = await request(app)
      .post("/api/students")
      .set("Authorization", `Bearer ${adminToken}`)
      .send(TEST_STUDENT);

    expect(res.statusCode).toBe(409);
  });

  it("should reject missing required fields (studentId)", async () => {
    const res = await request(app)
      .post("/api/students")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ name: "No ID", email: "noid@test.com", department: "CSE", semester: 2 });
    expect(res.statusCode).toBe(422);
  });

  it("should reject invalid semester (out of range)", async () => {
    const res = await request(app)
      .post("/api/students")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ ...TEST_STUDENT, studentId: "STU999", semester: 10 });
    expect(res.statusCode).toBe(422);
  });

  it("should reject previousBacklogs > 5", async () => {
    const res = await request(app)
      .post("/api/students")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ ...TEST_STUDENT, studentId: "STU998", previousBacklogs: 10 });
    expect(res.statusCode).toBe(422);
  });

  it("should reject unauthenticated request", async () => {
    const res = await request(app).post("/api/students").send(TEST_STUDENT);
    expect(res.statusCode).toBe(401);
  });
});

// ─── GET STUDENTS (LIST) ──────────────────────────────────────────────────────

describe("GET /api/students", () => {
  beforeEach(async () => {
    // Seed 3 students
    await request(app).post("/api/students").set("Authorization", `Bearer ${adminToken}`).send(TEST_STUDENT);
    await request(app).post("/api/students").set("Authorization", `Bearer ${adminToken}`).send({
      ...TEST_STUDENT, studentId: "STU002", name: "Bob Singh", email: "bob@test.com", department: "ECE", semester: 5
    });
    await request(app).post("/api/students").set("Authorization", `Bearer ${adminToken}`).send({
      ...TEST_STUDENT, studentId: "STU003", name: "Carol Raj", email: "carol@test.com", department: "CSE", semester: 5
    });
  });

  it("should list all students with pagination meta", async () => {
    const res = await request(app)
      .get("/api/students")
      .set("Authorization", `Bearer ${adminToken}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.data.length).toBe(3);
    expect(res.body.meta.total).toBe(3);
  });

  it("should filter by department", async () => {
    const res = await request(app)
      .get("/api/students?department=CSE")
      .set("Authorization", `Bearer ${adminToken}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.data.every((s) => s.department === "CSE")).toBe(true);
    expect(res.body.data.length).toBe(2);
  });

  it("should filter by semester", async () => {
    const res = await request(app)
      .get("/api/students?semester=5")
      .set("Authorization", `Bearer ${adminToken}`);
    expect(res.body.data.length).toBe(2);
    expect(res.body.data.every((s) => s.semester === 5)).toBe(true);
  });

  it("should search by name", async () => {
    const res = await request(app)
      .get("/api/students?search=Bob")
      .set("Authorization", `Bearer ${adminToken}`);
    expect(res.body.data.length).toBe(1);
    expect(res.body.data[0].name).toBe("Bob Singh");
  });

  it("should paginate correctly", async () => {
    const res = await request(app)
      .get("/api/students?page=1&limit=2")
      .set("Authorization", `Bearer ${adminToken}`);
    expect(res.body.data.length).toBe(2);
    expect(res.body.meta.totalPages).toBe(2);
  });
});

// ─── GET STUDENT BY ID ────────────────────────────────────────────────────────

describe("GET /api/students/:id", () => {
  let studentId;

  beforeEach(async () => {
    const res = await request(app)
      .post("/api/students")
      .set("Authorization", `Bearer ${adminToken}`)
      .send(TEST_STUDENT);
    studentId = res.body.data._id;
  });

  it("should get student by MongoDB _id", async () => {
    const res = await request(app)
      .get(`/api/students/${studentId}`)
      .set("Authorization", `Bearer ${adminToken}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.data.studentId).toBe("STU001");
  });

  it("should get student by studentId string", async () => {
    const res = await request(app)
      .get("/api/students/STU001")
      .set("Authorization", `Bearer ${adminToken}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.data.name).toBe("Alice Kumar");
  });

  it("should return 404 for non-existent student", async () => {
    const res = await request(app)
      .get("/api/students/NONEXISTENT")
      .set("Authorization", `Bearer ${adminToken}`);
    expect(res.statusCode).toBe(404);
  });
});

// ─── UPDATE STUDENT ───────────────────────────────────────────────────────────

describe("PUT /api/students/:id", () => {
  let studentId;

  beforeEach(async () => {
    const res = await request(app)
      .post("/api/students")
      .set("Authorization", `Bearer ${adminToken}`)
      .send(TEST_STUDENT);
    studentId = res.body.data._id;
  });

  it("should update allowed fields", async () => {
    const res = await request(app)
      .put(`/api/students/${studentId}`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ attendancePercentage: 90.0, previousBacklogs: 1 });
    expect(res.statusCode).toBe(200);
    expect(res.body.data.attendancePercentage).toBe(90.0);
    expect(res.body.data.previousBacklogs).toBe(1);
  });

  it("should reject invalid attendancePercentage > 100", async () => {
    const res = await request(app)
      .put(`/api/students/${studentId}`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ attendancePercentage: 110 });
    expect(res.statusCode).toBe(422);
  });

  it("should return 404 for non-existent student", async () => {
    const res = await request(app)
      .put("/api/students/GHOST999")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ attendancePercentage: 80 });
    expect(res.statusCode).toBe(404);
  });
});

// ─── DELETE STUDENT ───────────────────────────────────────────────────────────

describe("DELETE /api/students/:id", () => {
  let studentId;

  beforeEach(async () => {
    const res = await request(app)
      .post("/api/students")
      .set("Authorization", `Bearer ${adminToken}`)
      .send(TEST_STUDENT);
    studentId = res.body.data._id;
  });

  it("should soft-delete a student (isActive = false)", async () => {
    const res = await request(app)
      .delete(`/api/students/${studentId}`)
      .set("Authorization", `Bearer ${adminToken}`);
    expect(res.statusCode).toBe(200);

    // Should still exist but inactive
    const check = await request(app)
      .get(`/api/students/${studentId}`)
      .set("Authorization", `Bearer ${adminToken}`);
    expect(check.body.data.isActive).toBe(false);
  });

  it("should permanently delete with ?permanent=true", async () => {
    await request(app)
      .delete(`/api/students/${studentId}?permanent=true`)
      .set("Authorization", `Bearer ${adminToken}`);

    const check = await request(app)
      .get(`/api/students/${studentId}`)
      .set("Authorization", `Bearer ${adminToken}`);
    expect(check.statusCode).toBe(404);
  });

  it("should reject delete by non-admin (faculty)", async () => {
    const facRes = await request(app).post("/api/auth/register").send({
      role: "faculty",
      name: "Faculty User",
      email: "fac@test.com",
      password: "testpass123",
      facultyId: "FAC001",
      department: "CSE",
    });
    const facToken = facRes.body.data.token;

    const res = await request(app)
      .delete(`/api/students/${studentId}`)
      .set("Authorization", `Bearer ${facToken}`);
    expect(res.statusCode).toBe(403);
  });
});
