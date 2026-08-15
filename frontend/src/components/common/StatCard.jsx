import clsx from 'clsx'
import { TrendingUp, TrendingDown } from 'lucide-react'

const colorVariants = {
  indigo: {
    wrapper: 'border-blue-100 bg-gradient-to-br from-blue-50 to-white',
    icon: 'bg-blue-100 text-blue-600',
    text: 'text-blue-600',
  },
  emerald: {
    wrapper: 'border-emerald-100 bg-gradient-to-br from-emerald-50 to-white',
    icon: 'bg-emerald-100 text-emerald-600',
    text: 'text-emerald-600',
  },
  amber: {
    wrapper: 'border-amber-100 bg-gradient-to-br from-amber-50 to-white',
    icon: 'bg-amber-100 text-amber-600',
    text: 'text-amber-600',
  },
  red: {
    wrapper: 'border-red-100 bg-gradient-to-br from-red-50 to-white',
    icon: 'bg-red-100 text-red-600',
    text: 'text-red-600',
  },
  purple: {
    wrapper: 'border-purple-100 bg-gradient-to-br from-purple-50 to-white',
    icon: 'bg-purple-100 text-purple-600',
    text: 'text-purple-600',
  },
}

const StatCard = ({ title, value, icon: Icon, color = 'indigo', subtitle, trend, trendValue }) => {
  const colors = colorVariants[color]
  return (
    <div className={clsx('border rounded-2xl p-5 shadow-sm transition-all duration-200 hover:shadow-md hover:scale-[1.01]', colors.wrapper)}>
      <div className="flex items-start justify-between mb-4">
        <p className="text-sm font-medium text-slate-600 leading-tight">{title}</p>
        <div className={clsx('w-9 h-9 rounded-xl flex items-center justify-center shrink-0', colors.icon)}>
          <Icon className="w-4 h-4" />
        </div>
      </div>
      <p className="text-3xl font-bold text-slate-900 mb-1 leading-none">{value}</p>
      <div className="flex items-center justify-between mt-2">
        {subtitle && <p className="text-xs text-slate-500">{subtitle}</p>}
        {trend && (
          <div className={clsx('flex items-center gap-1 text-xs font-medium', trend === 'up' ? 'text-red-600' : 'text-emerald-600')}>
            {trend === 'up' ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
            {trendValue}
          </div>
        )}
      </div>
    </div>
  )
}

export default StatCard