import { getRiskColor } from '../../utils/riskColor'
import clsx from 'clsx'

const Badge = ({ risk, size = 'sm' }) => {
  const colors = getRiskColor(risk)
  return (
    <span className={clsx(
      'inline-flex items-center gap-1.5 rounded-lg font-semibold border',
      size === 'sm' ? 'px-2.5 py-1 text-xs' : 'px-3 py-1.5 text-sm',
      colors.bg, colors.text, colors.border
    )}>
      <span className={clsx('rounded-full shrink-0', size === 'sm' ? 'w-1.5 h-1.5' : 'w-2 h-2', colors.dot)} />
      {risk}
    </span>
  )
}

export default Badge