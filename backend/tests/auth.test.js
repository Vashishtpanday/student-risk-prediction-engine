// tests/auth.test.js
// Integration tests for POST /api/auth/register, /login, /logout, /me

const request = require("supertest");
const app = require("../src/app");
const { connect, closeAndClean, clearCollections } = require("./helpers/db");

beforeAll(async () => { await connect(); });
afterEach(async () => { await clearCollections(); });
afterAll(async () => { await closeAndClean(); });

// ─── REGISTER ─────────────────────────────────────────────────────────────────

describe("POST /api/auth/register", () => {
  const validAdmin = {
    role: "admin",
    name: "Roopa Admin",
    email: "roopa@test.com",
    password: "secret123",
    adminId: "ADMIN001",
  };

  it("should register a new admin and return JWT", async () => {
    const res = await request(app).post("/api/auth/register").send(validAdmin);
    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.token).toBeDefined();
    expect(res.body.data.user.role).toBe("admin");
    expect(res.body.data.user.email).toBe(validAdmin.email);
    // Password must never be returned
    expect(res.body.data.user.password).toBeUndefined();
    expect(res.body.data.user.passwordHash).toBeUndefined();
  });

  it("should register a faculty member", async () => {
    const res = await request(app).post("/api/auth/register").send({
      role: "faculty",
      name: "Dr. Kumar",
      email: "kumar@test.com",
      password: "secret123",
      facultyId: "FAC001",
      department: "CSE",
    });
    expect(res.statusCode).toBe(201);
    expect(res.body.data.user.role).toBe("faculty");
  });

  it("should reject duplicate email", async () => {
    await request(app).post("/api/auth/register").send(validAdmin);
    const res = await request(app).post("/api/auth/register").send(validAdmin);
    expect(res.statusCode).toBe(409);
    expect(res.body.success).toBe(false);
  });

  it("should reject missing required fields", async () => {
    const res = await request(app).post("/api/auth/register").send({
      role: "admin",
      email: "missing@test.com",
      // name, password, adminId missing
    });
    expect(res.statusCode).toBe(422);
    expect(res.body.errors).toBeDefined();
  });

  it("should reject invalid email format", async () => {
    const res = await request(app).post("/api/auth/register").send({
      ...validAdmin,
      email: "not-an-email",
    });
    expect(res.statusCode).toBe(422);
  });

  it("should reject password shorter than 6 characters", async () => {
    const res = await request(app).post("/api/auth/register").send({
      ...validAdmin,
      password: "123",
    });
    expect(res.statusCode).toBe(422);
  });
});

// ─── LOGIN ────────────────────────────────────────────────────────────────────

describe("POST /api/auth/login", () => {
  const adminCreds = {
    role: "admin",
    name: "Roopa Admin",
    email: "roopa@test.com",
    password: "secret123",
    adminId: "ADMIN001",
  };

  beforeEach(async () => {
    await request(app).post("/api/auth/register").send(adminCreds);
  });

  it("should login with valid credentials and return JWT", async () => {
    const res = await request(app).post("/api/auth/login").send({
      role: "admin",
      email: adminCreds.email,
      password: adminCreds.password,
    });
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.token).toBeDefined();
    expect(res.body.data.user.email).toBe(adminCreds.email);
  });

  it("should reject wrong password", async () => {
    const res = await request(app).post("/api/auth/login").send({
      role: "admin",
      email: adminCreds.email,
      password: "wrongpass",
    });
    expect(res.statusCode).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it("should reject non-existent email", async () => {
    const res = await request(app).post("/api/auth/login").send({
      role: "admin",
      email: "ghost@test.com",
      password: "secret123",
    });
    expect(res.statusCode).toBe(401);
  });

  it("should reject missing role", async () => {
    const res = await request(app).post("/api/auth/login").send({
      email: adminCreds.email,
      password: adminCreds.password,
    });
    expect(res.statusCode).toBe(422);
  });
});

// ─── GET /api/auth/me ─────────────────────────────────────────────────────────

describe("GET /api/auth/me", () => {
  let token;

  beforeEach(async () => {
    const reg = await request(app).post("/api/auth/register").send({
      role: "admin",
      name: "Roopa Admin",
      email: "roopa@test.com",
      password: "secret123",
      adminId: "ADMIN001",
    });
    token = reg.body.data.token;
  });

  it("should return current user profile", async () => {
    const res = await request(app)
      .get("/api/auth/me")
      .set("Authorization", `Bearer ${token}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.data.email).toBe("roopa@test.com");
    expect(res.body.data.role).toBe("admin");
    expect(res.body.data.passwordHash).toBeUndefined();
  });

  it("should reject unauthenticated request", async () => {
    const res = await request(app).get("/api/auth/me");
    expect(res.statusCode).toBe(401);
  });

  it("should reject invalid token", async () => {
    const res = await request(app)
      .get("/api/auth/me")
      .set("Authorization", "Bearer invalidtoken.abc.def");
    expect(res.statusCode).toBe(401);
  });
});

// ─── POST /api/auth/logout ────────────────────────────────────────────────────

describe("POST /api/auth/logout", () => {
  it("should logout successfully with valid token", async () => {
    const reg = await request(app).post("/api/auth/register").send({
      role: "admin",
      name: "Roopa Admin",
      email: "roopa@test.com",
      password: "secret123",
      adminId: "ADMIN001",
    });
    const token = reg.body.data.token;

    const res = await request(app)
      .post("/api/auth/logout")
      .set("Authorization", `Bearer ${token}`);
    expect(res.statusCode).toBe(200);
  });

  it("should reject unauthenticated logout", async () => {
    const res = await request(app).post("/api/auth/logout");
    expect(res.statusCode).toBe(401);
  });
});
