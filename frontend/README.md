# Frontend — AI-Based Student Risk Prediction Engine

## Overview
This is the complete frontend web application for the Student Risk Prediction Engine.
Built using React.js with Vite and Tailwind CSS. The application provides three role-based
dashboards (Student, Faculty, Admin) with AI risk predictions, recommendations,
data visualization, and an AI academic assistant.

Currently the frontend runs on **MOCK DATA** for demonstration purposes.
Integration points are clearly marked in the code for backend and ML service teams.

---

## Tech Stack

| Category | Technology |
|----------|-----------|
| Framework | React 18 with Vite |
| Styling | Tailwind CSS |
| Routing | React Router v6 |
| HTTP Client | Axios |
| Charts | Chart.js with react-chartjs-2 |
| Tables | react-data-table-component |
| Calendar | react-calendar |
| Icons | Lucide React |
| Notifications | react-hot-toast |
| Date Utils | date-fns |
| Utility | clsx |

---

## How to Run Locally

### Step 1 — Install Node.js
Download from https://nodejs.org (LTS version)

### Step 2 — Clone Repository
```bash
git clone https://github.com/LEAD_USERNAME/student-risk-prediction-engine.git
cd student-risk-prediction-engine
git checkout feature/frontend
cd frontend
```

### Step 3 — Install Dependencies
```bash
npm install
```

### Step 4 — Setup Environment
```bash
cp .env.example .env
```

### Step 5 — Run the Development Server
```bash
npm run dev
```

Application will run on http://localhost:5173

---

## Demo Login Credentials

All demo accounts use the password: **password123**

| Role | Email | Access |
|------|-------|--------|
| Faculty | faculty@college.edu | All students, prediction, AI assistant |
| Student | student@college.edu | Own risk, recommendations |
| Admin | admin@college.edu | Reports, user management |

---

## Folder Structure

```
frontend/
│
├── public/
│   └── vite.svg
│
├── src/
│   │
│   ├── api/                    All API integration files
│   │   ├── axiosInstance.js    Axios base config with interceptors
│   │   ├── auth.api.js         Login, register, logout
│   │   ├── student.api.js      Student CRUD operations
│   │   ├── prediction.api.js   ML prediction calls
│   │   └── dashboard.api.js    Dashboard stats and reports
│   │
│   ├── components/
│   │   ├── common/             Reusable UI components
│   │   │   ├── Alert.jsx
│   │   │   ├── Badge.jsx       Risk level badge
│   │   │   ├── Button.jsx
│   │   │   ├── Card.jsx
│   │   │   ├── InputField.jsx
│   │   │   ├── Loader.jsx
│   │   │   ├── Modal.jsx
│   │   │   ├── Navbar.jsx      Top navigation
│   │   │   ├── SelectField.jsx
│   │   │   ├── Sidebar.jsx     Left sidebar with role-based menu
│   │   │   └── StatCard.jsx    Dashboard stat cards
│   │   │
│   │   ├── charts/
│   │   │   ├── AttendanceBarChart.jsx
│   │   │   ├── MarksBarChart.jsx
│   │   │   └── RiskDistributionPie.jsx
│   │   │
│   │   ├── student/
│   │   │   └── StudentTable.jsx  Data table for students
│   │   │
│   │   ├── prediction/
│   │   │   └── PredictionResult.jsx  Shows AI prediction output
│   │   │
│   │   └── recommendation/
│   │       ├── RecommendationCard.jsx
│   │       └── RecommendationList.jsx
│   │
│   ├── constants/
│   │   ├── apiEndpoints.js     All API URL constants
│   │   └── riskLevels.js       Risk colors and constants
│   │
│   ├── context/
│   │   └── AuthContext.jsx     Global auth state
│   │
│   ├── hooks/
│   │   ├── useAuth.js
│   │   ├── useFetch.js
│   │   └── usePrediction.js
│   │
│   ├── pages/
│   │   ├── auth/
│   │   │   └── LoginPage.jsx
│   │   │
│   │   ├── student/
│   │   │   ├── StudentDashboard.jsx    Student home
│   │   │   ├── MyPrediction.jsx        Own risk view
│   │   │   └── MyRecommendations.jsx   Personal recommendations
│   │   │
│   │   ├── faculty/
│   │   │   ├── FacultyDashboard.jsx    Overview of all students
│   │   │   ├── StudentList.jsx         Filterable student list
│   │   │   ├── StudentDetail.jsx       Single student view
│   │   │   ├── PredictStudent.jsx      Manual prediction form
│   │   │   └── AIAssistant.jsx         Natural language query
│   │   │
│   │   ├── admin/
│   │   │   ├── AdminDashboard.jsx      Full system overview
│   │   │   ├── ReportPage.jsx          Detailed reports
│   │   │   └── ManageUsers.jsx         Add / remove students
│   │   │
│   │   └── common/
│   │       ├── NotFoundPage.jsx        404 page
│   │       └── UnauthorizedPage.jsx    403 page
│   │
│   ├── routes/
│   │   ├── AppRouter.jsx       All route definitions
│   │   └── ProtectedRoute.jsx  Role-based access control
│   │
│   ├── utils/
│   │   ├── formatDate.js
│   │   ├── riskColor.js
│   │   └── validators.js
│   │
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css               Tailwind + global styles
│
├── .env                        Environment variables (do not push)
├── .env.example                Template for .env
├── .gitignore
├── index.html
├── package.json
├── postcss.config.js
├── tailwind.config.js
└── README.md
```

