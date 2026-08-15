export const RISK_LEVELS = {
  LOW: 'Low Risk',
  MODERATE: 'Moderate Risk',
  HIGH: 'High Risk',
}

export const RISK_COLORS = {
  'Low Risk': {
    bg: 'bg-emerald-50',
    text: 'text-emerald-700',
    border: 'border-emerald-200',
    dot: 'bg-emerald-500',
    hex: '#10b981',
  },
  'Moderate Risk': {
    bg: 'bg-amber-50',
    text: 'text-amber-700',
    border: 'border-amber-200',
    dot: 'bg-amber-500',
    hex: '#f59e0b',
  },
  'High Risk': {
    bg: 'bg-red-50',
    text: 'text-red-700',
    border: 'border-red-200',
    dot: 'bg-red-500',
    hex: '#ef4444',
  },
}

export const DEPARTMENTS = ['CSE', 'ECE', 'MECH', 'CIVIL', 'EEE', 'IT']

export const SEMESTERS = [1, 2, 3, 4, 5, 6, 7, 8]

export const CP_NCP_OPTIONS = [
  { value: 'CP', label: 'CP — Credit Pass' },
  { value: 'NCP', label: 'NCP — No Credit Pass' },
]