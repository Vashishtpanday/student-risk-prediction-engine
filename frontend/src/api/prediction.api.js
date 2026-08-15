import axiosInstance from './axiosInstance'

// =============================================
// MOCK PREDICTION LOGIC
// EDIT: Remove this entire mock section when
// Person 1 gives ML service and
// Person 2 gives backend /predict endpoint
// =============================================
const generateMockPrediction = (data) => {
  let risk = 'Low Risk'
  let score = 0.93

  const attendanceLow = parseFloat(data.attendance_pct) < 75
  const marksLow = parseFloat(data.internal_marks) < 50
  const isNCP = data.cp_ncp === 'NCP'
  const hasBacklogs = parseInt(data.previous_backlogs) > 0

  if (parseFloat(data.attendance_pct) < 60 || parseFloat(data.internal_marks) < 35) {
    risk = 'High Risk'
    score = 0.85 + Math.random() * 0.12
  } else if (attendanceLow || marksLow) {
    risk = 'Moderate Risk'
    score = 0.65 + Math.random() * 0.15
  }

  if (isNCP && risk === 'Low Risk') {
    risk = 'Moderate Risk'
    score = 0.62
  }

  if (hasBacklogs && parseInt(data.previous_backlogs) > 2 && risk !== 'High Risk') {
    risk = 'High Risk'
    score = 0.82
  }

  const attendancePct = parseFloat(data.attendance_pct)
  const marksPct = parseFloat(data.internal_marks)
  const ncpImpact = isNCP ? 15 : 5

  const total = Math.abs(100 - attendancePct) + Math.abs(100 - marksPct) + ncpImpact
  const attendanceContrib = Math.round((Math.abs(100 - attendancePct) / total) * 100)
  const marksContrib = Math.round((Math.abs(100 - marksPct) / total) * 100)
  const ncpContrib = 100 - attendanceContrib - marksContrib

  const recommendations = []

  if (attendancePct < 60) {
    recommendations.push({ priority: 'High', category: 'Attendance', message: 'Attendance is critically low. Attend all remaining classes immediately to avoid debarment.' })
  } else if (attendancePct < 75) {
    recommendations.push({ priority: 'High', category: 'Attendance', message: 'Attendance is below the required 75%. Improve attendance to avoid losing eligibility for exams.' })
  }

  if (marksPct < 40) {
    recommendations.push({ priority: 'High', category: 'Assessment', message: 'Internal marks are very low. Focus on assignments, practicals, and internal exam preparation.' })
  } else if (marksPct < 60) {
    recommendations.push({ priority: 'Medium', category: 'Assessment', message: 'Marks are average. Aim for improvement in upcoming internal assessments.' })
  }

  if (isNCP) {
    recommendations.push({ priority: 'Medium', category: 'CP/NCP Status', message: 'NCP status detected. Attend remedial classes and consult your faculty advisor immediately.' })
  }

  if (parseInt(data.previous_backlogs) > 2) {
    recommendations.push({ priority: 'High', category: 'Backlogs', message: 'Multiple previous backlogs detected. Academic counselling is strongly recommended.' })
  }

  if (risk === 'High Risk') {
    recommendations.push({ priority: 'High', category: 'Intervention', message: 'Immediate faculty intervention is recommended. Please schedule a counselling session.' })
  }

  return {
    student_id: data.student_id,
    risk_category: risk,
    confidence_score: parseFloat(score.toFixed(2)),
    contributing_factors: {
      attendance_pct: {
        contribution_pct: attendanceContrib,
        impact: attendancePct < 75 ? 'negative' : 'positive',
        message: attendancePct < 75 ? 'Low attendance is increasing risk' : 'Good attendance is reducing risk',
      },
      internal_marks: {
        contribution_pct: marksContrib,
        impact: marksPct < 50 ? 'negative' : 'positive',
        message: marksPct < 50 ? 'Below average marks are increasing risk' : 'Good marks are reducing risk',
      },
      cp_ncp: {
        contribution_pct: ncpContrib,
        impact: isNCP ? 'negative' : 'positive',
        message: isNCP ? 'NCP status is adding to academic risk' : 'CP status is helping reduce risk',
      },
    },
    recommendations,
    predicted_at: new Date().toISOString(),
  }
}

export const predictStudent = async (studentData) => {
  // =============================================
  // REAL API - Uncomment when Person 1 and Person 2 give their code
  // =============================================
  // const data = await axiosInstance.post('/predict', studentData)
  // return data

  // MOCK - Remove when backend is ready
  await new Promise((r) => setTimeout(r, 1000))
  return generateMockPrediction(studentData)
}

export const batchPredict = async (studentsArray) => {
  // REAL API - Uncomment when Person 1 and Person 2 give their code
  // const data = await axiosInstance.post('/predict/batch', { students: studentsArray })
  // return data

  // MOCK - Remove when backend is ready
  await new Promise((r) => setTimeout(r, 1500))
  return studentsArray.map((s) => generateMockPrediction(s))
}

export const getPredictionHistory = async (studentId) => {
  // REAL API - Uncomment when Person 2 gives backend
  // const data = await axiosInstance.get(`/predict/${studentId}`)
  // return data

  // MOCK - Remove when backend is ready
  return []
}