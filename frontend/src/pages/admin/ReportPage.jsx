import { useEffect, useState } from 'react'
import Sidebar from '../../components/common/Sidebar'
import Navbar from '../../components/common/Navbar'
import Card from '../../components/common/Card'
import RiskDistributionPie from '../../components/charts/RiskDistributionPie'
import AttendanceBarChart from '../../components/charts/AttendanceBarChart'
import MarksBarChart from '../../components/charts/MarksBarChart'
import { getDashboardStats, getDepartmentReport, getSemesterReport } from '../../api/dashboard.api'
import { getAllStudents } from '../../api/student.api'
import { Download, BarChart3, Building2, Calendar } from 'lucide-react'
import Loader from '../../components/common/Loader'
import clsx from 'clsx'

const ReportPage = () => {
  const [stats, setStats] = useState(null)
  const [students, setStudents] = useState([])
  const [deptReport, setDeptReport] = useState({})
  const [semReport, setSemReport] = useState({})
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('department')

  useEffect(() => {
    Promise.all([getDashboardStats(), getAllStudents(), getDepartmentReport(), getSemesterReport()])
      .then(([s, all, dept, sem]) => { setStats(s); setStudents(all); setDeptReport(dept); setSemReport(sem) })
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <Loader />

  const tabs = [
    { id: 'department', label: 'By Department', icon: Building2 },
    { id: 'semester', label: 'By Semester', icon: Calendar },
  ]
  const reportData = activeTab === 'department' ? deptReport : semReport

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />
      <div className="flex-1 ml-64">
        <Navbar title="Academic Reports" subtitle="Institution-wide risk analysis" />
        <main className="p-6 space-y-6 animate-fade-in">
          <div className="flex justify-end">
            <button className="flex items-center gap-2 px-4 py-2.5 bg-blue-50 border border-blue-200 text-blue-700 rounded-xl text-sm font-medium hover:bg-blue-100 transition-all">
              <Download className="w-4 h-4" />
              Export Report
            </button>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            <div className="xl:col-span-2 space-y-6">
              <AttendanceBarChart students={students} />
              <MarksBarChart students={students} />
            </div>
            <RiskDistributionPie data={stats} />
          </div>

          <Card>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-blue-600" />
                <h3 className="text-sm font-semibold text-slate-900">Detailed Report</h3>
              </div>
              <div className="flex gap-2">
                {tabs.map(({ id, label, icon: Icon }) => (
                  <button key={id} onClick={() => setActiveTab(id)}
                    className={clsx('flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all border',
                      activeTab === id ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-white text-slate-600 border-slate-200 hover:text-slate-900 hover:border-slate-300'
                    )}>
                    <Icon className="w-3 h-3" />
                    {label}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              {Object.entries(reportData).map(([key, data]) => (
                <div key={key} className="flex items-center gap-4 p-4 bg-slate-50 border border-slate-200 rounded-xl">
                  <div className="w-16 h-16 bg-blue-100 border border-blue-200 rounded-xl flex items-center justify-center shrink-0">
                    <p className="text-xs font-bold text-blue-700 text-center leading-tight">{key}</p>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm font-semibold text-slate-900">{key}</p>
                      <p className="text-xs text-slate-500">{data.total} students total</p>
                    </div>
                    <div className="flex gap-2">
                      {[
                        { label: 'High', count: data.high, color: 'bg-red-500' },
                        { label: 'Moderate', count: data.moderate, color: 'bg-amber-500' },
                        { label: 'Low', count: data.low, color: 'bg-emerald-500' },
                      ].map(({ label, count, color }) => (
                        <div key={label} className="flex-1">
                          <div className="flex justify-between text-xs mb-1">
                            <span className="text-slate-600">{label}</span>
                            <span className="text-slate-900 font-medium">{count}</span>
                          </div>
                          <div className="h-1.5 bg-slate-200 rounded-full overflow-hidden">
                            <div className={`h-full rounded-full ${color}`} style={{ width: `${data.total > 0 ? (count / data.total) * 100 : 0}%` }} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </main>
      </div>
    </div>
  )
}

export default ReportPage