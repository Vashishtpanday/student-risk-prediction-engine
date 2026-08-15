import { useEffect, useState } from 'react'
import Sidebar from '../../components/common/Sidebar'
import Navbar from '../../components/common/Navbar'
import StatCard from '../../components/common/StatCard'
import RiskDistributionPie from '../../components/charts/RiskDistributionPie'
import AttendanceBarChart from '../../components/charts/AttendanceBarChart'
import MarksBarChart from '../../components/charts/MarksBarChart'
import StudentTable from '../../components/student/StudentTable'
import Card from '../../components/common/Card'
import { getDashboardStats, getDepartmentReport } from '../../api/dashboard.api'
import { getAllStudents } from '../../api/student.api'
import { Users, AlertTriangle, TrendingUp, CheckCircle, BarChart3 } from 'lucide-react'
import Loader from '../../components/common/Loader'

const AdminDashboard = () => {
  const [stats, setStats] = useState(null)
  const [students, setStudents] = useState([])
  const [deptReport, setDeptReport] = useState({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([getDashboardStats(), getAllStudents(), getDepartmentReport()])
      .then(([s, all, dept]) => { setStats(s); setStudents(all); setDeptReport(dept) })
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <Loader />

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />
      <div className="flex-1 ml-64">
        <Navbar title="Admin Dashboard" subtitle="Institution-wide academic overview" />
        <main className="p-6 space-y-6 animate-fade-in">
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            <StatCard title="Total Students" value={stats?.total || 0} icon={Users} color="indigo" subtitle="All departments" />
            <StatCard title="High Risk" value={stats?.high || 0} icon={AlertTriangle} color="red" subtitle="Need attention" trend="up" trendValue={`${Math.round(((stats?.high || 0) / (stats?.total || 1)) * 100)}%`} />
            <StatCard title="Moderate Risk" value={stats?.moderate || 0} icon={TrendingUp} color="amber" subtitle="Monitor closely" />
            <StatCard title="Low Risk" value={stats?.low || 0} icon={CheckCircle} color="emerald" subtitle="Performing well" />
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            <div className="xl:col-span-2 space-y-6">
              <AttendanceBarChart students={students} />
              <MarksBarChart students={students} />
            </div>
            <div className="space-y-6">
              <RiskDistributionPie data={stats} />
              <Card>
                <div className="flex items-center gap-2 mb-4">
                  <BarChart3 className="w-4 h-4 text-blue-600" />
                  <h3 className="text-sm font-semibold text-slate-900">Dept. Summary</h3>
                </div>
                <div className="space-y-3">
                  {Object.entries(deptReport).map(([dept, data]) => (
                    <div key={dept} className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-semibold text-slate-900">{dept}</p>
                        <p className="text-xs text-slate-500">{data.total} students</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-red-600">{data.high} high risk</p>
                        <div className="w-20 h-1.5 bg-slate-100 rounded-full mt-1 overflow-hidden">
                          <div className="h-full bg-red-500 rounded-full" style={{ width: `${(data.high / data.total) * 100}%` }} />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
            <div className="p-5 border-b border-slate-200">
              <h3 className="text-sm font-semibold text-slate-900">All Students</h3>
              <p className="text-xs text-slate-500 mt-0.5">Complete student database</p>
            </div>
            <StudentTable students={students} />
          </div>
        </main>
      </div>
    </div>
  )
}

export default AdminDashboard