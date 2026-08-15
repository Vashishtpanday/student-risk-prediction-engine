import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import Sidebar from '../../components/common/Sidebar'
import Navbar from '../../components/common/Navbar'
import PredictionResult from '../../components/prediction/PredictionResult'
import Card from '../../components/common/Card'
import { MOCK_STUDENTS } from '../../api/student.api'
import { predictStudent } from '../../api/prediction.api'
import Loader from '../../components/common/Loader'
import { RefreshCw, Brain } from 'lucide-react'
import { formatDateTime } from '../../utils/formatDate'
import toast, { Toaster } from 'react-hot-toast'

const MyPrediction = () => {
  const { user } = useAuth()
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  const student = MOCK_STUDENTS.find((s) => s.student_id === user?.student_id) || MOCK_STUDENTS[1]

  const runPrediction = async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true)
      else setLoading(true)
      const res = await predictStudent(student)
      setResult(res)
      if (isRefresh) toast.success('Prediction refreshed')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => { runPrediction() }, [])

  if (loading) return <Loader />

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Toaster position="top-right" toastOptions={{ style: { background: '#ffffff', color: '#0f172a', border: '1px solid #e2e8f0' } }} />
      <Sidebar />
      <div className="flex-1 ml-64">
        <Navbar title="My Risk Prediction" />
        <main className="p-6 space-y-4 max-w-2xl animate-fade-in">
          <Card className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 border border-blue-200 rounded-xl flex items-center justify-center">
                <Brain className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-900">AI Risk Assessment</p>
                {result?.predicted_at && (
                  <p className="text-xs text-slate-500">Last run: {formatDateTime(result.predicted_at)}</p>
                )}
              </div>
            </div>
            <button
              onClick={() => runPrediction(true)}
              disabled={refreshing}
              className="flex items-center gap-2 px-4 py-2 bg-blue-50 border border-blue-200 text-blue-700 rounded-xl text-sm font-medium hover:bg-blue-100 transition-all disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
              {refreshing ? 'Running...' : 'Refresh'}
            </button>
          </Card>
          {result && <PredictionResult result={result} />}
        </main>
      </div>
    </div>
  )
}

export default MyPrediction