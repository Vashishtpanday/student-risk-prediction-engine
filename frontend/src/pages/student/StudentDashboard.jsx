import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import Sidebar from '../../components/common/Sidebar'
import Navbar from '../../components/common/Navbar'
import Card from '../../components/common/Card'
import Badge from '../../components/common/Badge'
import PredictionResult from '../../components/prediction/PredictionResult'
import { MOCK_STUDENTS } from '../../api/student.api'
import { predictStudent } from '../../api/prediction.api'
import { Calendar as CalIcon, BookOpen, TrendingUp, Award, Clock } from 'lucide-react'
import Calendar from 'react-calendar'
import 'react-calendar/dist/Calendar.css'
import { formatDate } from '../../utils/formatDate'
import { getAttendanceColor, getMarksColor } from '../../utils/riskColor'
import Loader from '../../components/common/Loader'

const StudentDashboard = () => {
  const { user } = useAuth()
  const [prediction, setPrediction] = useState(null)
  const [loading, setLoading] = useState(true)
  const [calDate, setCalDate] = useState(new Date())

  const student = MOCK_STUDENTS.find((s) => s.student_id === user?.student_id) || MOCK_STUDENTS[1]

  useEffect(() => {
    predictStudent(student).then((res) => {
      setPrediction(res)
      setLoading(false)
    })
  }, [])

  if (loading) return <Loader />

  const stats = [
    { label: 'Attendance', value: `${student.attendance_pct}%`, icon: TrendingUp, color: getAttendanceColor(student.attendance_pct), danger: student.attendance_pct < 75, note: student.attendance_pct < 75 ? 'Below 75% threshold' : 'Above required threshold' },
    { label: 'Internal Marks', value: `${student.internal_marks}/100`, icon: BookOpen, color: getMarksColor(student.internal_marks), danger: student.internal_marks < 50, note: student.internal_marks < 50 ? 'Below passing marks' : 'Satisfactory performance' },
    { label: 'CP / NCP Status', value: student.cp_ncp, icon: Award, color: student.cp_ncp === 'CP' ? 'text-emerald-600' : 'text-red-600', danger: student.cp_ncp === 'NCP', note: student.cp_ncp === 'NCP' ? 'Needs improvement' : 'Credit Pass achieved' },
    { label: 'Past Backlogs', value: student.previous_backlogs, icon: Clock, color: student.previous_backlogs > 0 ? 'text-amber-600' : 'text-emerald-600', danger: student.previous_backlogs > 0, note: student.previous_backlogs > 0 ? 'Backlogs pending' : 'No backlogs' },
  ]

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />
      <div className="flex-1 ml-64">
        <Navbar title="My Dashboard" subtitle={`Semester ${student.semester} — ${student.department}`} />
        <main className="p-6 space-y-6 animate-fade-in">
          <Card>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center text-white text-2xl font-bold shadow-lg shadow-blue-500/30 shrink-0">
                {student.name.charAt(0)}
              </div>
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-3 mb-1">
                  <h2 className="text-xl font-bold text-slate-900">{student.name}</h2>
                  <Badge risk={student.risk_category} size="lg" />
                </div>
                <p className="text-sm text-slate-500">{student.student_id} • {student.email}</p>
              </div>
              <div className="text-right hidden sm:block">
                <p className="text-xs text-slate-500">Last Updated</p>
                <p className="text-sm text-slate-900 font-medium">{formatDate(student.createdAt)}</p>
              </div>
            </div>
          </Card>

          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            {stats.map(({ label, value, icon: Icon, color, danger, note }) => (
              <Card key={label} className={danger ? 'border-red-200' : ''}>
                <div className="flex items-center justify-between mb-3">
                  <p className="text-xs font-medium text-slate-600">{label}</p>
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${danger ? 'bg-red-100' : 'bg-blue-100'}`}>
                    <Icon className={`w-4 h-4 ${danger ? 'text-red-600' : 'text-blue-600'}`} />
                  </div>
                </div>
                <p className={`text-2xl font-bold mb-1 ${color}`}>{value}</p>
                <p className="text-xs text-slate-500">{note}</p>
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
                <Calendar onChange={setCalDate} value={calDate} className="react-calendar" />
                <div className="mt-4 pt-4 border-t border-slate-100">
                  <p className="text-xs text-slate-500">Selected Date</p>
                  <p className="text-sm font-semibold text-slate-900 mt-0.5">{calDate.toDateString()}</p>
                </div>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}

export default StudentDashboard