---

## Pages Overview

### Student Role
| Route | Description |
|-------|-------------|
| /student/dashboard | Personal dashboard with academic stats and AI prediction |
| /student/prediction | Detailed risk prediction with refresh option |
| /student/recommendations | Personalized academic recommendations |

### Faculty Role
| Route | Description |
|-------|-------------|
| /faculty/dashboard | Overview stats, charts, high risk students list |
| /faculty/students | All students with filters (department, risk) and search |
| /faculty/students/:id | Individual student detail with prediction |
| /faculty/predict | Manual prediction form for any student data |
| /faculty/assistant | AI academic assistant chatbox for queries |

### Admin Role
| Route | Description |
|-------|-------------|
| /admin/dashboard | Institution-wide statistics and department summary |
| /admin/reports | Detailed reports by department or semester |
| /admin/users | Manage student database (add / remove) |

---

## Features Implemented

- Role-based authentication with 3 user types
- Protected routes based on user role
- Modern light theme UI with blue accent colors
- Responsive design for all screen sizes
- Risk prediction display with confidence score
- Contributing factors visualization
- Personalized recommendations by priority
- Interactive charts (Doughnut, Bar)
- Searchable and filterable data tables
- Academic calendar widget
- AI academic assistant with natural language queries
- Toast notifications
- Loading states and error handling
- Form validation
- Modal dialogs for adding users

---

## Service Ports

| Service | Port | Owner |
|---------|------|-------|
| Frontend (this) | 5173 | Person 3 |
| Backend | 5000 | Person 2 |
| ML Service | 5001 | Person 1 |
| AI Assistant | 5002 | Person 4 |

---

## Environment Variables

Create a `.env` file in the frontend folder with:

```
VITE_API_BASE_URL=http://localhost:5000/api
VITE_ML_SERVICE_URL=http://localhost:5001
VITE_AI_ASSISTANT_URL=http://localhost:5002
VITE_APP_NAME=Student Risk Prediction Engine
VITE_APP_VERSION=1.0.0
```

---

## Integration Guide for Team Members

The frontend currently uses mock data. When your part is ready follow these steps
to integrate with the frontend.

### For Person 2 (Backend Developer)

The frontend expects these REST endpoints from your Node.js backend:

**Authentication**
```
POST   /api/auth/login          Body: { email, password }
                                Returns: { user: {...}, token: "..." }

POST   /api/auth/register       Body: user data
POST   /api/auth/logout
GET    /api/auth/me             Returns current logged in user
```

**Students**
```
GET    /api/students            Returns array of all students
POST   /api/students            Add new student
GET    /api/students/:id        Get single student
PUT    /api/students/:id        Update student
DELETE /api/students/:id        Delete student
GET    /api/students/:id/history   Get prediction history
```

**Dashboard**
```
GET    /api/dashboard/stats     Returns { total, high, moderate, low, avgAttendance, avgMarks }
GET    /api/dashboard/risky     Returns high risk students array
```

**Reports**
```
GET    /api/reports/department  Returns department wise summary
GET    /api/reports/semester    Returns semester wise summary
```

**Expected Student Object Format**
```json
{
  "_id": "abc123",
  "student_id": "STU001",
  "name": "Arjun Sharma",
  "email": "arjun@college.edu",
  "department": "CSE",
  "semester": 3,
  "attendance_pct": 75.5,
  "internal_marks": 65,
  "cp_ncp": "CP",
  "previous_backlogs": 0,
  "risk_category": "Low Risk",
  "confidence_score": 0.92,
  "createdAt": "2024-01-10T10:00:00.000Z"
}
```

**Expected Login Response Format**
```json
{
  "user": {
    "_id": "user123",
    "name": "Arjun Sharma",
    "email": "student@college.edu",
    "role": "student",
    "department": "CSE",
    "semester": 3,
    "student_id": "STU001"
  },
  "token": "jwt-token-here"
}
```

