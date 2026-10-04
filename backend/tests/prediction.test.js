// tests/prediction.test.js
// Integration tests for /api/predict — single, batch, history, validation.
// NOTE: ML service (port 5001) is mocked so these tests run offline.

const request = require("supertest");
const app = require("../src/app");
const { connect, closeAndClean, clearCollections } = require("./helpers/db");
const Student = require("../src/models/Student");
const Prediction = require("../src/models/Prediction");

// ─── Mock the ML service client so tests don't need Python running ────────────
jest.mock("../src/services/ml.service", () => ({
  predictSingle: jest.fn().mockResolvedValue({
    riskLevel: "HIGH",
    confidenceScore: 0.89,
    recommendation: null,
    rawMlResponse: { prediction: { risk_category: "High Risk", confidence: 0.89 } },
  }),
  predictBatch: jest.fn().mockImplementation((featureList) =>
    Promise.resolve(
      featureList.map(() => ({
        riskLevel: "MODERATE",
        confidenceScore: 0.75,
        recommendation: null,
        rawMlResponse: { prediction: { risk_category: "Moderate Risk", confidence: 0.75 } },
      }))
    )
  ),
  checkMLHealth: jest.fn().mockResolvedValue(true),
  buildRequestPayload: jest.fn(),
}));

let adminToken;

const createStudent = async (overrides = {}) => {
  const defaults = {
    studentId: "STU001",
    name: "Test Student",
    email: "stu@test.com",
    department: "CSE",
    semester: 3,
    attendancePercentage: 65,
    internalMarksAverage: 58,
    previousBacklogs: 1,
  };
  return Student.create({ ...defaults, ...overrides });
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

// ─── POST /api/predict — SINGLE ───────────────────────────────────────────────

describe("POST /api/predict", () => {
  it("should run prediction for a valid student and return risk level", async () => {
    const student = await createStudent();

    const res = await request(app)
      .post("/api/predict")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ studentId: student._id.toString() });

    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.riskLevel).toBe("HIGH");
    expect(res.body.data.confidenceScore).toBe(0.89);
    expect(res.body.data.student).toBeDefined();
  });

  it("should also resolve by studentId string (not just _id)", async () => {
    await createStudent();

    const res = await request(app)
      .post("/api/predict")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ studentId: "STU001" });

    expect(res.statusCode).toBe(201);
    expect(res.body.data.riskLevel).toBe("HIGH");
  });

  it("should update latestRiskLevel on student document", async () => {
    const student = await createStudent();

    await request(app)
      .post("/api/predict")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ studentId: student._id.toString() });

    const updated = await Student.findById(student._id);
    expect(updated.latestRiskLevel).toBe("HIGH");
  });

  it("should return 404 for non-existent student", async () => {
    const res = await request(app)
      .post("/api/predict")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ studentId: "GHOST999" });
    expect(res.statusCode).toBe(404);
  });

  it("should return 422 if student missing attendance data", async () => {
    const student = await createStudent({ attendancePercentage: null });

    const res = await request(app)
      .post("/api/predict")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ studentId: student._id.toString() });

    expect(res.statusCode).toBe(422);
  });

  it("should return 400 for deactivated student", async () => {
    const student = await createStudent({ isActive: false });

    const res = await request(app)
      .post("/api/predict")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ studentId: student._id.toString() });

    expect(res.statusCode).toBe(400);
  });

  it("should return 422 if studentId is missing in body", async () => {
    const res = await request(app)
      .post("/api/predict")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({});
    expect(res.statusCode).toBe(422);
  });

  it("should require authentication", async () => {
    const res = await request(app)
      .post("/api/predict")
      .send({ studentId: "STU001" });
    expect(res.statusCode).toBe(401);
  });
});

// ─── POST /api/predict/batch ──────────────────────────────────────────────────

describe("POST /api/predict/batch", () => {
  it("should run batch prediction for multiple students", async () => {
    const s1 = await createStudent({ studentId: "B001", email: "b1@t.com" });
    const s2 = await createStudent({ studentId: "B002", email: "b2@t.com" });

    const res = await request(app)
      .post("/api/predict/batch")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ studentIds: [s1._id.toString(), s2._id.toString()] });

    expect(res.statusCode).toBe(201);
    expect(res.body.data.processed).toBe(2);
    expect(res.body.data.predictions.length).toBe(2);
    expect(res.body.data.batchJobId).toBeDefined();
    expect(res.body.data.notFound).toEqual([]);
  });

  it("should report notFound entries for missing student IDs", async () => {
    const s1 = await createStudent();

    const res = await request(app)
      .post("/api/predict/batch")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ studentIds: [s1._id.toString(), "GHOST999"] });

    expect(res.statusCode).toBe(201);
    expect(res.body.data.processed).toBe(1);
    expect(res.body.data.notFound).toContain("GHOST999");
  });

  it("should return 404 if all student IDs are invalid", async () => {
    const res = await request(app)
      .post("/api/predict/batch")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ studentIds: ["GHOST001", "GHOST002"] });
    expect(res.statusCode).toBe(404);
  });

  it("should reject empty studentIds array", async () => {
    const res = await request(app)
      .post("/api/predict/batch")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ studentIds: [] });
    expect(res.statusCode).toBe(422);
  });

  it("should reject more than 100 students", async () => {
    const ids = Array.from({ length: 101 }, (_, i) => `STU${i}`);
    const res = await request(app)
      .post("/api/predict/batch")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ studentIds: ids });
    expect(res.statusCode).toBe(422);
  });
});

// ─── GET /api/predict/:studentId — HISTORY ────────────────────────────────────

describe("GET /api/predict/:studentId", () => {
  it("should return empty prediction history for a new student", async () => {
    const student = await createStudent();

    const res = await request(app)
      .get(`/api/predict/${student._id}`)
      .set("Authorization", `Bearer ${adminToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.data.predictions).toEqual([]);
    expect(res.body.meta.total).toBe(0);
  });

  it("should return prediction history after predictions run", async () => {
    const student = await createStudent();

    // Create predictions manually
    await Prediction.create([
      { student: student._id, studentId: "STU001", riskLevel: "HIGH",     inputFeatures: {}, confidenceScore: 0.9 },
      { student: student._id, studentId: "STU001", riskLevel: "MODERATE", inputFeatures: {}, confidenceScore: 0.7 },
    ]);

    const res = await request(app)
      .get(`/api/predict/${student._id}`)
      .set("Authorization", `Bearer ${adminToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.data.predictions.length).toBe(2);
    expect(res.body.meta.total).toBe(2);
  });

  it("should filter history by riskLevel", async () => {
    const student = await createStudent();

    await Prediction.create([
      { student: student._id, studentId: "STU001", riskLevel: "HIGH", inputFeatures: {} },
      { student: student._id, studentId: "STU001", riskLevel: "LOW",  inputFeatures: {} },
    ]);

    const res = await request(app)
      .get(`/api/predict/${student._id}?riskLevel=HIGH`)
      .set("Authorization", `Bearer ${adminToken}`);

    expect(res.body.data.predictions.length).toBe(1);
    expect(res.body.data.predictions[0].riskLevel).toBe("HIGH");
  });

  it("should return 404 for non-existent student", async () => {
    const res = await request(app)
      .get("/api/predict/NOBODY")
      .set("Authorization", `Bearer ${adminToken}`);
    expect(res.statusCode).toBe(404);
  });
});
