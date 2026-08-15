import { useParams, useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import Sidebar from '../../components/common/Sidebar'
import Navbar from '../../components/common/Navbar'
import Card from '../../components/common/Card'
import Badge from '../../components/common/Badge'
import PredictionResult from '../../components/prediction/PredictionResult'
import { getStudentById } from '../../api/student.api'
import { predictStudent } from '../../api/prediction.api'
import { ArrowLeft, Mail, BookOpen, Calendar, Hash, Award, Clock } from 'lucide-react'
import Loader from '../../components/common/Loader'
import { getAttendanceColor, getMarksColor } from '../../utils/riskColor'
import { formatDate } from '../../utils/formatDate'

const StudentDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [student, setStudent] = useState(null)
  const [prediction, setPrediction] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      const s = await getStudentById(id)
      setStudent(s)
      if (s) {
        const p = await predictStudent(s)
        setPrediction(p)
      }
      setLoading(false)
    }
    load()
  }, [id])

  if (loading) return <Loader />
  if (!student) return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />
      <div className="flex-1 ml-64 flex items-center justify-center">
        <div className="text-center">
          <p className="text-slate-900 font-semibold text-lg">Student not found</p>
          <button onClick={() => navigate(-1)} className="mt-4 text-blue-600 text-sm hover:underline">Go back</button>
        </div>
      </div>
    </div>
  )

  const infoItems = [
    { icon: Hash, label: 'Student ID', value: student.student_id },
    { icon: Mail, label: 'Email', value: student.email },
    { icon: BookOpen, label: 'Department', value: student.department },
    { icon: Calendar, label: 'Semester', value: `Semester ${student.semester}` },
    { icon: Award, label: 'CP/NCP', value: student.cp_ncp, color: student.cp_ncp === 'CP' ? 'text-emerald-600' : 'text-red-600' },
    { icon: Clock, label: 'Enrolled', value: formatDate(student.createdAt) },
  ]

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />
      <div className="flex-1 ml-64">
        <Navbar title="Student Detail" />
        <main className="p-6 space-y-6 animate-fade-in">
          <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900 transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Back to Students
          </button>

          <Card>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5 mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center text-white text-2xl font-bold shadow-lg shadow-blue-500/30 shrink-0">
                {student.name.charAt(0)}
              </div>
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-3 mb-1">
                  <h2 className="text-xl font-bold text-slate-900">{student.name}</h2>
                  <Badge risk={student.risk_category} size="lg" />
                </div>
                <p className="text-sm text-slate-500">{student.email}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-5">
              {infoItems.map(({ icon: Icon, label, value, color }) => (
                <div key={label} className="bg-slate-50 border border-slate-200 rounded-xl p-3.5">
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <Icon className="w-3.5 h-3.5 text-blue-600" />
                    <p className="text-xs text-slate-500 font-medium">{label}</p>
                  </div>
                  <p className={`text-sm font-semibold ${color || 'text-slate-900'} truncate`}>{value}</p>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-3 gap-3">
              {[
                { label: 'Attendance', value: `${student.attendance_pct}%`, color: getAttendanceColor(student.attendance_pct), danger: student.attendance_pct < 75, note: student.attendance_pct < 75 ? '⚠ Below 75%' : '✓ Good' },
                { label: 'Internal Marks', value: `${student.internal_marks}/100`, color: getMarksColor(student.internal_marks), danger: student.internal_marks < 50, note: student.internal_marks < 50 ? '⚠ Below 50' : '✓ Good' },
                { label: 'Past Backlogs', value: student.previous_backlogs, color: student.previous_backlogs > 0 ? 'text-amber-600' : 'text-emerald-600', danger: student.previous_backlogs > 0, note: student.previous_backlogs > 0 ? '⚠ Has backlogs' : '✓ None' },
              ].map(({ label, value, color, danger, note }) => (
                <div key={label} className={`rounded-xl p-4 text-center border ${danger ? 'bg-red-50 border-red-100' : 'bg-emerald-50 border-emerald-100'}`}>
                  <p className={`text-2xl font-bold ${color}`}>{value}</p>
                  <p className="text-xs text-slate-500 mt-1">{label}</p>
                  <p className={`text-xs mt-0.5 ${danger ? 'text-red-600' : 'text-emerald-600'}`}>{note}</p>
                </div>
              ))}
            </div>
          </Card>

          {prediction && <PredictionResult result={prediction} />}
        </main>
      </div>
    </div>
  )
}

export default StudentDetail