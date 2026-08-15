import { AlertTriangle, Info, CheckCircle } from 'lucide-react'
import clsx from 'clsx'

const iconMap = {
  High: AlertTriangle,
  Medium: Info,
  Low: CheckCircle,
}

const colorMap = {
  High: 'text-red-700 bg-red-50 border-red-200',
  Medium: 'text-amber-700 bg-amber-50 border-amber-200',
  Low: 'text-emerald-700 bg-emerald-50 border-emerald-200',
}

const RecommendationCard = ({ recommendation }) => {
  const { priority, category, message } = recommendation
  const Icon = iconMap[priority] || Info

  return (
    <div className={clsx('flex gap-4 p-4 rounded-xl border transition-all duration-200 hover:scale-[1.01] hover:shadow-md', colorMap[priority])}>
      <div className={clsx('w-10 h-10 rounded-xl flex items-center justify-center shrink-0', colorMap[priority])}>
        <Icon className="w-5 h-5" />
      </div>
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-1">
          <p className="text-sm font-semibold text-slate-900">{category}</p>
          <span className={clsx('text-xs px-2 py-0.5 rounded-md font-medium border', colorMap[priority])}>
            {priority} Priority
          </span>
        </div>
        <p className="text-sm text-slate-700 leading-relaxed">{message}</p>
      </div>
    </div>
  )
}

export default RecommendationCard