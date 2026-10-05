import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Layout from '../../components/common/Layout'
import StatCard from '../../components/common/StatCard'
import RiskDistributionPie from '../../components/charts/RiskDistributionPie'
import AttendanceBarChart from '../../components/charts/AttendanceBarChart'
import MarksBarChart from '../../components/charts/MarksBarChart'
import StudentTable from '../../components/student/StudentTable'
import Card from '../../components/common/Card'
import Loader from '../../components/common/Loader'
import { getDashboardStats, getDepartmentReport } from '../../api/dashboard.api'
import { getAllStudents } from '../../api/student.api'
import {
  Users,
  AlertTriangle,
  TrendingUp,
  CheckCircle,
  BarChart3,
  ArrowRight,
} from 'lucide-react'

const AdminDashboard = () => {
  const [stats, setStats] = useState(null)
  const [students, setStudents] = useState([])
  const [deptReport, setDeptReport] = useState({})
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    const load = async () => {
      try {
        const [s, all, dept] = await Promise.all([
          getDashboardStats(),
          getAllStudents(),
          getDepartmentReport(),
        ])

        // If backend stats are empty, compute from students list
        let finalStats = s
        if (!s || !s.total || s.total === 0) {
          const total = all.length
          const high = all.filter((x) =>
            String(x.latestRiskLevel || x.risk_category || x.riskCategory || '')
              .toLowerCase()
              .includes('high')
          ).length
          const moderate = all.filter((x) => {
            const r = String(
              x.latestRiskLevel || x.risk_category || x.riskCategory || ''
            ).toLowerCase()
            return r.includes('mod') || r.includes('med')
          }).length
          const low = all.filter((x) =>
            String(x.latestRiskLevel || x.risk_category || x.riskCategory || '')
              .toLowerCase()
              .includes('low')
          ).length

          finalStats = { total, high, moderate, low }
        }

        // If department report empty, compute it
        let finalDept = dept
        if (!dept || Object.keys(dept).length === 0) {
          const map = {}
          all.forEach((stu) => {
            const d = stu.department || 'Unknown'
            if (!map[d]) map[d] = { total: 0, high: 0, moderate: 0, low: 0 }
            map[d].total++
            const r = String(
              stu.latestRiskLevel || stu.risk_category || stu.riskCategory || ''
            ).toLowerCase()
            if (r.includes('high')) map[d].high++
            else if (r.includes('mod') || r.includes('med')) map[d].moderate++
            else map[d].low++
          })
          finalDept = map
        }

        setStats(finalStats)
        setStudents(Array.isArray(all) ? all : [])
        setDeptReport(finalDept || {})
      } catch (err) {
        console.error('Admin dashboard load failed:', err)
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [])

  if (loading) return <Loader />

  const highRiskPercentage =
    stats?.total > 0 ? Math.round((stats.high / stats.total) * 100) : 0

  return (
    <Layout title="Admin Dashboard" subtitle="Institution-wide academic overview">
      <div className="space-y-6 animate-fade-in">
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          <StatCard
            title="Total Students"
            value={stats?.total || students.length || 0}
            icon={Users}
            color="indigo"
            subtitle="Across all departments"
          />
          <StatCard
            title="High Risk"
            value={stats?.high || 0}
            icon={AlertTriangle}
            color="red"
            subtitle="Need immediate attention"
            trend="up"
            trendValue={`${highRiskPercentage}%`}
          />
          <StatCard
            title="Moderate Risk"
            value={stats?.moderate || 0}
            icon={TrendingUp}
            color="amber"
            subtitle="Requires monitoring"
          />
          <StatCard
            title="Low Risk"
            value={stats?.low || 0}
            icon={CheckCircle}
            color="emerald"
            subtitle="Performing well"
          />
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <div className="xl:col-span-2 space-y-6">
            <AttendanceBarChart students={students} />
            <MarksBarChart students={students} />
          </div>

          <div className="space-y-6">
            <RiskDistributionPie data={stats} />

            <Card>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-blue-600" />
                  <h3 className="text-sm font-semibold text-slate-900">Dept. Summary</h3>
                </div>
                <button
                  onClick={() => navigate('/admin/reports')}
                  className="text-xs text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
                >
                  View full <ArrowRight className="w-3 h-3" />
                </button>
              </div>

              <div className="space-y-4">
                {Object.entries(deptReport).length === 0 ? (
                  <p className="text-sm text-slate-500">No department data available</p>
                ) : (
                  Object.entries(deptReport)
                    .slice(0, 6)
                    .map(([dept, data]) => {
                      const riskPct =
                        data.total > 0 ? Math.round((data.high / data.total) * 100) : 0
                      return (
                        <div key={dept} className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-semibold text-slate-900">{dept}</p>
                            <p className="text-xs text-slate-500">{data.total} students</p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-bold text-red-600">
                              {data.high} high risk
                            </p>
                            <div className="w-24 h-1.5 bg-slate-100 rounded-full mt-1.5 overflow-hidden">
                              <div
                                className="h-full bg-red-500 rounded-full"
                                style={{ width: `${riskPct}%` }}
                              />
                            </div>
                          </div>
                        </div>
                      )
                    })
                )}
              </div>
            </Card>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
          <div className="p-4 sm:p-5 border-b border-slate-200">
            <h3 className="text-sm font-semibold text-slate-900">Institution Database</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Complete student registry ({students.length} records)
            </p>
          </div>
          <div className="overflow-x-auto">
            <StudentTable students={students} />
          </div>
        </div>
      </div>
    </Layout>
  )
}

export default AdminDashboard