// tests/dashboard.test.js
// Integration tests for GET /api/dashboard/stats and /api/dashboard/risky

const request = require("supertest");
const app = require("../src/app");
const { connect, closeAndClean, clearCollections } = require("./helpers/db");
const Student = require("../src/models/Student");

let adminToken;

const seedStudents = async () => {
  await Student.create([
    { studentId: "S001", name: "A", email: "a@t.com", department: "CSE", semester: 3, latestRiskLevel: "HIGH",     isActive: true,  attendancePercentage: 55, internalMarksAverage: 40 },
    { studentId: "S002", name: "B", email: "b@t.com", department: "CSE", semester: 3, latestRiskLevel: "MODERATE", isActive: true,  attendancePercentage: 70, internalMarksAverage: 60 },
    { studentId: "S003", name: "C", email: "c@t.com", department: "ECE", semester: 5, latestRiskLevel: "LOW",      isActive: true,  attendancePercentage: 90, internalMarksAverage: 85 },
    { studentId: "S004", name: "D", email: "d@t.com", department: "ECE", semester: 5, latestRiskLevel: "HIGH",     isActive: true,  attendancePercentage: 50, internalMarksAverage: 35 },
    { studentId: "S005", name: "E", email: "e@t.com", department: "CSE", semester: 7, latestRiskLevel: "HIGH",     isActive: false, attendancePercentage: 45, internalMarksAverage: 30 },
  ]);
};

beforeAll(async () => { await connect(); });
afterEach(async () => { await clearCollections(); });
afterAll(async () => { await closeAndClean(); });

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

// ─── DASHBOARD STATS ──────────────────────────────────────────────────────────

describe("GET /api/dashboard/stats", () => {
  it("should return correct counts with empty DB", async () => {
    const res = await request(app)
      .get("/api/dashboard/stats")
      .set("Authorization", `Bearer ${adminToken}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.data.students.total).toBe(0);
    expect(res.body.data.students.active).toBe(0);
    expect(res.body.data.riskDistribution.HIGH).toBe(0);
  });

  it("should return correct counts after seeding", async () => {
    await seedStudents();

    const res = await request(app)
      .get("/api/dashboard/stats")
      .set("Authorization", `Bearer ${adminToken}`);

    expect(res.statusCode).toBe(200);
    const data = res.body.data;

    expect(data.students.total).toBe(5);
    expect(data.students.active).toBe(4); // S005 is inactive
    expect(data.students.inactive).toBe(1);

    // Risk counts are for active students only
    expect(data.riskDistribution.HIGH).toBe(2);     // S001, S004
    expect(data.riskDistribution.MODERATE).toBe(1); // S002
    expect(data.riskDistribution.LOW).toBe(1);      // S003

    // Departments
    expect(data.departments.length).toBeGreaterThan(0);
  });

  it("should require authentication", async () => {
    const res = await request(app).get("/api/dashboard/stats");
    expect(res.statusCode).toBe(401);
  });
});

// ─── RISKY STUDENTS ───────────────────────────────────────────────────────────

describe("GET /api/dashboard/risky", () => {
  beforeEach(async () => { await seedStudents(); });

  it("should return HIGH risk active students by default", async () => {
    const res = await request(app)
      .get("/api/dashboard/risky?riskLevel=HIGH")
      .set("Authorization", `Bearer ${adminToken}`);
    expect(res.statusCode).toBe(200);
    // Only active HIGH students: S001, S004 (S005 is inactive)
    expect(res.body.data.length).toBe(2);
    expect(res.body.data.every((s) => s.latestRiskLevel === "HIGH")).toBe(true);
    expect(res.body.meta.total).toBe(2);
  });

  it("should filter risky students by department", async () => {
    const res = await request(app)
      .get("/api/dashboard/risky?riskLevel=HIGH&department=ECE")
      .set("Authorization", `Bearer ${adminToken}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.data.length).toBe(1);
    expect(res.body.data[0].studentId).toBe("S004");
  });

  it("should filter risky students by semester", async () => {
    const res = await request(app)
      .get("/api/dashboard/risky?riskLevel=HIGH&semester=3")
      .set("Authorization", `Bearer ${adminToken}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.data.length).toBe(1);
    expect(res.body.data[0].studentId).toBe("S001");
  });

  it("should return MODERATE risk students", async () => {
    const res = await request(app)
      .get("/api/dashboard/risky?riskLevel=MODERATE")
      .set("Authorization", `Bearer ${adminToken}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.data.length).toBe(1);
    expect(res.body.data[0].studentId).toBe("S002");
  });

  it("should reject invalid riskLevel", async () => {
    const res = await request(app)
      .get("/api/dashboard/risky?riskLevel=CRITICAL")
      .set("Authorization", `Bearer ${adminToken}`);
    expect(res.statusCode).toBe(400);
  });

  it("should paginate risky students", async () => {
    // Add a 3rd HIGH risk active student
    await Student.create({
      studentId: "S006", name: "F", email: "f@t.com", department: "MECH",
      semester: 2, latestRiskLevel: "HIGH", isActive: true,
      attendancePercentage: 40, internalMarksAverage: 30,
    });

    const res = await request(app)
      .get("/api/dashboard/risky?riskLevel=HIGH&page=1&limit=2")
      .set("Authorization", `Bearer ${adminToken}`);
    expect(res.body.data.length).toBe(2);
    expect(res.body.meta.total).toBe(3);
    expect(res.body.meta.totalPages).toBe(2);
  });
});
