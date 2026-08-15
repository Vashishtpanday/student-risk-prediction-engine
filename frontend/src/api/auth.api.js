import axiosInstance from './axiosInstance'

// =============================================
// MOCK DATA
// EDIT: Remove MOCK_USERS and mock logic
// when Person 2 gives the backend
// =============================================
const MOCK_USERS = [
  {
    _id: '1',
    name: 'Dr. Ramesh Kumar',
    email: 'faculty@college.edu',
    role: 'faculty',
    department: 'CSE',
    avatar: 'R',
  },
  {
    _id: '2',
    name: 'Arjun Sharma',
    email: 'student@college.edu',
    role: 'student',
    department: 'CSE',
    semester: 3,
    student_id: 'STU001',
    avatar: 'A',
  },
  {
    _id: '3',
    name: 'Admin User',
    email: 'admin@college.edu',
    role: 'admin',
    department: 'Administration',
    avatar: 'AD',
  },
]

export const loginUser = async (email, password) => {
  // =============================================
  // MOCK - Remove when backend is ready
  // =============================================
  await new Promise((r) => setTimeout(r, 800))
  const user = MOCK_USERS.find((u) => u.email === email.trim().toLowerCase())
  if (user && password === 'password123') {
    return { user, token: `mock-jwt-${user.role}-token-${Date.now()}` }
  }
  throw new Error('Invalid email or password')

  // =============================================
  // REAL API - Uncomment when Person 2 gives backend
  // =============================================
  // const data = await axiosInstance.post('/auth/login', { email, password })
  // return data
}

export const registerUser = async (userData) => {
  // REAL API - Uncomment when Person 2 gives backend
  // const data = await axiosInstance.post('/auth/register', userData)
  // return data
  throw new Error('Registration not available in demo mode')
}

export const getCurrentUser = async () => {
  // REAL API - Uncomment when Person 2 gives backend
  // const data = await axiosInstance.get('/auth/me')
  // return data
}

export const logoutUser = async () => {
  // REAL API - Uncomment when Person 2 gives backend
  // await axiosInstance.post('/auth/logout')
  localStorage.removeItem('srpe_token')
  localStorage.removeItem('srpe_user')
}