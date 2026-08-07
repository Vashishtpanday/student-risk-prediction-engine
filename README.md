# AI-Based Student Risk Prediction Engine — Frontend

## Assigned To
Person 3 — Frontend Developer (React.js)

## Module Overview
This module contains the complete React.js web application.
It provides the user interface for students, faculty, and administrators
to interact with the AI-Based Student Risk Prediction Engine.
It connects with the Node.js backend via REST APIs and displays
prediction results, dashboards, charts, and recommendations.

---

## Folder Structure

frontend/
│
├── public/
│   ├── index.html
│   ├── favicon.ico
│   └── logo.png
│
├── src/
│   │
│   ├── api/
│   │   ├── axiosInstance.js
│   │   ├── auth.api.js
│   │   ├── student.api.js
│   │   ├── prediction.api.js
│   │   ├── report.api.js
│   │   └── dashboard.api.js
│   │
│   ├── assets/
│   │   ├── images/
│   │   │   ├── logo.png
│   │   │   └── hero-bg.png
│   │   └── icons/
│   │       └── risk-icon.svg
│   │
│   ├── components/
│   │   ├── common/
│   │   │   ├── Navbar.jsx
│   │   │   ├── Sidebar.jsx
│   │   │   ├── Footer.jsx
│   │   │   ├── Loader.jsx
│   │   │   ├── Modal.jsx
│   │   │   ├── Button.jsx
│   │   │   ├── InputField.jsx
│   │   │   ├── Badge.jsx
│   │   │   ├── Card.jsx
│   │   │   └── Alert.jsx
│   │   │
│   │   ├── charts/
│   │   │   ├── RiskDistributionPie.jsx
│   │   │   ├── AttendanceBarChart.jsx
│   │   │   ├── MarksScatterPlot.jsx
│   │   │   └── SemesterTrendLine.jsx
│   │   │
│   │   ├── student/
│   │   │   ├── StudentCard.jsx
│   │   │   ├── StudentTable.jsx
│   │   │   ├── StudentSearchBar.jsx
│   │   │   └── RiskBadge.jsx
│   │   │
│   │   ├── prediction/
│   │   │   ├── PredictionForm.jsx
│   │   │   ├── PredictionResult.jsx
│   │   │   └── PredictionHistory.jsx
│   │   │
│   │   └── recommendation/
│   │       ├── RecommendationCard.jsx
│   │       └── RecommendationList.jsx
│   │
│   ├── pages/
│   │   ├── auth/
│   │   │   ├── LoginPage.jsx
│   │   │   └── RegisterPage.jsx
│   │   │
│   │   ├── student/
│   │   │   ├── StudentDashboard.jsx
│   │   │   ├── MyPrediction.jsx
│   │   │   └── MyRecommendations.jsx
│   │   │
│   │   ├── faculty/
│   │   │   ├── FacultyDashboard.jsx
│   │   │   ├── StudentList.jsx
│   │   │   ├── StudentDetail.jsx
│   │   │   ├── PredictStudent.jsx
│   │   │   └── AIAssistant.jsx
│   │   │
│   │   ├── admin/
│   │   │   ├── AdminDashboard.jsx
│   │   │   ├── ReportPage.jsx
│   │   │   └── ManageUsers.jsx
│   │   │
│   │   └── common/
│   │       ├── NotFoundPage.jsx
│   │       └── UnauthorizedPage.jsx
│   │
│   ├── context/
│   │   ├── AuthContext.jsx
│   │   └── ThemeContext.jsx
│   │
│   ├── hooks/
│   │   ├── useAuth.js
│   │   ├── useFetch.js
│   │   └── usePrediction.js
│   │
│   ├── routes/
│   │   ├── AppRouter.jsx
│   │   ├── ProtectedRoute.jsx
│   │   └── RoleRoute.jsx
│   │
│   ├── utils/
│   │   ├── formatDate.js
│   │   ├── riskColor.js
│   │   └── validators.js
│   │
│   ├── constants/
│   │   ├── apiEndpoints.js
│   │   └── riskLevels.js
│   │
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
│
├── .env
├── .env.example
├── .gitignore
├── vite.config.js
├── tailwind.config.js
├── postcss.config.js
├── package.json
└── README.md

---

## Tech Stack

| Tool | Purpose |
|------|---------|
| React.js 18 | UI framework |
| Vite | Build tool |
| Tailwind CSS | Styling |
| React Router v6 | Client-side routing |
| Axios | API calls |
| Chart.js / Plotly | Data visualization |
| Context API | State management |

---

## Pages Overview

| Page | Role | Description |
|------|------|-------------|
| /login | All | Login page |
| /student/dashboard | Student | View own risk and recommendations |
| /student/prediction | Student | See prediction result |
| /faculty/dashboard | Faculty | Overview of all students |
| /faculty/students | Faculty | Student list with risk badges |
| /faculty/predict | Faculty | Enter student data and get prediction |
| /faculty/assistant | Faculty | AI assistant query box |
| /admin/dashboard | Admin | Full system overview |
| /admin/reports | Admin | Generate reports with charts |

---

## How to Run Locally

Step 1 — Clone and navigate

git clone https://github.com/[owner]/student-risk-prediction-engine.git
cd student-risk-prediction-engine/frontend

Step 2 — Switch to your branch

git checkout feature/frontend

Step 3 — Install dependencies

npm install

Step 4 — Set up environment variables

cp .env.example .env

Edit .env with these values:

VITE_API_BASE_URL=http://localhost:5000/api
VITE_APP_NAME=Student Risk Prediction Engine

Step 5 — Start the development server

npm run dev

Frontend runs on: http://localhost:5173

---

## package.json Dependencies

dependencies:
  react: ^18.2.0
  react-dom: ^18.2.0
  react-router-dom: ^6.20.0
  axios: ^1.6.2
  chart.js: ^4.4.0
  react-chartjs-2: ^5.2.0
  plotly.js: ^2.27.0
  react-plotly.js: ^2.6.0

devDependencies:
  @vitejs/plugin-react: ^4.2.0
  vite: ^5.0.0
  tailwindcss: ^3.3.6
  postcss: ^8.4.32
  autoprefixer: ^10.4.16

scripts:
  dev: vite
  build: vite build
  preview: vite preview

---

## Coordination Points

- Get all API endpoints from Person 2 — backend runs on port 5000
- Get recommendation data structure from Person 4
- Get prediction response format from Person 1
- Display contributing factors from Person 4 explainability module

---

## Weekly Plan

| Week | Tasks |
|------|-------|
| Week 1 | Project setup, Tailwind config, folder structure, reusable components |
| Week 2 | Login page, Student Dashboard, Faculty Dashboard static UI |
| Week 3 | Charts integration, Prediction form and result page, AI assistant page |
| Week 4 | Connect all pages to backend APIs, protected routes, responsive testing |

---

## Git Workflow

Start working:
git checkout feature/frontend
git pull origin feature/frontend

After making changes:
git add .
git commit -m "Add: faculty dashboard with student risk table"
git push origin feature/frontend

Raise a Pull Request to merge into the dev branch when your feature is complete.
