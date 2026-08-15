import { CheckCircle, AlertTriangle, XCircle, Info, X } from 'lucide-react'
import clsx from 'clsx'
import { useState } from 'react'

const types = {
  success: { icon: CheckCircle, color: 'text-emerald-700 bg-emerald-50 border-emerald-200' },
  warning: { icon: AlertTriangle, color: 'text-amber-700 bg-amber-50 border-amber-200' },
  error: { icon: XCircle, color: 'text-red-700 bg-red-50 border-red-200' },
  info: { icon: Info, color: 'text-blue-700 bg-blue-50 border-blue-200' },
}

const Alert = ({ type = 'info', title, message, dismissible = true }) => {
  const [visible, setVisible] = useState(true)
  if (!visible) return null
  const { icon: Icon, color } = types[type]

  return (
    <div className={clsx('flex items-start gap-3 p-4 rounded-xl border animate-fade-in', color)}>
      <Icon className="w-5 h-5 shrink-0 mt-0.5" />
      <div className="flex-1 min-w-0">
        {title && <p className="text-sm font-semibold mb-0.5">{title}</p>}
        {message && <p className="text-sm opacity-80">{message}</p>}
      </div>
      {dismissible && (
        <button onClick={() => setVisible(false)} className="shrink-0 opacity-70 hover:opacity-100 transition-opacity">
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  )
}

export default Alert