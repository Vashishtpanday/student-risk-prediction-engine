export const validateEmail = (email) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

export const validatePassword = (password) => {
  return password.length >= 6
}

export const validateAttendance = (value) => {
  const num = parseFloat(value)
  return !isNaN(num) && num >= 0 && num <= 100
}

export const validateMarks = (value) => {
  const num = parseFloat(value)
  return !isNaN(num) && num >= 0 && num <= 100
}

export const validateSemester = (value) => {
  const num = parseInt(value)
  return !isNaN(num) && num >= 1 && num <= 8
}

export const validateStudentId = (id) => {
  return id && id.trim().length >= 3
}