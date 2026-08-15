import { Brain, AlertTriangle } from 'lucide-react'
import Badge from '../common/Badge'
import Card from '../common/Card'
import { getRiskColor, getRiskScore } from '../../utils/riskColor'
import clsx from 'clsx'

const PredictionResult = ({ result }) => {
  if (!result) return null
  const colors = getRiskColor(result.risk_category)
  const score = getRiskScore(result.risk_category)

  return (
    <div className="space-y-4 animate-slide-up">
      <Card className={clsx('border-2', colors.border)}>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className={clsx('w-12 h-12 rounded-2xl flex items-center justify-center', colors.bg)}>
              <Brain className={clsx('w-6 h-6', colors.text)} />
            </div>
            <div>
              <p className="text-xs text-slate-500 mb-1">AI Prediction Result</p>
              <Badge risk={result.risk_category} size="lg" />
            </div>
          </div>
          <div className="text-right">
            <p className="text-xs text-slate-500 mb-1">Model Confidence</p>
            <p className="text-3xl font-bold text-slate-900 leading-none">
              {(result.confidence_score * 100).toFixed(0)}
              <span className="text-lg text-slate-400">%</span>
            </p>
          </div>
        </div>

        <div className="mb-4">
          <div className="flex justify-between text-xs mb-2">
            <span className="text-slate-600 font-medium">Risk Score</span>
            <span className={colors.text + ' font-bold'}>{score}/100</span>
          </div>
          <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
            <div
              className={clsx('h-full rounded-full transition-all duration-1000 ease-out', score > 70 ? 'bg-gradient-to-r from-red-500 to-red-600' : score > 40 ? 'bg-gradient-to-r from-amber-500 to-amber-600' : 'bg-gradient-to-r from-emerald-500 to-emerald-600')}
              style={{ width: `${score}%` }}
            />
          </div>
        </div>

        <div className="space-y-3 pt-4 border-t border-slate-100">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Contributing Factors</p>
          {Object.entries(result.contributing_factors || {}).map(([key, val]) => (
            <div key={key}>
              <div className="flex justify-between text-xs mb-1.5">
                <span className="text-slate-700 font-medium capitalize">{key.replace(/_/g, ' ')}</span>
                <div className="flex items-center gap-2">
                  <span className="text-slate-500">{val.message}</span>
                  <span className={clsx('font-bold', val.impact === 'negative' ? 'text-red-600' : 'text-emerald-600')}>
                    {val.contribution_pct}%
                  </span>
                </div>
              </div>
              <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className={clsx('h-full rounded-full transition-all duration-700', val.impact === 'negative' ? 'bg-gradient-to-r from-red-600 to-red-500' : 'bg-gradient-to-r from-emerald-600 to-emerald-500')}
                  style={{ width: `${val.contribution_pct}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </Card>

      {result.recommendations?.length > 0 && (
        <Card>
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle className="w-4 h-4 text-amber-500" />
            <p className="text-sm font-semibold text-slate-900">Academic Recommendations</p>
            <span className="ml-auto text-xs px-2 py-0.5 bg-amber-50 border border-amber-200 text-amber-700 rounded-lg">
              {result.recommendations.length} items
            </span>
          </div>
          <div className="space-y-3">
            {result.recommendations.map((rec, i) => (
              <div key={i} className={clsx(
                'flex gap-3 p-3.5 rounded-xl border',
                rec.priority === 'High' ? 'bg-red-50 border-red-100' : 'bg-amber-50 border-amber-100'
              )}>
                <div className={clsx('w-2 h-2 rounded-full shrink-0 mt-1.5', rec.priority === 'High' ? 'bg-red-500' : 'bg-amber-500')} />
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-0.5">
                    <p className="text-xs font-semibold text-slate-800">{rec.category}</p>
                    <span className={clsx('text-xs px-1.5 py-0.5 rounded font-medium', rec.priority === 'High' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700')}>
                      {rec.priority}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">{rec.message}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  )
}

export default PredictionResult