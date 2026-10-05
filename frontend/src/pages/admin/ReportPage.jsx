import { useEffect, useMemo, useState } from 'react'
import Layout from '../../components/common/Layout'
import Card from '../../components/common/Card'
import RiskDistributionPie from '../../components/charts/RiskDistributionPie'
import AttendanceBarChart from '../../components/charts/AttendanceBarChart'
import MarksBarChart from '../../components/charts/MarksBarChart'
import {
  getDashboardStats,
  getDepartmentReport,
  getSemesterReport,
} from '../../api/dashboard.api'
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
    const load = async () => {
      try {
        const [s, all, dept, sem] = await Promise.all([
          getDashboardStats(),
          getAllStudents(),
          getDepartmentReport(),
          getSemesterReport(),
        ])
        setStats(s)
        setStudents(Array.isArray(all) ? all : [])
        setDeptReport(dept || {})
        setSemReport(sem || {})
      } catch (err) {
        console.error('Failed to load reports:', err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const tabs = [
    { id: 'department', label: 'By Department', icon: Building2 },
    { id: 'semester', label: 'By Semester', icon: Calendar },
  ]

  const reportEntries = useMemo(() => {
    const source = activeTab === 'department' ? deptReport : semReport
    const entries = Object.entries(source || {})

    if (activeTab === 'semester') {
      return entries.sort((a, b) => {
        const na = Number(String(a[0]).match(/\d+/)?.[0] || 999)
        const nb = Number(String(b[0]).match(/\d+/)?.[0] || 999)
        return na - nb
      })
    }

    // department alphabetical
    return entries.sort((a, b) => String(a[0]).localeCompare(String(b[0])))
  }, [activeTab, deptReport, semReport])

  const getLabel = (key) => {
    const k = String(key || '').trim()

    if (activeTab === 'department') {
      // if backend sent 0/1/2 by mistake, show Unknown-#
      if (/^\d+$/.test(k)) return `Dept ${k}`
      return k.toUpperCase()
    }

    // semester tab
    if (/^\d+$/.test(k)) return `Semester ${k}`
    if (/sem(?:ester)?\s*\d+/i.test(k)) {
      const n = k.match(/\d+/)?.[0]
      return `Semester ${n}`
    }
    return k
  }

  const getBadgeText = (key) => {
    if (activeTab === 'department') {
      const label = getLabel(key)
      return label.length > 6 ? label.slice(0, 6) : label
    }
    const n = String(key).match(/\d+/)?.[0]
    return n ? `S${n}` : 'S?'
  }

  if (loading) return <Loader />

  return (
    <Layout title="Academic Reports" subtitle="Institution-wide risk analysis">
      <div className="space-y-6 animate-fade-in">
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
          <div>
            <RiskDistributionPie data={stats} />
          </div>
        </div>

        <Card>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-blue-600" />
              <h3 className="text-base font-semibold text-slate-900">Detailed Report Breakdown</h3>
            </div>

            <div className="flex bg-slate-50 p-1 rounded-xl border border-slate-200 w-full sm:w-auto">
              {tabs.map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => setActiveTab(id)}
                  className={clsx(
                    'flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all',
                    activeTab === id
                      ? 'bg-white text-blue-700 shadow-sm border border-slate-200/50'
                      : 'text-slate-500 hover:text-slate-700'
                  )}
                >
                  <Icon className="w-4 h-4" />
                  {label}
                </button>
              ))}
            </div>
          </div>

          {reportEntries.length === 0 ? (
            <div className="py-10 text-center text-sm text-slate-500">
              No report data available
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {reportEntries.map(([key, data]) => {
                const total = Number(data?.total || 0)
                const high = Number(data?.high || 0)
                const moderate = Number(data?.moderate || 0)
                const low = Number(data?.low || 0)
                const safeTotal = total > 0 ? total : 1

                const highPct = Math.round((high / safeTotal) * 100)
                const modPct = Math.round((moderate / safeTotal) * 100)
                const lowPct = Math.round((low / safeTotal) * 100)

                return (
                  <div
                    key={key}
                    className="flex flex-col gap-4 p-5 bg-slate-50 border border-slate-200 rounded-xl hover:border-blue-200 hover:shadow-sm transition-all"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 bg-blue-100 border border-blue-200 rounded-xl flex items-center justify-center shrink-0">
                        <p className="text-sm font-bold text-blue-700 text-center leading-tight">
                          {getBadgeText(key)}
                        </p>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-base font-bold text-slate-900 mb-0.5 truncate">
                          {getLabel(key)}
                        </p>
                        <p className="text-xs font-medium text-slate-500">
                          {total} students registered
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-3">
                      {[
                        { label: 'High', count: high, pct: highPct, color: 'bg-red-500', text: 'text-red-600' },
                        { label: 'Moderate', count: moderate, pct: modPct, color: 'bg-amber-500', text: 'text-amber-600' },
                        { label: 'Low', count: low, pct: lowPct, color: 'bg-emerald-500', text: 'text-emerald-600' },
                      ].map((item) => (
                        <div
                          key={item.label}
                          className="flex-1 bg-white p-2.5 rounded-lg border border-slate-100 shadow-sm"
                        >
                          <div className="flex justify-between items-baseline mb-1.5 gap-2">
                            <span className="text-[10px] uppercase font-bold text-slate-400">
                              {item.label}
                            </span>
                            <span className={`text-sm font-bold ${item.text}`}>{item.count}</span>
                          </div>
                          <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full ${item.color}`}
                              style={{ width: `${Math.min(item.pct, 100)}%` }}
                            />
                          </div>
                          <p className="text-[10px] text-slate-400 mt-1">{item.pct}%</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </Card>
      </div>
    </Layout>
  )
}

export default ReportPage