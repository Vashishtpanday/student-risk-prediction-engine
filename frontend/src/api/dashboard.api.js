import axiosInstance from './axiosInstance'
import { MOCK_STUDENTS } from './student.api'

export const getDashboardStats = async () => {
  // REAL API - Uncomment when Person 2 gives backend
  // const data = await axiosInstance.get('/dashboard/stats')
  // return data

  // MOCK - Remove when backend is ready
  await new Promise((r) => setTimeout(r, 400))
  const total = MOCK_STUDENTS.length
  const high = MOCK_STUDENTS.filter((s) => s.risk_category === 'High Risk').length
  const moderate = MOCK_STUDENTS.filter((s) => s.risk_category === 'Moderate Risk').length
  const low = MOCK_STUDENTS.filter((s) => s.risk_category === 'Low Risk').length
  const avgAttendance = (MOCK_STUDENTS.reduce((a, s) => a + s.attendance_pct, 0) / total).toFixed(1)
  const avgMarks = (MOCK_STUDENTS.reduce((a, s) => a + s.internal_marks, 0) / total).toFixed(1)
  return { total, high, moderate, low, avgAttendance, avgMarks }
}

export const getHighRiskStudents = async () => {
  // REAL API - Uncomment when Person 2 gives backend
  // const data = await axiosInstance.get('/dashboard/risky')
  // return data

  // MOCK - Remove when backend is ready
  await new Promise((r) => setTimeout(r, 300))
  return MOCK_STUDENTS.filter((s) => s.risk_category === 'High Risk')
}

export const getDepartmentReport = async () => {
  // REAL API - Uncomment when Person 2 gives backend
  // const data = await axiosInstance.get('/reports/department')
  // return data

  // MOCK - Remove when backend is ready
  await new Promise((r) => setTimeout(r, 300))
  const deptMap = {}
  MOCK_STUDENTS.forEach((s) => {
    if (!deptMap[s.department]) {
      deptMap[s.department] = { total: 0, high: 0, moderate: 0, low: 0 }
    }
    deptMap[s.department].total++
    if (s.risk_category === 'High Risk') deptMap[s.department].high++
    else if (s.risk_category === 'Moderate Risk') deptMap[s.department].moderate++
    else deptMap[s.department].low++
  })
  return deptMap
}

export const getSemesterReport = async () => {
  // REAL API - Uncomment when Person 2 gives backend
  // const data = await axiosInstance.get('/reports/semester')
  // return data

  // MOCK - Remove when backend is ready
  await new Promise((r) => setTimeout(r, 300))
  const semMap = {}
  MOCK_STUDENTS.forEach((s) => {
    const key = `Sem ${s.semester}`
    if (!semMap[key]) semMap[key] = { total: 0, high: 0, moderate: 0, low: 0 }
    semMap[key].total++
    if (s.risk_category === 'High Risk') semMap[key].high++
    else if (s.risk_category === 'Moderate Risk') semMap[key].moderate++
    else semMap[key].low++
  })
  return semMap
}