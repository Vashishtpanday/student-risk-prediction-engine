import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import Sidebar from '../../components/common/Sidebar'
import Navbar from '../../components/common/Navbar'
import RecommendationList from '../../components/recommendation/RecommendationList'
import Card from '../../components/common/Card'
import { MOCK_STUDENTS } from '../../api/student.api'
import { predictStudent } from '../../api/prediction.api'
import Loader from '../../components/common/Loader'
import { Star, AlertTriangle } from 'lucide-react'

const MyRecommendations = () => {
  const { user } = useAuth()
  const [recommendations, setRecommendations] = useState([])
  const [loading, setLoading] = useState(true)
  const [riskCategory, setRiskCategory] = useState('')

  const student = MOCK_STUDENTS.find((s) => s.student_id === user?.student_id) || MOCK_STUDENTS[1]

  useEffect(() => {
    predictStudent(student).then((res) => {
      setRecommendations(res.recommendations || [])
      setRiskCategory(res.risk_category)
      setLoading(false)
    })
  }, [])

  if (loading) return <Loader />

  const highCount = recommendations.filter((r) => r.priority === 'High').length
  const medCount = recommendations.filter((r) => r.priority === 'Medium').length

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />
      <div className="flex-1 ml-64">
        <Navbar title="My Recommendations" />
        <main className="p-6 space-y-6 max-w-2xl animate-fade-in">
          <div className="grid grid-cols-3 gap-4">
            <Card className="text-center">
              <p className="text-2xl font-bold text-slate-900">{recommendations.length}</p>
              <p className="text-xs text-slate-500 mt-1">Total Items</p>
            </Card>
            <Card className="text-center border-red-100">
              <p className="text-2xl font-bold text-red-600">{highCount}</p>
              <p className="text-xs text-slate-500 mt-1">High Priority</p>
            </Card>
            <Card className="text-center border-amber-100">
              <p className="text-2xl font-bold text-amber-600">{medCount}</p>
              <p className="text-xs text-slate-500 mt-1">Medium Priority</p>
            </Card>
          </div>

          {riskCategory === 'High Risk' && (
            <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-xl">
              <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-red-700">Immediate Action Required</p>
                <p className="text-xs text-slate-600 mt-0.5">Your risk level is High. Please act on all recommendations below and consult your faculty advisor.</p>
              </div>
            </div>
          )}

          <Card>
            <div className="flex items-center gap-2 mb-4">
              <Star className="w-4 h-4 text-blue-600" />
              <h3 className="text-sm font-semibold text-slate-900">Personalized Recommendations</h3>
            </div>
            <RecommendationList recommendations={recommendations} />
          </Card>
        </main>
      </div>
    </div>
  )
}

export default MyRecommendations