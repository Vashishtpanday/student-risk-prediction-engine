import axiosInstance from './axiosInstance'
import { getAllStudents } from './student.api'

const getRisk = (s) =>
  String(s.latestRiskLevel || s.risk_category || s.riskCategory || s.risk || '').toLowerCase()

const isHigh = (s) => getRisk(s).includes('high')
const isModerate = (s) => {
  const r = getRisk(s)
  return r.includes('mod') || r.includes('med')
}
const isLow = (s) => getRisk(s).includes('low')

const buildDepartmentReport = (students = []) => {
  const map = {}

  students.forEach((s) => {
    const dept = String(s.department || 'Unknown').trim().toUpperCase() || 'UNKNOWN'
    if (!map[dept]) map[dept] = { total: 0, high: 0, moderate: 0, low: 0 }

    map[dept].total += 1
    if (isHigh(s)) map[dept].high += 1
    else if (isModerate(s)) map[dept].moderate += 1
    else map[dept].low += 1
  })

  return map
}

const buildSemesterReport = (students = []) => {
  const map = {}

  students.forEach((s) => {
    const semNum = Number(s.semester || 0)
    const key = semNum > 0 ? `Semester ${semNum}` : 'Semester Unknown'
    if (!map[key]) map[key] = { total: 0, high: 0, moderate: 0, low: 0, sem: semNum || 999 }

    map[key].total += 1
    if (isHigh(s)) map[key].high += 1
    else if (isModerate(s)) map[key].moderate += 1
    else map[key].low += 1
  })

  // sort by semester number
  return Object.fromEntries(
    Object.entries(map).sort((a, b) => (a[1].sem || 999) - (b[1].sem || 999))
  )
}

export const getDashboardStats = async () => {
  try {
    const response = await axiosInstance.get('/dashboard/stats')
    const raw = response?.data?.data || response?.data || response || {}

    const total = raw.total ?? raw.totalStudents
    if (total !== undefined && Number(total) > 0) {
      return {
        total: Number(total) || 0,
        high: Number(raw.high ?? raw.highRisk ?? raw.highRiskCount ?? 0),
        moderate: Number(raw.moderate ?? raw.moderateRisk ?? raw.moderateRiskCount ?? 0),
        low: Number(raw.low ?? raw.lowRisk ?? raw.lowRiskCount ?? 0),
        avgAttendance: raw.avgAttendance ?? raw.averageAttendance ?? 0,
        avgMarks: raw.avgMarks ?? raw.averageMarks ?? 0,
      }
    }
  } catch (e) {
    // fall through to local compute
  }

  const students = await getAllStudents()
  const total = students.length
  const high = students.filter(isHigh).length
  const moderate = students.filter(isModerate).length
  const low = students.filter(isLow).length

  return {
    total,
    high,
    moderate,
    low,
    avgAttendance: 0,
    avgMarks: 0,
  }
}

export const getHighRiskStudents = async () => {
  try {
    const response = await axiosInstance.get('/dashboard/risky')
    const list = response?.data?.data || response?.data || response || []
    if (Array.isArray(list) && list.length > 0) return list
  } catch (e) {
    // fall through
  }

  const students = await getAllStudents()
  return students.filter(isHigh)
}

export const getDepartmentReport = async () => {
  // Always compute from full student list for consistent department names
  // (backend sometimes returns indexed keys like 0,1,2)
  try {
    const response = await axiosInstance.get('/reports/department')
    const raw = response?.data?.data || response?.data || response || {}

    // If backend already returns named departments, use it
    const keys = Object.keys(raw || {})
    const looksNamed = keys.some((k) => /[A-Za-z]/.test(k) && !/^\d+$/.test(k))
    if (looksNamed && keys.length > 0) {
      // normalize shape
      const normalized = {}
      keys.forEach((k) => {
        const item = raw[k] || {}
        normalized[String(k).toUpperCase()] = {
          total: Number(item.total || 0),
          high: Number(item.high || item.highRisk || 0),
          moderate: Number(item.moderate || item.moderateRisk || 0),
          low: Number(item.low || item.lowRisk || 0),
        }
      })
      return normalized
    }
  } catch (e) {
    // ignore and compute locally
  }

  const students = await getAllStudents()
  return buildDepartmentReport(students)
}

export const getSemesterReport = async () => {
  // Always prefer local compute so labels become "Semester 1", "Semester 2"...
  try {
    const response = await axiosInstance.get('/reports/semester')
    const raw = response?.data?.data || response?.data || response || {}

    const keys = Object.keys(raw || {})
    const looksGood = keys.some((k) => /sem/i.test(String(k)))
    if (looksGood && keys.length > 0) {
      const normalized = {}
      keys.forEach((k) => {
        const item = raw[k] || {}
        let label = String(k)
        if (/^\d+$/.test(label)) label = `Semester ${label}`
        if (!/^semester/i.test(label) && /\d+/.test(label)) {
          const num = label.match(/\d+/)?.[0]
          label = `Semester ${num}`
        }
        normalized[label] = {
          total: Number(item.total || 0),
          high: Number(item.high || item.highRisk || 0),
          moderate: Number(item.moderate || item.moderateRisk || 0),
          low: Number(item.low || item.lowRisk || 0),
          sem: Number(String(label).match(/\d+/)?.[0] || 999),
        }
      })

      return Object.fromEntries(
        Object.entries(normalized).sort((a, b) => (a[1].sem || 999) - (b[1].sem || 999))
      )
    }
  } catch (e) {
    // ignore
  }

  const students = await getAllStudents()
  return buildSemesterReport(students)
}