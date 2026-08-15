import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Loader from '../components/common/Loader'

import LoginPage from '../pages/auth/LoginPage'
import StudentDashboard from '../pages/student/StudentDashboard'
import MyPrediction from '../pages/student/MyPrediction'
import MyRecommendations from '../pages/student/MyRecommendations'
import FacultyDashboard from '../pages/faculty/FacultyDashboard'
import StudentList from '../pages/faculty/StudentList'
import StudentDetail from '../pages/faculty/StudentDetail'
import PredictStudent from '../pages/faculty/PredictStudent'
import AIAssistant from '../pages/faculty/AIAssistant'
import AdminDashboard from '../pages/admin/AdminDashboard'
import ReportPage from '../pages/admin/ReportPage'
import ManageUsers from '../pages/admin/ManageUsers'
import NotFoundPage from '../pages/common/NotFoundPage'
import UnauthorizedPage from '../pages/common/UnauthorizedPage'
import ProtectedRoute from './ProtectedRoute'

const RoleRedirect = () => {
  const { user, loading } = useAuth()
  if (loading) return <Loader />
  if (!user) return <Navigate to="/login" replace />
  if (user.role === 'student') return <Navigate to="/student/dashboard" replace />
  if (user.role === 'faculty') return <Navigate to="/faculty/dashboard" replace />
  if (user.role === 'admin') return <Navigate to="/admin/dashboard" replace />
  return <Navigate to="/login" replace />
}

const AppRouter = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<RoleRedirect />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/unauthorized" element={<UnauthorizedPage />} />

        <Route path="/student/dashboard" element={<ProtectedRoute allowedRoles={['student']}><StudentDashboard /></ProtectedRoute>} />
        <Route path="/student/prediction" element={<ProtectedRoute allowedRoles={['student']}><MyPrediction /></ProtectedRoute>} />
        <Route path="/student/recommendations" element={<ProtectedRoute allowedRoles={['student']}><MyRecommendations /></ProtectedRoute>} />

        <Route path="/faculty/dashboard" element={<ProtectedRoute allowedRoles={['faculty']}><FacultyDashboard /></ProtectedRoute>} />
        <Route path="/faculty/students" element={<ProtectedRoute allowedRoles={['faculty']}><StudentList /></ProtectedRoute>} />
        <Route path="/faculty/students/:id" element={<ProtectedRoute allowedRoles={['faculty']}><StudentDetail /></ProtectedRoute>} />
        <Route path="/faculty/predict" element={<ProtectedRoute allowedRoles={['faculty']}><PredictStudent /></ProtectedRoute>} />
        <Route path="/faculty/assistant" element={<ProtectedRoute allowedRoles={['faculty']}><AIAssistant /></ProtectedRoute>} />

        <Route path="/admin/dashboard" element={<ProtectedRoute allowedRoles={['admin']}><AdminDashboard /></ProtectedRoute>} />
        <Route path="/admin/reports" element={<ProtectedRoute allowedRoles={['admin']}><ReportPage /></ProtectedRoute>} />
        <Route path="/admin/users" element={<ProtectedRoute allowedRoles={['admin']}><ManageUsers /></ProtectedRoute>} />

        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  )
}

export default AppRouter