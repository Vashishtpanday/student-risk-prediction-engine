import RecommendationCard from './RecommendationCard'
import { CheckCircle } from 'lucide-react'

const RecommendationList = ({ recommendations = [] }) => {
  if (recommendations.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <div className="w-16 h-16 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center justify-center mb-4">
          <CheckCircle className="w-8 h-8 text-emerald-600" />
        </div>
        <p className="text-slate-900 font-semibold text-lg">All Good!</p>
        <p className="text-slate-500 text-sm mt-1">No critical recommendations at this time.</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {recommendations.map((rec, i) => (
        <RecommendationCard key={i} recommendation={rec} />
      ))}
    </div>
  )
}

export default RecommendationList