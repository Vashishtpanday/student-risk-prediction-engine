import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Loader from '../components/common/Loader'

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth()

  if (loading) return <Loader />
  if (!user) return <Navigate to="/login" replace />
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />
  }
  return children
}

export default ProtectedRoute