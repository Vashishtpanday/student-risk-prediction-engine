import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import Layout from '../../components/common/Layout'
import PredictionResult from '../../components/prediction/PredictionResult'
import Card from '../../components/common/Card'
import Loader from '../../components/common/Loader'
import { getAllStudents, getStudentById } from '../../api/student.api'
import { predictStudent } from '../../api/prediction.api'
import { RefreshCw, Brain } from 'lucide-react'
import { formatDateTime } from '../../utils/formatDate'
import toast, { Toaster } from 'react-hot-toast'

const MyPrediction = () => {
  const { user } = useAuth()
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  const resolveStudent = async () => {
    const targetId = user?.studentId || user?.student_id || user?._id || user?.id
    if (targetId) {
      try {
        const s = await getStudentById(targetId)
        if (s) return s
      } catch (e) {}
    }
    const all = await getAllStudents()
    return all.find((s) => String(s.email || '').toLowerCase() === String(user?.email || '').toLowerCase()) || null
  }

  const runPrediction = async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true)
      else setLoading(true)

      const student = await resolveStudent()
      if (student) {
        const res = await predictStudent(student)
        setResult(res)
      }
      if (isRefresh) toast.success('Prediction updated!')
    } catch (err) {
      console.error(err)
      toast.error('Failed to update prediction')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    if (user) runPrediction()
  }, [user])

  if (loading) return <Loader />

  return (
    <Layout title="My Risk Prediction" subtitle="Personal AI risk evaluation">
      <Toaster position="top-right" />
      <div className="space-y-4 max-w-2xl animate-fade-in">
        <Card className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 border border-blue-200 rounded-xl flex items-center justify-center">
              <Brain className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-900">AI Risk Assessment</p>
              {result?.predicted_at && (
                <p className="text-xs text-slate-500">Last updated: {formatDateTime(result.predicted_at)}</p>
              )}
            </div>
          </div>
          <button
            onClick={() => runPrediction(true)}
            disabled={refreshing}
            className="flex items-center gap-2 px-4 py-2 bg-blue-50 border border-blue-200 text-blue-700 rounded-xl text-sm font-medium hover:bg-blue-100 transition-all disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
            {refreshing ? 'Updating...' : 'Refresh'}
          </button>
        </Card>

        {result ? <PredictionResult result={result} /> : <Card><p className="text-sm text-slate-500">No prediction data available.</p></Card>}
      </div>
    </Layout>
  )
}

export default MyPrediction