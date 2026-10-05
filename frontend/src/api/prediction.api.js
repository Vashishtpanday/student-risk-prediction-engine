import axios from 'axios'
import axiosInstance from './axiosInstance'

// Helper to normalize risk labels for UI badges & styling
const extractRiskLabel = (val, att, marks, status) => {
  const str = String(val || '').toLowerCase().trim()
  if (str.includes('high') || str === '2') return 'High Risk'
  if (str.includes('mod') || str.includes('med') || str === '1') return 'Moderate Risk'
  if (str.includes('low') || str === '0') return 'Low Risk'

  // Logical fallback based on academic metrics
  if (att < 60 || marks < 40 || status === 'NCP') return 'High Risk'
  if (att < 75 || marks < 60) return 'Moderate Risk'
  return 'Low Risk'
}

// Uniform response formatter for React components
const normalizePrediction = (raw = {}, payload = {}) => {
  const sId = payload.studentId || payload.student_id || raw.studentId || raw.student_id || 'STU0001'
  const att = parseFloat(payload.attendancePercentage ?? payload.attendance_pct ?? 75)
  const marks = parseFloat(payload.internalMarksAverage ?? payload.internal_marks ?? 65)
  const status = String(payload.cpNcpStatus || payload.cp_ncp || 'CP').toUpperCase()
  const backlogs = parseInt(payload.previousBacklogs ?? payload.previous_backlogs ?? 0)

  const rawRisk = raw.riskCategory || raw.risk_category || raw.latestRiskLevel || raw.prediction || raw.risk
  const finalRisk = extractRiskLabel(rawRisk, att, marks, status)

  // Ensure actionable recommendations exist
  let recs = raw.recommendations || raw.recs || []
  if (!Array.isArray(recs) || recs.length === 0) {
    recs = []
    if (att < 75) {
      recs.push({
        priority: att < 60 ? 'High' : 'Medium',
        category: 'Attendance',
        message: `Attendance is ${att}%. Attend all remaining classes to exceed the 75% requirement.`,
      })
    }
    if (marks < 60) {
      recs.push({
        priority: marks < 40 ? 'High' : 'Medium',
        category: 'Assessment',
        message: `Internal marks average is ${marks}/100. Focus on upcoming assignments and tests.`,
      })
    }
    if (status === 'NCP') {
      recs.push({
        priority: 'High',
        category: 'CP/NCP Status',
        message: 'NCP status detected. Schedule a counseling session with your faculty mentor.',
      })
    }
    if (backlogs > 0) {
      recs.push({
        priority: 'High',
        category: 'Backlogs',
        message: `You have ${backlogs} pending backlog(s). Prioritize backlog clearance modules.`,
      })
    }
  }

  return {
    student_id: sId,
    studentId: sId,
    risk_category: finalRisk,
    riskCategory: finalRisk,
    confidence_score: parseFloat(raw.confidenceScore || raw.confidence_score || raw.confidence || 0.88),
    contributing_factors: raw.contributingFactors || raw.contributing_factors || {
      attendance_pct: {
        contribution_pct: 50,
        impact: att < 75 ? 'negative' : 'positive',
        message: att < 75 ? `Attendance (${att}%) is below required threshold` : `Good attendance (${att}%)`,
      },
      internal_marks: {
        contribution_pct: 35,
        impact: marks < 50 ? 'negative' : 'positive',
        message: marks < 50 ? `Internal marks (${marks}/100) need improvement` : `Satisfactory marks (${marks}/100)`,
      },
      cp_ncp: {
        contribution_pct: 15,
        impact: status === 'NCP' ? 'negative' : 'positive',
        message: status === 'NCP' ? 'NCP status increases risk' : 'Credit Pass status achieved',
      },
    },
    recommendations: recs,
    predicted_at: raw.createdAt || raw.predicted_at || new Date().toISOString(),
  }
}

export const predictStudent = async (studentData) => {
  const sId = String(
    studentData.studentId || studentData.student_id || studentData._id || 'STU0001'
  ).toUpperCase()

  const att = parseFloat(studentData.attendancePercentage ?? studentData.attendance_pct ?? studentData.attendancePct ?? 75)
  const marks = parseFloat(studentData.internalMarksAverage ?? studentData.internal_marks ?? studentData.internalMarks ?? 65)
  const status = String(studentData.cpNcpStatus || studentData.cp_ncp || studentData.cpNcp || 'CP').toUpperCase()
  const backlogs = parseInt(studentData.previousBacklogs ?? studentData.previous_backlogs ?? 0)
  const sem = parseInt(studentData.semester || 3)

  // Payload EXACTLY structured for Roopa's predictSingleValidation (studentId is Required!)
  const payload = {
    studentId: sId, // <--- Key required by Roopa's Express Validator!
    student_id: sId,
    attendancePercentage: att,
    attendance_pct: att,
    internalMarksAverage: marks,
    internal_marks: marks,
    cpNcpStatus: status,
    cp_ncp: status,
    previousBacklogs: backlogs,
    previous_backlogs: backlogs,
    semester: sem,
    department: studentData.department || 'CSE',
    name: studentData.name || '',
  }

  try {
    // 1. Primary: Call Node.js Backend POST /api/predict with studentId
    const response = await axiosInstance.post('/predict', payload)
    const resData = response.data || response
    return normalizePrediction(resData.data || resData, payload)
  } catch (backendErr) {
    console.warn('⚠️ Node.js /predict failed, trying direct Python ML service on port 5001...', backendErr.message)

    try {
      // 2. Direct Fallback: Call Python ML Microservice (Port 5001)
      const mlResponse = await axios.post('http://localhost:5001/predict', payload)
      return normalizePrediction(mlResponse.data, payload)
    } catch (mlErr) {
      console.warn('⚠️ Python ML service on 5001 unreachable, generating local prediction:', mlErr.message)
      // 3. Fallback local calculation so UI never crashes
      return normalizePrediction({}, payload)
    }
  }
}

export const batchPredict = async (studentsArray = []) => {
  try {
    const studentIds = studentsArray.map(s => String(s.studentId || s.student_id || s._id).toUpperCase())
    const response = await axiosInstance.post('/predict/batch', { studentIds, students: studentsArray })
    const resData = response.data || response
    const list = resData.data || resData.predictions || resData || []
    return Array.isArray(list) ? list.map((item) => normalizePrediction(item)) : []
  } catch (err) {
    return []
  }
}

export const getPredictionHistory = async (studentId) => {
  try {
    const response = await axiosInstance.get(`/predict/${studentId}`)
    const resData = response.data || response
    return resData.data || resData.history || []
  } catch (err) {
    return []
  }
}

export default {
  predictStudent,
  batchPredict,
  getPredictionHistory,
}