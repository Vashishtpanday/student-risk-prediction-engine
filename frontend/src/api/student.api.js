import axiosInstance from './axiosInstance'

// =============================================
// MOCK DATA
// EDIT: Remove MOCK_STUDENTS when Person 2
// gives the backend and Person 4 gives dataset
// =============================================
export const MOCK_STUDENTS = [
  {
    _id: '1',
    student_id: 'STU001',
    name: 'Arjun Sharma',
    email: 'arjun@college.edu',
    department: 'CSE',
    semester: 3,
    attendance_pct: 58,
    internal_marks: 32,
    cp_ncp: 'NCP',
    previous_backlogs: 2,
    risk_category: 'High Risk',
    confidence_score: 0.89,
    createdAt: '2024-01-10T10:00:00.000Z',
  },
  {
    _id: '2',
    student_id: 'STU002',
    name: 'Priya Menon',
    email: 'priya@college.edu',
    department: 'CSE',
    semester: 3,
    attendance_pct: 82,
    internal_marks: 67,
    cp_ncp: 'CP',
    previous_backlogs: 0,
    risk_category: 'Low Risk',
    confidence_score: 0.92,
    createdAt: '2024-01-10T10:00:00.000Z',
  },
  {
    _id: '3',
    student_id: 'STU003',
    name: 'Rahul Nair',
    email: 'rahul@college.edu',
    department: 'ECE',
    semester: 5,
    attendance_pct: 71,
    internal_marks: 48,
    cp_ncp: 'CP',
    previous_backlogs: 1,
    risk_category: 'Moderate Risk',
    confidence_score: 0.75,
    createdAt: '2024-01-10T10:00:00.000Z',
  },
  {
    _id: '4',
    student_id: 'STU004',
    name: 'Sneha Pillai',
    email: 'sneha@college.edu',
    department: 'MECH',
    semester: 4,
    attendance_pct: 45,
    internal_marks: 28,
    cp_ncp: 'NCP',
    previous_backlogs: 3,
    risk_category: 'High Risk',
    confidence_score: 0.95,
    createdAt: '2024-01-10T10:00:00.000Z',
  },
  {
    _id: '5',
    student_id: 'STU005',
    name: 'Aditya Verma',
    email: 'aditya@college.edu',
    department: 'CSE',
    semester: 2,
    attendance_pct: 91,
    internal_marks: 85,
    cp_ncp: 'CP',
    previous_backlogs: 0,
    risk_category: 'Low Risk',
    confidence_score: 0.97,
    createdAt: '2024-01-10T10:00:00.000Z',
  },
  {
    _id: '6',
    student_id: 'STU006',
    name: 'Kavya Reddy',
    email: 'kavya@college.edu',
    department: 'ECE',
    semester: 6,
    attendance_pct: 68,
    internal_marks: 52,
    cp_ncp: 'CP',
    previous_backlogs: 1,
    risk_category: 'Moderate Risk',
    confidence_score: 0.71,
    createdAt: '2024-01-10T10:00:00.000Z',
  },
  {
    _id: '7',
    student_id: 'STU007',
    name: 'Rohan Das',
    email: 'rohan@college.edu',
    department: 'MECH',
    semester: 3,
    attendance_pct: 55,
    internal_marks: 35,
    cp_ncp: 'NCP',
    previous_backlogs: 2,
    risk_category: 'High Risk',
    confidence_score: 0.88,
    createdAt: '2024-01-10T10:00:00.000Z',
  },
  {
    _id: '8',
    student_id: 'STU008',
    name: 'Divya Singh',
    email: 'divya@college.edu',
    department: 'CSE',
    semester: 7,
    attendance_pct: 88,
    internal_marks: 79,
    cp_ncp: 'CP',
    previous_backlogs: 0,
    risk_category: 'Low Risk',
    confidence_score: 0.94,
    createdAt: '2024-01-10T10:00:00.000Z',
  },
  {
    _id: '9',
    student_id: 'STU009',
    name: 'Kiran Babu',
    email: 'kiran@college.edu',
    department: 'EEE',
    semester: 4,
    attendance_pct: 63,
    internal_marks: 44,
    cp_ncp: 'CP',
    previous_backlogs: 1,
    risk_category: 'Moderate Risk',
    confidence_score: 0.68,
    createdAt: '2024-01-10T10:00:00.000Z',
  },
  {
    _id: '10',
    student_id: 'STU010',
    name: 'Anjali Nambiar',
    email: 'anjali@college.edu',
    department: 'IT',
    semester: 5,
    attendance_pct: 42,
    internal_marks: 25,
    cp_ncp: 'NCP',
    previous_backlogs: 4,
    risk_category: 'High Risk',
    confidence_score: 0.98,
    createdAt: '2024-01-10T10:00:00.000Z',
  },
]

export const getAllStudents = async () => {
  // =============================================
  // REAL API - Uncomment when Person 2 gives backend
  // =============================================
  // const data = await axiosInstance.get('/students')
  // return data

  // MOCK - Remove when backend is ready
  await new Promise((r) => setTimeout(r, 500))
  return MOCK_STUDENTS
}

export const getStudentById = async (id) => {
  // REAL API - Uncomment when Person 2 gives backend
  // const data = await axiosInstance.get(`/students/${id}`)
  // return data

  // MOCK - Remove when backend is ready
  await new Promise((r) => setTimeout(r, 300))
  return MOCK_STUDENTS.find((s) => s._id === id) || null
}

export const addStudent = async (studentData) => {
  // REAL API - Uncomment when Person 2 gives backend
  // const data = await axiosInstance.post('/students', studentData)
  // return data

  // MOCK - Remove when backend is ready
  await new Promise((r) => setTimeout(r, 500))
  return { ...studentData, _id: Date.now().toString(), createdAt: new Date().toISOString() }
}

export const updateStudent = async (id, studentData) => {
  // REAL API - Uncomment when Person 2 gives backend
  // const data = await axiosInstance.put(`/students/${id}`, studentData)
  // return data

  // MOCK - Remove when backend is ready
  await new Promise((r) => setTimeout(r, 500))
  return { ...studentData, _id: id }
}

export const deleteStudent = async (id) => {
  // REAL API - Uncomment when Person 2 gives backend
  // const data = await axiosInstance.delete(`/students/${id}`)
  // return data

  // MOCK - Remove when backend is ready
  await new Promise((r) => setTimeout(r, 300))
  return { message: 'Student deleted successfully' }
}

export const getStudentHistory = async (id) => {
  // REAL API - Uncomment when Person 2 gives backend
  // const data = await axiosInstance.get(`/students/${id}/history`)
  // return data

  // MOCK - Remove when backend is ready
  await new Promise((r) => setTimeout(r, 300))
  return []
}