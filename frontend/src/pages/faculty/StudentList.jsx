import { useState, useEffect } from 'react'
import Sidebar from '../../components/common/Sidebar'
import Navbar from '../../components/common/Navbar'
import StudentTable from '../../components/student/StudentTable'
import { getAllStudents } from '../../api/student.api'
import { Search, SlidersHorizontal } from 'lucide-react'
import clsx from 'clsx'
import Loader from '../../components/common/Loader'
import { DEPARTMENTS } from '../../constants/riskLevels'

const RISK_FILTERS = ['All', 'High Risk', 'Moderate Risk', 'Low Risk']

const StudentList = () => {
  const [students, setStudents] = useState([])
  const [filtered, setFiltered] = useState([])
  const [search, setSearch] = useState('')
  const [riskFilter, setRiskFilter] = useState('All')
  const [deptFilter, setDeptFilter] = useState('All')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getAllStudents().then((data) => { setStudents(data); setFiltered(data); setLoading(false) })
  }, [])

  useEffect(() => {
    let result = [...students]
    if (riskFilter !== 'All') result = result.filter((s) => s.risk_category === riskFilter)
    if (deptFilter !== 'All') result = result.filter((s) => s.department === deptFilter)
    if (search.trim()) {
      const q = search.toLowerCase()
      result = result.filter((s) =>
        s.name.toLowerCase().includes(q) || s.student_id.toLowerCase().includes(q) ||
        s.department.toLowerCase().includes(q) || s.email.toLowerCase().includes(q)
      )
    }
    setFiltered(result)
  }, [search, riskFilter, deptFilter, students])

  if (loading) return <Loader />

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />
      <div className="flex-1 ml-64">
        <Navbar title="All Students" subtitle={`${filtered.length} of ${students.length} students`} />
        <main className="p-6 animate-fade-in">
          <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
            <div className="p-5 border-b border-slate-200 space-y-4">
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search by name, ID, email or department..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:bg-white transition-all"
                  />
                </div>
                <select
                  value={deptFilter}
                  onChange={(e) => setDeptFilter(e.target.value)}
                  className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-blue-500 focus:bg-white transition-all"
                >
                  <option value="All">All Departments</option>
                  {DEPARTMENTS.map((d) => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <SlidersHorizontal className="w-3.5 h-3.5 text-slate-400" />
                <span className="text-xs text-slate-500 mr-1">Risk:</span>
                {RISK_FILTERS.map((f) => (
                  <button
                    key={f}
                    onClick={() => setRiskFilter(f)}
                    className={clsx(
                      'px-3 py-1.5 rounded-lg text-xs font-medium transition-all border',
                      riskFilter === f
                        ? 'bg-blue-50 text-blue-700 border-blue-200'
                        : 'bg-white text-slate-600 border-slate-200 hover:text-slate-900 hover:border-slate-300'
                    )}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>
            <StudentTable students={filtered} showActions={true} />
          </div>
        </main>
      </div>
    </div>
  )
}

export default StudentList