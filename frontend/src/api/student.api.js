import axiosInstance from './axiosInstance'

const extractList = (response) => {
  const resData = response?.data || response
  if (Array.isArray(resData)) return resData
  if (Array.isArray(resData?.data)) return resData.data
  if (Array.isArray(resData?.students)) return resData.students
  if (resData?.data && Array.isArray(resData.data.students)) return resData.data.students
  if (resData?.data && Array.isArray(resData.data.data)) return resData.data.data
  return []
}

export const getAllStudents = async () => {
  // Plain GET request - bypasses query parameter validators while controller defaults to 5000
  const response = await axiosInstance.get('/students')
  return extractList(response)
}

export const getStudentById = async (id) => {
  const response = await axiosInstance.get(`/students/${id}`)
  const data = response.data || response
  return data.student || data.data?.student || data.data || data
}

export const addStudent = async (studentData) => {
  const response = await axiosInstance.post('/students', studentData)
  const data = response.data || response
  return data.student || data.data?.student || data.data || data
}

export const updateStudent = async (id, studentData) => {
  const response = await axiosInstance.put(`/students/${id}`, studentData)
  const data = response.data || response
  return data.student || data.data?.student || data.data || data
}

export const deleteStudent = async (id) => {
  const response = await axiosInstance.delete(`/students/${id}?permanent=true`)
  return response.data || response
}

export const getStudentHistory = async (id) => {
  const response = await axiosInstance.get(`/students/${id}/history`)
  const data = response.data || response
  return data.history || data.data || []
}

export default {
  getAllStudents,
  getStudentById,
  addStudent,
  updateStudent,
  deleteStudent,
  getStudentHistory,
}