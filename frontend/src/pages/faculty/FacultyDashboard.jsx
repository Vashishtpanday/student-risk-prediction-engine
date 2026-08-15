import { useEffect, useState } from 'react'
import Sidebar from '../../components/common/Sidebar'
import Navbar from '../../components/common/Navbar'
import StatCard from '../../components/common/StatCard'
import RiskDistributionPie from '../../components/charts/RiskDistributionPie'
import AttendanceBarChart from '../../components/charts/AttendanceBarChart'
import StudentTable from '../../components/student/StudentTable'
import Card from '../../components/common/Card'
import { getDashboardStats, getHighRiskStudents } from '../../api/dashboard.api'
import { getAllStudents } from '../../api/student.api'
import { Users, AlertTriangle, TrendingUp, CheckCircle } from 'lucide-react'
import Loader from '../../components/common/Loader'

const FacultyDashboard = () => {
  const [stats, setStats] = useState(null)
  const [students, setStudents] = useState([])
  const [highRisk, setHighRisk] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([getDashboardStats(), getAllStudents(), getHighRiskStudents()])
      .then(([s, all, hr]) => { setStats(s); setStudents(all); setHighRisk(hr) })
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <Loader />

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />
      <div className="flex-1 ml-64">
        <Navbar title="Faculty Dashboard" />
        <main className="p-6 space-y-6 animate-fade-in">
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            <StatCard title="Total Students" value={stats?.total || 0} icon={Users} color="indigo" subtitle="Enrolled this semester" />
            <StatCard title="High Risk" value={stats?.high || 0} icon={AlertTriangle} color="red" subtitle="Immediate attention" trend="up" trendValue={`${stats?.high || 0} students`} />
            <StatCard title="Moderate Risk" value={stats?.moderate || 0} icon={TrendingUp} color="amber" subtitle="Requires monitoring" />
            <StatCard title="Low Risk" value={stats?.low || 0} icon={CheckCircle} color="emerald" subtitle="Performing well" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Card>
              <p className="text-xs text-slate-500 mb-1">Avg Attendance</p>
              <p className="text-3xl font-bold text-slate-900">{stats?.avgAttendance || 0}<span className="text-lg text-slate-400">%</span></p>
            </Card>
            <Card>
              <p className="text-xs text-slate-500 mb-1">Avg Internal Marks</p>
              <p className="text-3xl font-bold text-slate-900">{stats?.avgMarks || 0}<span className="text-lg text-slate-400">/100</span></p>
            </Card>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            <div className="xl:col-span-2">
              <AttendanceBarChart students={students} />
            </div>
            <RiskDistributionPie data={stats} />
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
            <div className="p-5 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-slate-900">High Risk Students</h3>
                <p className="text-xs text-slate-500 mt-0.5">Students requiring immediate intervention</p>
              </div>
              <span className="px-3 py-1.5 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs font-semibold">
                {highRisk.length} Students
              </span>
            </div>
            <StudentTable students={highRisk} showActions={true} />
          </div>
        </main>
      </div>
    </div>
  )
}

export default FacultyDashboard