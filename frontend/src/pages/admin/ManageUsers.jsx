import { useEffect, useState } from 'react'
import Layout from '../../components/common/Layout'
import Card from '../../components/common/Card'
import Modal from '../../components/common/Modal'
import InputField from '../../components/common/InputField'
import SelectField from '../../components/common/SelectField'
import Button from '../../components/common/Button'
import Badge from '../../components/common/Badge'
import Loader from '../../components/common/Loader'
import { getAllStudents, addStudent, deleteStudent } from '../../api/student.api'
import { DEPARTMENTS, SEMESTERS, CP_NCP_OPTIONS } from '../../constants/riskLevels'
import { UserPlus, Trash2, Search, RefreshCw } from 'lucide-react'
import toast, { Toaster } from 'react-hot-toast'

const INITIAL = {
  name: '',
  email: '',
  student_id: '',
  department: 'CSE',
  semester: '1',
  cp_ncp: 'CP',
  attendance_pct: '',
  internal_marks: '',
  previous_backlogs: '0',
}

const ManageUsers = () => {
  const [students, setStudents] = useState([])
  const [filtered, setFiltered] = useState([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [form, setForm] = useState(INITIAL)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const loadData = async () => {
    try {
      setLoading(true)
      setError('')
      const data = await getAllStudents()
      const list = Array.isArray(data) ? data : []
      setStudents(list)
      setFiltered(list)
      if (list.length === 0) {
        setError('No students returned from backend. Check /api/students response.')
      }
    } catch (err) {
      console.error('Load students failed:', err)
      setStudents([])
      setFiltered([])
      setError(err.message || 'Failed to load students from backend')
      toast.error(err.message || 'Failed to load students')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  useEffect(() => {
    if (!search.trim()) {
      setFiltered(students)
      return
    }
    const q = search.toLowerCase()
    setFiltered(
      students.filter((s) => {
        const name = String(s.name || '').toLowerCase()
        const id = String(s.studentId || s.student_id || s._id || '').toLowerCase()
        const email = String(s.email || '').toLowerCase()
        const dept = String(s.department || '').toLowerCase()
        return name.includes(q) || id.includes(q) || email.includes(q) || dept.includes(q)
      })
    )
  }, [search, students])

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleAdd = async (e) => {
    e.preventDefault()

    if (!form.name || !form.email || !form.student_id || form.attendance_pct === '' || form.internal_marks === '') {
      toast.error('Please fill all required fields')
      return
    }

    try {
      setSaving(true)

      const studentIdVal = String(form.student_id).trim().toUpperCase()
      const att = Number(form.attendance_pct)
      const marks = Number(form.internal_marks)
      const sem = Number(form.semester)
      const backlogs = Number(form.previous_backlogs || 0)

      const payload = {
        // camelCase (Roopa schema)
        studentId: studentIdVal,
        name: form.name.trim(),
        email: form.email.trim().toLowerCase(),
        department: form.department,
        semester: sem,
        attendancePercentage: att,
        internalMarksAverage: marks,
        cpNcpStatus: form.cp_ncp,
        previousBacklogs: backlogs,
        latestRiskLevel: 'LOW',
        isActive: true,

        // snake_case aliases
        student_id: studentIdVal,
        attendance_pct: att,
        internal_marks: marks,
        cp_ncp: form.cp_ncp,
        previous_backlogs: backlogs,
        risk_category: 'Low Risk',
      }

      await addStudent(payload)
      toast.success('Student added to MongoDB')
      setModalOpen(false)
      setForm(INITIAL)
      await loadData()
    } catch (err) {
      console.error('Add failed:', err)
      toast.error(err.message || 'Failed to add student')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (student) => {
    const targetId = student._id || student.id || student.studentId || student.student_id
    const name = student.name || 'this student'

    if (!targetId) {
      toast.error('Student id missing')
      return
    }

    const ok = window.confirm(`Delete "${name}" permanently from database?`)
    if (!ok) return

    try {
      toast.loading('Deleting...', { id: 'del' })
      await deleteStudent(targetId)
      toast.success('Student deleted', { id: 'del' })
      await loadData()
    } catch (err) {
      console.error('Delete failed:', err)
      toast.error(err.message || 'Delete failed', { id: 'del' })
    }
  }

  if (loading) return <Loader />

  return (
    <Layout title="Manage Users" subtitle={`${students.length} students in database`}>
      <Toaster position="top-right" />

      <div className="space-y-4">
        <Card>
          <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by name, ID, email, department..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2.5 text-sm focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="flex gap-2">
              <Button variant="secondary" icon={RefreshCw} onClick={loadData}>
                Refresh
              </Button>
              <Button icon={UserPlus} onClick={() => setModalOpen(true)}>
                Add Student
              </Button>
            </div>
          </div>

          {error && (
            <div className="mt-4 p-3 rounded-xl bg-red-50 border border-red-200 text-sm text-red-700">
              {error}
            </div>
          )}

          <div className="mt-5 space-y-2">
            {filtered.length === 0 ? (
              <div className="py-12 text-center text-sm text-slate-500">
                No students to display
              </div>
            ) : (
              filtered.map((s) => {
                const sId = s.studentId || s.student_id || s._id
                const risk = s.latestRiskLevel || s.risk_category || s.riskCategory || 'Low Risk'
                return (
                  <div
                    key={s._id || sId}
                    className="flex items-center justify-between p-4 bg-slate-50 border border-slate-200 rounded-xl"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white font-bold flex items-center justify-center">
                        {(s.name || 'S').charAt(0)}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="text-sm font-semibold text-slate-900">{s.name}</p>
                          <Badge risk={risk} />
                        </div>
                        <p className="text-xs text-slate-500 truncate">
                          {sId} • {s.email} • {s.department} Sem {s.semester}
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleDelete(s)}
                      className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg"
                      title="Delete student"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                )
              })
            )}
          </div>
        </Card>
      </div>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Add New Student" size="lg">
        <form onSubmit={handleAdd} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <InputField label="Full Name" name="name" value={form.name} onChange={handleChange} required />
            <InputField label="Student ID" name="student_id" value={form.student_id} onChange={handleChange} required />
          </div>

          <InputField label="Email" name="email" type="email" value={form.email} onChange={handleChange} required />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <SelectField
              label="Department"
              name="department"
              value={form.department}
              onChange={handleChange}
              options={DEPARTMENTS.map((d) => ({ value: d, label: d }))}
              required
            />
            <SelectField
              label="Semester"
              name="semester"
              value={form.semester}
              onChange={handleChange}
              options={SEMESTERS.map((s) => ({ value: String(s), label: `Semester ${s}` }))}
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <InputField
              label="Attendance %"
              name="attendance_pct"
              type="number"
              value={form.attendance_pct}
              onChange={handleChange}
              required
            />
            <InputField
              label="Internal Marks"
              name="internal_marks"
              type="number"
              value={form.internal_marks}
              onChange={handleChange}
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <SelectField
              label="CP/NCP"
              name="cp_ncp"
              value={form.cp_ncp}
              onChange={handleChange}
              options={CP_NCP_OPTIONS}
              required
            />
            <InputField
              label="Previous Backlogs"
              name="previous_backlogs"
              type="number"
              value={form.previous_backlogs}
              onChange={handleChange}
            />
          </div>

          <div className="flex gap-3 pt-2">
            <Button type="submit" loading={saving} className="flex-1">
              Save to MongoDB
            </Button>
            <Button type="button" variant="secondary" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
          </div>
        </form>
      </Modal>
    </Layout>
  )
}

export default ManageUsers