---

### For Person 1 (ML Engineer)

The frontend expects your Flask API to have these endpoints:

**Single Prediction**
```
POST   /predict
Body: {
  student_id: "STU001",
  attendance_pct: 75.5,
  internal_marks: 65,
  cp_ncp: "CP",
  semester: 3
}
```

**Batch Prediction**
```
POST   /batch-predict
Body: { students: [...] }
```

**Expected Prediction Response Format**
```json
{
  "student_id": "STU001",
  "risk_category": "High Risk",
  "confidence_score": 0.87,
  "contributing_factors": {
    "attendance_pct": {
      "contribution_pct": 55,
      "impact": "negative",
      "message": "Low attendance is increasing risk"
    },
    "internal_marks": {
      "contribution_pct": 35,
      "impact": "negative",
      "message": "Below average marks"
    },
    "cp_ncp": {
      "contribution_pct": 10,
      "impact": "positive",
      "message": "CP status is good"
    }
  },
  "recommendations": [
    {
      "priority": "High",
      "category": "Attendance",
      "message": "Improve attendance immediately"
    }
  ],
  "predicted_at": "2024-01-10T10:00:00.000Z"
}
```

Note: `risk_category` must be exactly one of: `Low Risk`, `Moderate Risk`, `High Risk`

---

### For Person 4 (AI Assistant Developer)

The frontend expects your AI Assistant API to have:

**Query Endpoint**
```
POST   /ai/query
Body: { query: "Show me high risk students in CSE" }
```

**Expected Response Format**
```json
{
  "answer": "Found 3 high risk students in CSE department..."
}
```

The AI Assistant should handle natural language queries like:
- "Show high risk students"
- "Students with low attendance"
- "List NCP students"
- "Semester 3 students"
- "CSE department summary"

---

## Where to Edit for Integration

All mock data is inside `src/api/` folder. Each file has a clear pattern:

```js
export const someFunction = async () => {
  // REAL API - Uncomment when backend is ready
  // const data = await axiosInstance.post('/endpoint', ...)
  // return data

  // MOCK - Remove when backend is ready
  return mockData
}
```

**When your part is ready:**
1. Open the relevant API file
2. Uncomment the REAL API lines
3. Delete the MOCK code below it
4. Test in browser

**Files to update by phase:**

| Phase | Files to Change |
|-------|----------------|
| Backend ready | `src/api/auth.api.js`, `src/api/student.api.js`, `src/api/dashboard.api.js`, `.env` |
| ML Service ready | `src/api/prediction.api.js`, `.env` |
| AI Assistant ready | `src/pages/faculty/AIAssistant.jsx`, `.env` |

---

## Testing Checklist

Before integration test these features:

- [ ] Login with all 3 demo accounts works
- [ ] Sidebar shows correct menu based on role
- [ ] Student dashboard loads with data
- [ ] Faculty dashboard shows charts and student list
- [ ] Admin dashboard shows department summary
- [ ] Search and filter works on student list
- [ ] Prediction form generates result
- [ ] AI assistant responds to queries
- [ ] Recommendations display correctly
- [ ] Reports page shows department and semester tabs
- [ ] Logout works and redirects to login
- [ ] Protected routes redirect unauthorized users

---

## UI Design Notes

The UI follows these design principles:

- Light theme with white backgrounds
- Blue as primary accent color (`#3b82f6`)
- Emerald green for Low Risk, Amber for Moderate Risk, Red for High Risk
- Soft shadows and clean borders
- Inter font family
- Rounded corners (rounded-xl and rounded-2xl)
- Subtle gradients for buttons and highlights
- Responsive breakpoints: sm, md, lg, xl

---

## Coordination Points

- Get exact backend URL from Person 2 → update `.env`
- Get sample API responses from Person 2 before integration
- Get ML API URL from Person 1 → update `.env`
- Confirm prediction response format with Person 1
- Confirm recommendation format with Person 4
- Test all integrations one at a time not all together

---

## Git Workflow

```bash
# Start working
git checkout feature/frontend
git pull origin feature/frontend

# After making changes
git add .
git commit -m "Add: [describe your change]"
git push origin feature/frontend
```

Raise a Pull Request to merge into `dev` branch when features are complete.

---

## Known Issues and TODOs

- Notifications badge shows static count (needs backend integration)
- Search in Navbar is UI only (needs implementation)
- Export Report button on admin page is UI only
- Delete Student action needs backend confirmation
- Prediction history is empty (needs backend endpoint)

---

## Contact

Vashisht — Frontend Developer
For any UI or integration questions raise an issue on GitHub
or discuss on the team group.