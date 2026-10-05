import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import Layout from '../../components/common/Layout'
import StudentTable from '../../components/student/StudentTable'
import { getAllStudents } from '../../api/student.api'
import { Search, SlidersHorizontal } from 'lucide-react'
import clsx from 'clsx'
import Loader from '../../components/common/Loader'
import { DEPARTMENTS } from '../../constants/riskLevels'

const RISK_FILTERS = ['All', 'High Risk', 'Moderate Risk', 'Low Risk']

const StudentList = () => {
  const [searchParams, setSearchParams] = useSearchParams()
  const initialSearch = searchParams.get('search') || ''

  const [students, setStudents] = useState([])
  const [filtered, setFiltered] = useState([])
  const [search, setSearch] = useState(initialSearch)
  const [riskFilter, setRiskFilter] = useState('All')
  const [deptFilter, setDeptFilter] = useState('All')
  const [loading, setLoading] = useState(true)

  // Sync search state if URL parameter changes
  useEffect(() => {
    const urlQuery = searchParams.get('search') || ''
    setSearch(urlQuery)
  }, [searchParams])

  useEffect(() => {
    const loadAll = async () => {
      try {
        const data = await getAllStudents()
        setStudents(data)
        setFiltered(data)
      } catch (err) {
        console.error('Failed to load students:', err)
      } finally {
        setLoading(false)
      }
    }
    loadAll()
  }, [])

  // Comprehensive multi-field filtering across the entire dataset
  useEffect(() => {
    let result = [...students]

    // 1. Department Filter
    if (deptFilter !== 'All') {
      result = result.filter(
        (s) => String(s.department || '').toUpperCase() === deptFilter.toUpperCase()
      )
    }

    // 2. Risk Level Filter
    if (riskFilter !== 'All') {
      const target = riskFilter.toLowerCase().replace(' risk', '')
      result = result.filter((s) => {
        const r = String(s.latestRiskLevel || s.risk_category || s.riskCategory || '').toLowerCase()
        return r.includes(target)
      })
    }

    // 3. Search Query Filter (Name, Student ID, Email, Department)
    if (search.trim()) {
      const q = search.toLowerCase().trim()
      result = result.filter((s) => {
        const name = String(s.name || '').toLowerCase()
        const id = String(s.studentId || s.student_id || s._id || '').toLowerCase()
        const email = String(s.email || '').toLowerCase()
        const dept = String(s.department || '').toLowerCase()
        return name.includes(q) || id.includes(q) || email.includes(q) || dept.includes(q)
      })
    }

    setFiltered(result)
  }, [search, riskFilter, deptFilter, students])

  const handleSearchChange = (e) => {
    const val = e.target.value
    setSearch(val)
    if (val.trim()) {
      setSearchParams({ search: val.trim() }, { replace: true })
    } else {
      setSearchParams({}, { replace: true })
    }
  }

  if (loading) return <Loader />

  return (
    <Layout title="All Students Monitoring" subtitle={`Displaying ${filtered.length} of ${students.length} total registered records`}>
      <div className="space-y-4 animate-fade-in">
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
          <div className="p-5 border-b border-slate-200 space-y-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search by student name, ID, email, or department..."
                  value={search}
                  onChange={handleSearchChange}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:bg-white transition-all"
                />
              </div>
              <select
                value={deptFilter}
                onChange={(e) => setDeptFilter(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-900 font-medium focus:outline-none focus:border-blue-500 focus:bg-white transition-all"
              >
                <option value="All">All Departments</option>
                {DEPARTMENTS.map((d) => (
                  <option key={d} value={d}>
                    {d} Department
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <SlidersHorizontal className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-xs text-slate-500 font-medium mr-1">Risk Filter:</span>
              {RISK_FILTERS.map((f) => (
                <button
                  key={f}
                  onClick={() => setRiskFilter(f)}
                  className={clsx(
                    'px-3 py-1.5 rounded-lg text-xs font-medium transition-all border',
                    riskFilter === f
                      ? 'bg-blue-50 text-blue-700 border-blue-200 shadow-xs'
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
      </div>
    </Layout>
  )
}

export default StudentList