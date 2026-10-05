import { useEffect, useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import Layout from '../../components/common/Layout'
import Card from '../../components/common/Card'
import Badge from '../../components/common/Badge'
import PredictionResult from '../../components/prediction/PredictionResult'
import Loader from '../../components/common/Loader'
import { getAllStudents, getStudentById } from '../../api/student.api'
import { predictStudent } from '../../api/prediction.api'
import { BookOpen, TrendingUp, Award, Clock, Calendar as CalIcon } from 'lucide-react'
import Calendar from 'react-calendar'
import 'react-calendar/dist/Calendar.css'
import { getAttendanceColor, getMarksColor, normalizeRiskLabel } from '../../utils/riskColor'

const StudentDashboard = () => {
  const { user } = useAuth()
  const [student, setStudent] = useState(null)
  const [prediction, setPrediction] = useState(null)
  const [loading, setLoading] = useState(true)
  const [calDate, setCalDate] = useState(new Date())

  useEffect(() => {
    const loadStudentData = async () => {
      try {
        setLoading(true)
        const targetId = user?.studentId || user?.student_id || user?._id || user?.id
        let record = null

        if (targetId) {
          try {
            record = await getStudentById(targetId)
          } catch (e) {}
        }

        if (!record && user?.email) {
          const all = await getAllStudents()
          record = all.find(
            (s) =>
              String(s.email || '').toLowerCase() === String(user.email).toLowerCase() ||
              String(s.studentId || s.student_id || '').toLowerCase() ===
                String(user.studentId || user.student_id || '').toLowerCase()
          )
        }

        if (record) {
          setStudent(record)
          const p = await predictStudent(record)
          setPrediction(p)
        }
      } catch (err) {
        console.error('Error loading student dashboard:', err)
      } finally {
        setLoading(false)
      }
    }

    if (user) loadStudentData()
  }, [user])

  if (loading) return <Loader />

  if (!student) {
    return (
      <Layout title="My Dashboard">
        <Card>
          <p className="text-slate-900 font-semibold mb-1">Student Record Not Found</p>
          <p className="text-sm text-slate-500">No student profile is linked to email: {user?.email}</p>
        </Card>
      </Layout>
    )
  }

  const attendance = student.attendancePercentage ?? student.attendance_pct ?? student.attendancePct ?? 0
  const marks = student.internalMarksAverage ?? student.internal_marks ?? student.internalMarks ?? 0
  const status = student.cpNcpStatus || student.cp_ncp || student.cpNcp || 'CP'
  const backlogs = student.previousBacklogs ?? student.previous_backlogs ?? 0
  const risk = prediction?.risk_category || student.latestRiskLevel || student.risk_category || 'Low Risk'

  const stats = [
    {
      label: 'Attendance',
      value: `${attendance}%`,
      icon: TrendingUp,
      color: getAttendanceColor(attendance),
      note: Number(attendance) < 75 ? 'Below 75% threshold' : 'Good attendance',
    },
    {
      label: 'Internal Marks',
      value: `${marks}/100`,
      icon: BookOpen,
      color: getMarksColor(marks),
      note: Number(marks) < 50 ? 'Needs improvement' : 'Satisfactory',
    },
    {
      label: 'CP / NCP',
      value: status,
      icon: Award,
      color: String(status).toUpperCase() === 'NCP' ? 'text-red-600' : 'text-emerald-600',
      note: String(status).toUpperCase() === 'NCP' ? 'NCP status' : 'Credit Pass',
    },
    {
      label: 'Backlogs',
      value: backlogs,
      icon: Clock,
      color: Number(backlogs) > 0 ? 'text-amber-600' : 'text-emerald-600',
      note: Number(backlogs) > 0 ? 'Backlogs pending' : 'No backlogs',
    },
  ]

  return (
    <Layout title="My Dashboard" subtitle={`${student.department || ''} • Semester ${student.semester || ''}`}>
      <div className="space-y-6 animate-fade-in">
        <Card>
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white font-bold text-xl flex items-center justify-center">
              {(student.name || 'S').charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <h2 className="text-xl font-bold text-slate-900">{student.name}</h2>
                <Badge risk={normalizeRiskLabel(risk)} />
              </div>
              <p className="text-sm text-slate-500">
                {student.studentId || student.student_id || student._id} • {student.email}
              </p>
            </div>
          </div>
        </Card>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {stats.map((item) => (
            <Card key={item.label}>
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs text-slate-500">{item.label}</p>
                <item.icon className="w-4 h-4 text-blue-600" />
              </div>
              <p className={`text-2xl font-bold ${item.color}`}>{item.value}</p>
              <p className="text-xs text-slate-500 mt-1">{item.note}</p>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">
          <div className="xl:col-span-3">
            {prediction && <PredictionResult result={prediction} />}
          </div>
          <div className="xl:col-span-2">
            <Card>
              <div className="flex items-center gap-2 mb-4">
                <CalIcon className="w-4 h-4 text-blue-600" />
                <h3 className="text-sm font-semibold text-slate-900">Academic Calendar</h3>
              </div>
              <Calendar onChange={setCalDate} value={calDate} />
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  )
}

export default StudentDashboard