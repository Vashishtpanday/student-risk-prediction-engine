# AI-Based Student Risk Prediction Engine

An intelligent, microservices-based ERP module that predicts student academic risk using Machine Learning based on attendance, internal marks, CP/NCP status, and previous backlogs. The system classifies students into Low, Moderate, or High Risk categories and provides Explainable AI insights, personalized recommendations, and a natural-language AI Academic Assistant for faculty queries.

---

##  Team

| Person | Role | Branch |
|--------|------|--------|
| Manshi | ML Engineer + Python Flask API | ml-service/manshi |
| Roopa | Node.js Backend + MongoDB | backend/roopa |
| Vashisht | React.js Frontend | frontend/vashisht |
| Prudhvi | Data Engineer + AI Assistant | data-ai/prudhvi |

---

##  System Architecture and Ports

This project runs 4 microservices simultaneously:

| Module | Technology | Port | Purpose |
|--------|------------|------|---------|
| Backend | Node.js, Express, MongoDB | 5000 | Auth, Student CRUD, Dashboard Stats |
| ML Service | Python, Flask, Scikit-learn | 5001 | Risk Prediction Model API (`/predict`) |
| Data-AI | Python, Flask, Pandas, SHAP | 5002 | AI Assistant Queries (`/query`) |
| Frontend | React 19, Vite, Tailwind CSS | 5173 | Web UI & Role-based Dashboards |

---

##  Repository Structure

```text
student-risk-prediction-engine/
├── backend/                 # Node.js + Express + MongoDB API
├── frontend/                # React web application
├── ml-service/              # Machine Learning Flask microservice
├── data-ai/                 # Dataset, EDA, Explainability, AI Assistant
├── .gitignore               # Root gitignore
├── requirements.txt         # Root Python dependencies
└── README.md                # This file
```

---

##  Prerequisites
l these before setup:
* Node.js (v18 or higher)
* Python (v3.10 or higher)
* MongoDB running locally (`mongodb://localhost:27017`)
* Git

---

##  Quick Start Guide

### 1. Clone the repository
```bash
git clone https://github.com/YOUR_USERNAME/student-risk-prediction-engine.git
cd student-risk-prediction-engine
```

### 2. Install Root Python Dependencies
```bash
pip install -r requirements.txt
```

---

##  Module Setup Instructions

### A. Backend Setup (Port 5000)
```bash
cd backend
npm install
```

Create `backend/.env`:
```env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb://localhost:27017/student_risk_db
JWT_SECRET=super_secret_jwt_key_student_risk_prediction_2026
JWT_EXPIRES_IN=7d
ML_SERVICE_URL=http://localhost:5001
AI_ASSISTANT_URL=http://localhost:5002
CLIENT_URL=http://localhost:5173
```

Seed database with 1,000 students & demo accounts:
```bash
node seed.js
```

Start backend:
```bash
npm run dev
```

---

### B. ML Service Setup (Port 5001)
Open a new terminal in the root folder:
```bash
cd ml-service
python src/app.py
```

---

### C. Data-AI Assistant Setup (Port 5002)
Open a new terminal in the root folder:
```bash
cd data-ai
python ai_assistant/assistant_api.py
```

---

### D. Frontend Setup (Port 5173)
Open a new terminal in the root folder:
```bash
cd frontend
npm install
```

Create `frontend/.env`:
```env
VITE_API_BASE_URL=http://localhost:5000/api
VITE_ML_SERVICE_URL=http://localhost:5001
VITE_AI_ASSISTANT_URL=http://localhost:5002
VITE_APP_NAME=Student Risk Prediction Engine
VITE_APP_VERSION=1.0.0
```

Start frontend:
```bash
npm run dev
```

Open your browser at `http://localhost:5173`

---

##  Demo Login Credentials

Password for all accounts: `password123`

| Role | Email | Access |
|------|-------|--------|
| Admin | admin@college.edu | Reports, manage users, institution stats |
| Faculty | faculty@college.edu | Student list, predict risk, AI assistant |
| Student | student@college.edu | Own dashboard, risk, recommendations |

*(Note: You can log in as ANY of the 1,000 students in the database using their email, password `password123`, and Role `Student`).*

---

##  Features Implemented

* **Student View:** Personal dashboard, live ML risk prediction with confidence scores, personalized actionable recommendations.
* **Faculty View:** Complete student monitoring list with dynamic search/filters, manual prediction form for what-if scenarios, natural language AI Academic Assistant chat.
* **Admin View:** Institution-wide analytics, department/semester comparative reports, full user management (add/delete records directly into MongoDB).

---

