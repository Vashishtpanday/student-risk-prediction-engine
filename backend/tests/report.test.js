// tests/report.test.js
// Integration tests for /api/reports/department, /semester, /export

const request = require("supertest");
const app = require("../src/app");
const { connect, closeAndClean, clearCollections } = require("./helpers/db");
const Student = require("../src/models/Student");

let adminToken;

const seedStudents = async () => {
  await Student.create([
    { studentId: "S001", name: "A", email: "a@t.com", department: "CSE", semester: 3, latestRiskLevel: "HIGH",     isActive: true, attendancePercentage: 55, internalMarksAverage: 40 },
    { studentId: "S002", name: "B", email: "b@t.com", department: "CSE", semester: 3, latestRiskLevel: "MODERATE", isActive: true, attendancePercentage: 70, internalMarksAverage: 60 },
    { studentId: "S003", name: "C", email: "c@t.com", department: "ECE", semester: 5, latestRiskLevel: "LOW",      isActive: true, attendancePercentage: 90, internalMarksAverage: 85 },
    { studentId: "S004", name: "D", email: "d@t.com", department: "ECE", semester: 5, latestRiskLevel: "HIGH",     isActive: true, attendancePercentage: 50, internalMarksAverage: 35 },
  ]);
};

beforeAll(async () => { await connect(); });
afterEach(async () => { await clearCollections(); });
afterAll(async () => { await closeAndClean(); });

beforeEach(async () => {
  const res = await request(app).post("/api/auth/register").send({
    role: "admin", name: "Test Admin", email: "admin@test.com",
    password: "testpass123", adminId: "ADM001",
  });
  adminToken = res.body.data.token;
});

// ─── DEPARTMENT REPORT ────────────────────────────────────────────────────────

describe("GET /api/reports/department", () => {
  it("should return empty array when no students", async () => {
    const res = await request(app)
      .get("/api/reports/department")
      .set("Authorization", `Bearer ${adminToken}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.data).toEqual([]);
  });

  it("should return risk distribution grouped by department", async () => {
    await seedStudents();
    const res = await request(app)
      .get("/api/reports/department")
      .set("Authorization", `Bearer ${adminToken}`);

    expect(res.statusCode).toBe(200);
    const data = res.body.data;
    expect(data.length).toBe(2); // CSE, ECE

    const cse = data.find((d) => d.department === "CSE");
    expect(cse).toBeDefined();
    expect(cse.HIGH).toBe(1);
    expect(cse.MODERATE).toBe(1);
    expect(cse.total).toBe(2);

    const ece = data.find((d) => d.department === "ECE");
    expect(ece.HIGH).toBe(1);
    expect(ece.LOW).toBe(1);
    expect(ece.total).toBe(2);
  });

  it("should filter by semester", async () => {
    await seedStudents();
    const res = await request(app)
      .get("/api/reports/department?semester=3")
      .set("Authorization", `Bearer ${adminToken}`);
    expect(res.statusCode).toBe(200);
    // Only CSE students in semester 3
    expect(res.body.data.length).toBe(1);
    expect(res.body.data[0].department).toBe("CSE");
    expect(res.body.data[0].total).toBe(2);
  });

  it("should require authentication", async () => {
    const res = await request(app).get("/api/reports/department");
    expect(res.statusCode).toBe(401);
  });
});

// ─── SEMESTER REPORT ──────────────────────────────────────────────────────────

describe("GET /api/reports/semester", () => {
  it("should return risk distribution grouped by semester", async () => {
    await seedStudents();
    const res = await request(app)
      .get("/api/reports/semester")
      .set("Authorization", `Bearer ${adminToken}`);

    expect(res.statusCode).toBe(200);
    const data = res.body.data;
    expect(data.length).toBe(2); // semester 3 and 5

    const sem3 = data.find((d) => d.semester === 3);
    expect(sem3.total).toBe(2);
    expect(sem3.HIGH).toBe(1);
    expect(sem3.MODERATE).toBe(1);

    const sem5 = data.find((d) => d.semester === 5);
    expect(sem5.total).toBe(2);
  });

  it("should filter by department", async () => {
    await seedStudents();
    const res = await request(app)
      .get("/api/reports/semester?department=ECE")
      .set("Authorization", `Bearer ${adminToken}`);
    expect(res.statusCode).toBe(200);
    // ECE has only semester 5 students
    expect(res.body.data.length).toBe(1);
    expect(res.body.data[0].semester).toBe(5);
  });
});

// ─── EXPORT REPORT ────────────────────────────────────────────────────────────

describe("GET /api/reports/export", () => {
  beforeEach(async () => { await seedStudents(); });

  it("should export all students as JSON by default", async () => {
    const res = await request(app)
      .get("/api/reports/export")
      .set("Authorization", `Bearer ${adminToken}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.data.length).toBe(4);
    expect(res.body.meta.count).toBe(4);
  });

  it("should export as CSV when format=csv", async () => {
    const res = await request(app)
      .get("/api/reports/export?format=csv")
      .set("Authorization", `Bearer ${adminToken}`);
    expect(res.statusCode).toBe(200);
    expect(res.headers["content-type"]).toMatch(/text\/csv/);
    expect(res.text).toContain("studentId");
    expect(res.text).toContain("S001");
  });

  it("should filter export by riskLevel", async () => {
    const res = await request(app)
      .get("/api/reports/export?riskLevel=HIGH")
      .set("Authorization", `Bearer ${adminToken}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.data.length).toBe(2);
    expect(res.body.data.every((s) => s.latestRiskLevel === "HIGH")).toBe(true);
  });

  it("should filter export by department", async () => {
    const res = await request(app)
      .get("/api/reports/export?department=CSE")
      .set("Authorization", `Bearer ${adminToken}`);
    expect(res.body.data.length).toBe(2);
    expect(res.body.data.every((s) => s.department === "CSE")).toBe(true);
  });

  it("should filter export by both department and riskLevel", async () => {
    const res = await request(app)
      .get("/api/reports/export?department=ECE&riskLevel=HIGH")
      .set("Authorization", `Bearer ${adminToken}`);
    expect(res.body.data.length).toBe(1);
    expect(res.body.data[0].studentId).toBe("S004");
  });
});
