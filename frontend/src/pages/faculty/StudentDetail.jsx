import { useParams, useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import Layout from '../../components/common/Layout'
import Card from '../../components/common/Card'
import Badge from '../../components/common/Badge'
import PredictionResult from '../../components/prediction/PredictionResult'
import Loader from '../../components/common/Loader'
import { getStudentById } from '../../api/student.api'
import { predictStudent } from '../../api/prediction.api'
import {
  ArrowLeft,
  Mail,
  BookOpen,
  Calendar,
  Hash,
  Award,
  Clock,
} from 'lucide-react'
import { getAttendanceColor, getMarksColor, normalizeRiskLabel } from '../../utils/riskColor'
import { formatDate } from '../../utils/formatDate'

const StudentDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [student, setStudent] = useState(null)
  const [prediction, setPrediction] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true)
        setError('')

        const decodedId = decodeURIComponent(id)
        const s = await getStudentById(decodedId)

        if (!s) {
          setError('Student not found')
          setStudent(null)
          return
        }

        setStudent(s)

        const payload = {
          student_id: s.studentId || s.student_id || s._id,
          name: s.name,
          department: s.department,
          semester: s.semester,
          attendance_pct: s.attendancePercentage ?? s.attendance_pct ?? s.attendancePct ?? 0,
          internal_marks: s.internalMarksAverage ?? s.internal_marks ?? s.internalMarks ?? 0,
          cp_ncp: s.cpNcpStatus || s.cp_ncp || s.cpNcp || 'CP',
          previous_backlogs: s.previousBacklogs ?? s.previous_backlogs ?? 0,
        }

        try {
          const p = await predictStudent(payload)
          setPrediction(p)
        } catch (predErr) {
          console.error('Prediction failed:', predErr)
        }
      } catch (err) {
        console.error(err)
        setError(err.message || 'Failed to load student')
      } finally {
        setLoading(false)
      }
    }

    if (id) load()
  }, [id])

  if (loading) return <Loader />

  if (error || !student) {
    return (
      <Layout title="Student Detail">
        <Card>
          <p className="text-slate-900 font-semibold mb-2">Student not found</p>
          <p className="text-slate-500 text-sm mb-4">{error || 'No record available for this ID.'}</p>
          <button
            onClick={() => navigate('/faculty/students')}
            className="px-4 py-2 bg-blue-600 text-white rounded-xl text-sm"
          >
            Back to Students
          </button>
        </Card>
      </Layout>
    )
  }

  const attendance = student.attendancePercentage ?? student.attendance_pct ?? student.attendancePct ?? 0
  const marks = student.internalMarksAverage ?? student.internal_marks ?? student.internalMarks ?? 0
  const status = student.cpNcpStatus || student.cp_ncp || student.cpNcp || 'CP'
  const backlogs = student.previousBacklogs ?? student.previous_backlogs ?? 0
  const risk =
    student.latestRiskLevel ||
    student.risk_category ||
    student.riskCategory ||
    prediction?.risk_category ||
    'Low Risk'

  const infoItems = [
    { icon: Hash, label: 'Student ID', value: student.studentId || student.student_id || student._id },
    { icon: Mail, label: 'Email', value: student.email || 'N/A' },
    { icon: BookOpen, label: 'Department', value: student.department || 'N/A' },
    { icon: Calendar, label: 'Semester', value: `Semester ${student.semester || 'N/A'}` },
    {
      icon: Award,
      label: 'CP/NCP',
      value: status,
      color: String(status).toUpperCase() === 'CP' ? 'text-emerald-600' : 'text-red-600',
    },
    {
      icon: Clock,
      label: 'Created',
      value: student.createdAt ? formatDate(student.createdAt) : 'N/A',
    },
  ]

  return (
    <Layout title="Student Detail" subtitle={`${student.name} • ${student.department || ''}`}>
      <div className="space-y-6 animate-fade-in">
        <button
          onClick={() => navigate('/faculty/students')}
          className="flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Students
        </button>

        <Card>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5 mb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center text-white text-2xl font-bold shadow-lg shadow-blue-500/20 shrink-0">
              {(student.name || 'S').charAt(0)}
            </div>
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-3 mb-1">
                <h2 className="text-xl font-bold text-slate-900">{student.name}</h2>
                <Badge risk={normalizeRiskLabel(risk)} size="lg" />
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
                <p className={`text-sm font-semibold ${color || 'text-slate-900'} truncate`}>
                  {value}
                </p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              {
                label: 'Attendance',
                value: `${attendance}%`,
                color: getAttendanceColor(attendance),
                danger: Number(attendance) < 75,
                note: Number(attendance) < 75 ? 'Below 75%' : 'Good',
              },
              {
                label: 'Internal Marks',
                value: `${marks}/100`,
                color: getMarksColor(marks),
                danger: Number(marks) < 50,
                note: Number(marks) < 50 ? 'Needs improvement' : 'Satisfactory',
              },
              {
                label: 'Past Backlogs',
                value: backlogs,
                color: Number(backlogs) > 0 ? 'text-amber-600' : 'text-emerald-600',
                danger: Number(backlogs) > 0,
                note: Number(backlogs) > 0 ? 'Has backlogs' : 'None',
              },
            ].map(({ label, value, color, danger, note }) => (
              <div
                key={label}
                className={`rounded-xl p-4 text-center border ${
                  danger ? 'bg-red-50 border-red-100' : 'bg-emerald-50 border-emerald-100'
                }`}
              >
                <p className={`text-2xl font-bold ${color}`}>{value}</p>
                <p className="text-xs text-slate-500 mt-1">{label}</p>
                <p className={`text-xs mt-0.5 ${danger ? 'text-red-600' : 'text-emerald-600'}`}>
                  {note}
                </p>
              </div>
            ))}
          </div>
        </Card>

        {prediction && <PredictionResult result={prediction} />}
      </div>
    </Layout>
  )
}

export default StudentDetail