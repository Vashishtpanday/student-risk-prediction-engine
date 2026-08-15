import { RISK_COLORS } from '../constants/riskLevels'

export const getRiskColor = (riskCategory) => {
  return RISK_COLORS[riskCategory] || RISK_COLORS['Low Risk']
}

export const getRiskScore = (riskCategory) => {
  const scores = {
    'Low Risk': 20,
    'Moderate Risk': 60,
    'High Risk': 90,
  }
  return scores[riskCategory] || 0
}

export const getAttendanceColor = (pct) => {
  if (pct < 60) return 'text-red-600'
  if (pct < 75) return 'text-amber-600'
  return 'text-emerald-600'
}

export const getMarksColor = (marks) => {
  if (marks < 40) return 'text-red-600'
  if (marks < 60) return 'text-amber-600'
  return 'text-emerald-600'
}