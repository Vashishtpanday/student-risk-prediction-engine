import { RISK_COLORS } from '../constants/riskLevels'

export const normalizeRiskLabel = (risk) => {
  if (!risk) return 'Low Risk'
  const r = String(risk).toLowerCase().trim()

  if (r.includes('high') || r === '2' || r === 'danger' || r === 'severe') return 'High Risk'
  if (r.includes('mod') || r.includes('med') || r === '1' || r === 'warn') return 'Moderate Risk'
  if (r.includes('low') || r === '0' || r === 'safe' || r === 'good') return 'Low Risk'

  return 'Low Risk'
}

export const getRiskColor = (riskCategory) => {
  const normalized = normalizeRiskLabel(riskCategory)
  return RISK_COLORS[normalized] || RISK_COLORS['Low Risk']
}

export const getRiskScore = (riskCategory) => {
  const normalized = normalizeRiskLabel(riskCategory)
  const scores = {
    'Low Risk': 20,
    'Moderate Risk': 60,
    'High Risk': 90,
  }
  return scores[normalized] || 0
}

export const getAttendanceColor = (pct) => {
  const value = Number(pct)
  if (value < 60) return 'text-red-600'
  if (value < 75) return 'text-amber-600'
  return 'text-emerald-600'
}

export const getMarksColor = (marks) => {
  const value = Number(marks)
  if (value < 40) return 'text-red-600'
  if (value < 60) return 'text-amber-600'
  return 'text-emerald-600'
}