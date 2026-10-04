# Backend — Student Risk Prediction Engine

Developer: **Roopa**
Branch: `backend/roopa`
Port: **5000**

---

## Tech Stack

| Tool | Purpose |
|------|---------|
| Node.js | Runtime |
| Express.js | HTTP framework |
| MongoDB | Database |
| Mongoose | ODM |
| JWT / bcryptjs | Auth |
| Axios | ML service HTTP client |
| dotenv | Environment config |
| cors | Cross-origin policy |
| express-validator | Request validation |

---

## Setup

```bash
# 1 — Install dependencies
npm install

# 2 — Edit .env and set your values:
#     MONGO_URI=mongodb://localhost:27017/student_risk_db
#     JWT_SECRET=<strong_random_string>

# 3 — Start dev server
npm run dev
```

Health check: http://localhost:5000/api/health

---

## Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| PORT | No | 5000 | Backend port |
| MONGO_URI | **Yes** | — | MongoDB connection string |
| JWT_SECRET | **Yes** | — | JWT signing key |
| JWT_EXPIRES_IN | No | 7d | Token expiry |
| ML_SERVICE_URL | No | http://localhost:5001 | ML service base URL |
| ALLOWED_ORIGINS | No | localhost:5173,localhost:3000 | CORS origins |

---

## API Routes — Full Reference

### Public

| Method | Path | Description |
|--------|------|-------------|
| GET | /api/health | Health check (backend + ML service status) |

### Auth (POST body: JSON)

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | /api/auth/register | Public | Register admin or faculty |
| POST | /api/auth/login | Public | Login and receive JWT |
| POST | /api/auth/logout | JWT | Logout (client discards token) |
| GET | /api/auth/me | JWT | Get current authenticated user |

### Students

| Method | Path | Auth | Role | Description |
|--------|------|------|------|-------------|
| GET | /api/students | JWT | any | List students (paginated, filterable) |
| POST | /api/students | JWT | admin | Create student |
| GET | /api/students/:id | JWT | any | Get student by _id or studentId |
| PUT | /api/students/:id | JWT | admin/faculty | Update student |
| DELETE | /api/students/:id | JWT | admin | Soft-delete (or permanent with ?permanent=true) |
| GET | /api/students/:id/history | JWT | any | Paginated prediction history |

### Faculty

| Method | Path | Auth | Role | Description |
|--------|------|------|------|-------------|
| GET | /api/faculty | JWT | admin | List all faculty |
| POST | /api/faculty | JWT | admin | Create faculty member |
| GET | /api/faculty/:id | JWT | admin/faculty | Get faculty by _id or facultyId |
| PUT | /api/faculty/:id | JWT | admin | Update faculty (incl. password reset) |
| DELETE | /api/faculty/:id | JWT | admin | Soft-delete or permanent |
| GET | /api/faculty/:id/students | JWT | admin/faculty | Students assigned to this faculty |

### Predictions

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | /api/predict | JWT | Run prediction for one student |
| POST | /api/predict/batch | JWT | Run predictions for multiple students |
| GET | /api/predict/:studentId | JWT | Get prediction history for a student |

> ⚠️ Predictions call the Python ML service on port 5001.
> See ML integration notes below.

### Reports

| Method | Path | Auth | Query Params | Description |
|--------|------|------|------|-------------|
| GET | /api/reports/department | JWT | ?semester=3 | Risk breakdown by department |
| GET | /api/reports/semester | JWT | ?department=CSE | Risk breakdown by semester |
| GET | /api/reports/export | JWT | ?format=csv&department=CSE&semester=3&riskLevel=HIGH | Export student data (JSON or CSV) |

### Dashboard

| Method | Path | Auth | Query Params | Description |
|--------|------|------|------|-------------|
| GET | /api/dashboard/stats | JWT | — | Overall counts + risk distribution |
| GET | /api/dashboard/risky | JWT | ?riskLevel=HIGH&department=CSE&semester=3&page=1&limit=20 | Filtered list of risky students |

---

## Query Parameters

### GET /api/students
| Param | Type | Description |
|-------|------|-------------|
| department | string | Filter by department (case-insensitive) |
| semester | int 1-8 | Filter by semester |
| riskLevel | LOW/MODERATE/HIGH/UNKNOWN | Filter by risk |
| search | string | Search name, studentId, email |
| isActive | boolean | true/false |
| page | int | Page number (default 1) |
| limit | int | Results per page (default 20, max 100) |
| sortBy | string | Field to sort by (default createdAt) |
| sortOrder | asc/desc | Sort direction (default desc) |

---

## Auth Design

- Roles: `admin`, `superadmin`, `faculty`
- Token format: `Authorization: Bearer <jwt_token>`
- Token expiry: 7 days (configurable via `JWT_EXPIRES_IN`)
- Logout: client-side only (discard token); server endpoint returns 200
- Passwords: bcryptjs with 12 salt rounds

---

## ML Service Integration

All ML calls go through `src/services/ml.service.js`.
All integration points are marked `// ML_INTEGRATION_POINT` in that file.

### ⚠️ Pending from Manshi (ML team — port 5001)

| # | Question |
|---|----------|
| 1 | Endpoint path — `/predict` or `/api/predict`? |
| 2 | Exact request body field names (snake_case / camelCase)? |
| 3 | Exact response field names (`risk_level`? `riskLevel`?) |
| 4 | Batch endpoint path and payload structure? |
| 5 | Any API key / auth header required? |
| 6 | Additional input features beyond attendance, marks, CP/NCP, semester, department? |

Until confirmed, prediction endpoints return `503 Service Unavailable` when ML is offline.

---

## Commit Message Convention

```
Add: new feature or file
Fix: bug fix
Update: change to existing file
Docs: README or comment update
Test: test file added
```
