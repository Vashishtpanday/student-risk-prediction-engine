# AI-Based Student Risk Prediction Engine — Backend Service

## Assigned To
Person 2 — Full Stack Developer (Node.js Backend)

## Module Overview
This module contains the Node.js + Express.js REST API backend.
It handles authentication, student data management, communication
with the Python ML microservice, and serves data to the React frontend.
All data is stored in MongoDB.

---

## Folder Structure

backend/
│
├── src/
│   │
│   ├── config/
│   │   ├── db.js
│   │   ├── env.js
│   │   └── cors.js
│   │
│   ├── models/
│   │   ├── Student.js
│   │   ├── Faculty.js
│   │   ├── Admin.js
│   │   ├── Prediction.js
│   │   └── AcademicRecord.js
│   │
│   ├── controllers/
│   │   ├── auth.controller.js
│   │   ├── student.controller.js
│   │   ├── faculty.controller.js
│   │   ├── prediction.controller.js
│   │   ├── report.controller.js
│   │   └── dashboard.controller.js
│   │
│   ├── routes/
│   │   ├── index.js
│   │   ├── auth.routes.js
│   │   ├── student.routes.js
│   │   ├── faculty.routes.js
│   │   ├── prediction.routes.js
│   │   ├── report.routes.js
│   │   └── dashboard.routes.js
│   │
│   ├── middleware/
│   │   ├── auth.middleware.js
│   │   ├── role.middleware.js
│   │   ├── validate.middleware.js
│   │   └── error.middleware.js
│   │
│   ├── services/
│   │   ├── ml.service.js
│   │   ├── prediction.service.js
│   │   └── report.service.js
│   │
│   └── utils/
│       ├── jwt.utils.js
│       ├── response.utils.js
│       ├── hash.utils.js
│       └── logger.js
│
├── tests/
│   ├── auth.test.js
│   ├── student.test.js
│   └── prediction.test.js
│
├── postman/
│   └── StudentRiskAPI.postman_collection.json
│
├── .env
├── .env.example
├── .gitignore
├── package.json
├── package-lock.json
└── README.md

---

## Tech Stack

| Tool | Purpose |
|------|---------|
| Node.js | Runtime environment |
| Express.js | Web framework |
| MongoDB | NoSQL Database |
| Mongoose | MongoDB ODM |
| JWT | Authentication tokens |
| Bcrypt | Password hashing |
| Axios | Call Python ML service |
| dotenv | Environment variables |
| cors | Cross-origin requests |

---

## API Endpoints Reference

Auth Routes /api/auth

POST   /api/auth/register
POST   /api/auth/login
POST   /api/auth/logout
GET    /api/auth/me

Student Routes /api/students

GET    /api/students
POST   /api/students
GET    /api/students/:id
PUT    /api/students/:id
DELETE /api/students/:id
GET    /api/students/:id/history

Prediction Routes /api/predict

POST   /api/predict
POST   /api/predict/batch
GET    /api/predict/:studentId

Report Routes /api/reports

GET    /api/reports/department
GET    /api/reports/semester
GET    /api/reports/export

Dashboard Routes /api/dashboard

GET    /api/dashboard/stats
GET    /api/dashboard/risky

---

## Database Schemas

Student Schema:

{
  student_id: String,
  name: String,
  email: String,
  password: String,
  department: String,
  semester: Number,
  role: String,
  createdAt: Date
}

Prediction Schema:

{
  student_id: ObjectId,
  attendance_pct: Number,
  internal_marks: Number,
  cp_ncp: String,
  risk_category: String,
  confidence_score: Number,
  contributing_factors: Object,
  recommendations: Array,
  predicted_at: Date
}

---

## How to Run Locally

Step 1 — Clone and navigate

git clone https://github.com/[owner]/student-risk-prediction-engine.git
cd student-risk-prediction-engine/backend

Step 2 — Switch to your branch

git checkout feature/backend

Step 3 — Install dependencies

npm install

Step 4 — Set up environment variables

cp .env.example .env

Edit .env with these values:

PORT=5000
MONGO_URI=mongodb://localhost:27017/student_risk_db
JWT_SECRET=your_secret_key_here
JWT_EXPIRES_IN=7d
ML_SERVICE_URL=http://localhost:5001

Step 5 — Start the server

Development mode:
npm run dev

Production mode:
npm start

Backend runs on: http://localhost:5000

---

## package.json Dependencies

dependencies:
  express: ^4.18.2
  mongoose: ^8.0.0
  jsonwebtoken: ^9.0.2
  bcryptjs: ^2.4.3
  axios: ^1.6.2
  dotenv: ^16.3.1
  cors: ^2.8.5
  express-validator: ^7.0.1

devDependencies:
  nodemon: ^3.0.2
  jest: ^29.7.0

scripts:
  start: node src/app.js
  dev: nodemon src/app.js
  test: jest

---

## Coordination Points

- Get ML API endpoint details from Person 1 — runs on port 5001
- Share all API endpoints with Person 3 — frontend connects here
- Get recommendation data format from Person 4
- Backend runs on port 5000

---

## Weekly Plan

| Week | Tasks |
|------|-------|
| Week 1 | Project setup, MongoDB connection, all schemas, .env config |
| Week 2 | Auth APIs (register/login/JWT), Student CRUD APIs |
| Week 3 | Prediction API (call ML service), Report and Dashboard APIs |
| Week 4 | Full API testing with Postman, bug fixes, integration support |

---

## Git Workflow

Start working:
git checkout feature/backend
git pull origin feature/backend

After making changes:
git add .
git commit -m "Add: student schema and MongoDB connection setup"
git push origin feature/backend

Raise a Pull Request to merge into the dev branch when your feature is complete.
