import { useEffect, useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import Layout from '../../components/common/Layout'
import Card from '../../components/common/Card'
import RecommendationList from '../../components/recommendation/RecommendationList'
import Loader from '../../components/common/Loader'
import { getAllStudents, getStudentById } from '../../api/student.api'
import { predictStudent } from '../../api/prediction.api'
import { Star, AlertTriangle } from 'lucide-react'
import { normalizeRiskLabel } from '../../utils/riskColor'

const MyRecommendations = () => {
  const { user } = useAuth()
  const [recommendations, setRecommendations] = useState([])
  const [riskCategory, setRiskCategory] = useState('Low Risk')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        let student = null
        const directId = user?.studentId || user?.student_id || user?._id || user?.id
        if (directId) {
          try { student = await getStudentById(directId) } catch (_) {}
        }
        if (!student) {
          const all = await getAllStudents()
          student = all.find(
            (s) => String(s.email || '').toLowerCase() === String(user?.email || '').toLowerCase()
          )
        }
        if (!student) throw new Error('Student record not found')

        const payload = {
          student_id: student.studentId || student.student_id || student._id,
          attendance_pct:
            student.attendancePercentage ?? student.attendance_pct ?? student.attendancePct ?? 0,
          internal_marks:
            student.internalMarksAverage ?? student.internal_marks ?? student.internalMarks ?? 0,
          cp_ncp: student.cpNcpStatus || student.cp_ncp || student.cpNcp || 'CP',
          previous_backlogs: student.previousBacklogs ?? student.previous_backlogs ?? 0,
          semester: student.semester,
        }

        const res = await predictStudent(payload)
        setRecommendations(res.recommendations || [])
        setRiskCategory(normalizeRiskLabel(res.risk_category || student.latestRiskLevel || 'Low Risk'))
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    if (user) load()
  }, [user])

  if (loading) return <Loader />

  const highCount = recommendations.filter((r) => r.priority === 'High').length
  const medCount = recommendations.filter((r) => r.priority === 'Medium').length

  return (
    <Layout title="My Recommendations" subtitle="Personalized academic guidance">
      <div className="max-w-2xl space-y-6">
        <div className="grid grid-cols-3 gap-4">
          <Card className="text-center">
            <p className="text-2xl font-bold text-slate-900">{recommendations.length}</p>
            <p className="text-xs text-slate-500 mt-1">Total</p>
          </Card>
          <Card className="text-center">
            <p className="text-2xl font-bold text-red-600">{highCount}</p>
            <p className="text-xs text-slate-500 mt-1">High Priority</p>
          </Card>
          <Card className="text-center">
            <p className="text-2xl font-bold text-amber-600">{medCount}</p>
            <p className="text-xs text-slate-500 mt-1">Medium Priority</p>
          </Card>
        </div>

        {riskCategory === 'High Risk' && (
          <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-xl">
            <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-red-700">Immediate action recommended</p>
              <p className="text-xs text-slate-600 mt-1">
                Your current risk is High. Follow the recommendations and contact your faculty mentor.
              </p>
            </div>
          </div>
        )}

        <Card>
          <div className="flex items-center gap-2 mb-4">
            <Star className="w-4 h-4 text-blue-600" />
            <h3 className="text-sm font-semibold text-slate-900">Your Recommendations</h3>
          </div>
          <RecommendationList recommendations={recommendations} />
        </Card>
      </div>
    </Layout>
  )
}

export default MyRecommendations