// EDIT THIS FILE WHEN YOU GET REAL URLS FROM OTHER TEAM MEMBERS
// Person 2 gives backend URL → change VITE_API_BASE_URL in .env file
// Person 1 gives ML URL → change VITE_ML_SERVICE_URL in .env file
// Person 4 gives AI URL → change VITE_AI_ASSISTANT_URL in .env file

export const BASE_URL = import.meta.env.VITE_API_BASE_URL
export const ML_URL = import.meta.env.VITE_ML_SERVICE_URL
export const AI_URL = import.meta.env.VITE_AI_ASSISTANT_URL
export const APP_NAME = import.meta.env.VITE_APP_NAME

export const ENDPOINTS = {
  // Auth
  LOGIN: `${BASE_URL}/auth/login`,
  REGISTER: `${BASE_URL}/auth/register`,
  LOGOUT: `${BASE_URL}/auth/logout`,
  ME: `${BASE_URL}/auth/me`,

  // Students
  STUDENTS: `${BASE_URL}/students`,
  STUDENT_BY_ID: (id) => `${BASE_URL}/students/${id}`,
  STUDENT_HISTORY: (id) => `${BASE_URL}/students/${id}/history`,

  // Predictions
  PREDICT: `${BASE_URL}/predict`,
  PREDICT_BATCH: `${BASE_URL}/predict/batch`,
  PREDICTION_BY_STUDENT: (id) => `${BASE_URL}/predict/${id}`,

  // Reports
  REPORTS_DEPARTMENT: `${BASE_URL}/reports/department`,
  REPORTS_SEMESTER: `${BASE_URL}/reports/semester`,
  REPORTS_EXPORT: `${BASE_URL}/reports/export`,

  // Dashboard
  DASHBOARD_STATS: `${BASE_URL}/dashboard/stats`,
  DASHBOARD_RISKY: `${BASE_URL}/dashboard/risky`,

  // ML Service — Person 1
  ML_PREDICT: `${ML_URL}/predict`,
  ML_BATCH_PREDICT: `${ML_URL}/batch-predict`,

  // AI Assistant — Person 4
  AI_QUERY: `${AI_URL}/query`,
}