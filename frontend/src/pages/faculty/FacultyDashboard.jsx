import { useEffect, useState } from 'react'
import Layout from '../../components/common/Layout'
import StatCard from '../../components/common/StatCard'
import RiskDistributionPie from '../../components/charts/RiskDistributionPie'
import AttendanceBarChart from '../../components/charts/AttendanceBarChart'
import StudentTable from '../../components/student/StudentTable'
import { getAllStudents } from '../../api/student.api'
import { Users, AlertTriangle, TrendingUp, CheckCircle } from 'lucide-react'
import Loader from '../../components/common/Loader'

const FacultyDashboard = () => {
  const [students, setStudents] = useState([])
  const [highRisk, setHighRisk] = useState([])
  const [stats, setStats] = useState({ total: 0, high: 0, moderate: 0, low: 0 })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadAllData = async () => {
      try {
        const allStudents = await getAllStudents()
        setStudents(allStudents)

        const total = allStudents.length

        const hr = allStudents.filter((s) => {
          const r = String(s.latestRiskLevel || s.risk_category || s.riskCategory || '').toLowerCase()
          return r.includes('high')
        })

        const mr = allStudents.filter((s) => {
          const r = String(s.latestRiskLevel || s.risk_category || s.riskCategory || '').toLowerCase()
          return r.includes('mod') || r.includes('med')
        })

        const lr = allStudents.filter((s) => {
          const r = String(s.latestRiskLevel || s.risk_category || s.riskCategory || '').toLowerCase()
          return r.includes('low')
        })

        setHighRisk(hr)
        setStats({
          total,
          high: hr.length,
          moderate: mr.length,
          low: lr.length,
        })
      } catch (err) {
        console.error('Faculty Dashboard error:', err)
      } finally {
        setLoading(false)
      }
    }

    loadAllData()
  }, [])

  if (loading) return <Loader />

  return (
    <Layout title="Faculty Dashboard" subtitle="Real-time monitoring across all enrolled student records">
      <div className="space-y-6 animate-fade-in">
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          <StatCard title="Total Students" value={stats.total} icon={Users} color="indigo" subtitle="All registered records" />
          <StatCard title="High Risk" value={stats.high} icon={AlertTriangle} color="red" trend="up" trendValue={`${stats.high} students`} />
          <StatCard title="Moderate Risk" value={stats.moderate} icon={TrendingUp} color="amber" subtitle="Requires monitoring" />
          <StatCard title="Low Risk" value={stats.low} icon={CheckCircle} color="emerald" subtitle="Performing well" />
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <div className="xl:col-span-2 overflow-hidden">
            <AttendanceBarChart students={students} />
          </div>
          <div>
            <RiskDistributionPie data={stats} />
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
          <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-slate-900">High Risk Students ({highRisk.length})</h3>
              <p className="text-xs text-slate-500 mt-0.5">Students requiring immediate faculty intervention</p>
            </div>
            <span className="px-3 py-1 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs font-semibold">
              {highRisk.length} High Risk
            </span>
          </div>
          <div className="overflow-x-auto">
            <StudentTable students={highRisk} showActions={true} />
          </div>
        </div>
      </div>
    </Layout>
  )
}

export default FacultyDashboard