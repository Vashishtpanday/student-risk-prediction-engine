import { useState, useEffect } from 'react'
import Sidebar from '../../components/common/Sidebar'
import Navbar from '../../components/common/Navbar'
import Card from '../../components/common/Card'
import Modal from '../../components/common/Modal'
import InputField from '../../components/common/InputField'
import SelectField from '../../components/common/SelectField'
import Button from '../../components/common/Button'
import { getAllStudents, addStudent } from '../../api/student.api'
import { UserPlus, Trash2, Search } from 'lucide-react'
import Badge from '../../components/common/Badge'
import toast, { Toaster } from 'react-hot-toast'
import { DEPARTMENTS, SEMESTERS, CP_NCP_OPTIONS } from '../../constants/riskLevels'
import Loader from '../../components/common/Loader'

const INITIAL = { name: '', email: '', student_id: '', department: 'CSE', semester: '1', cp_ncp: 'CP', attendance_pct: '', internal_marks: '', previous_backlogs: '0' }

const ManageUsers = () => {
  const [students, setStudents] = useState([])
  const [filtered, setFiltered] = useState([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [form, setForm] = useState(INITIAL)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    getAllStudents().then((data) => { setStudents(data); setFiltered(data); setLoading(false) })
  }, [])

  useEffect(() => {
    if (!search.trim()) { setFiltered(students); return }
    const q = search.toLowerCase()
    setFiltered(students.filter((s) => s.name.toLowerCase().includes(q) || s.student_id.toLowerCase().includes(q) || s.email.toLowerCase().includes(q)))
  }, [search, students])

  const handleChange = (e) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }))

  const handleAdd = async (e) => {
    e.preventDefault()
    try {
      setSaving(true)
      const newStudent = await addStudent({ ...form, attendance_pct: parseFloat(form.attendance_pct), internal_marks: parseFloat(form.internal_marks), semester: parseInt(form.semester), previous_backlogs: parseInt(form.previous_backlogs), risk_category: 'Low Risk' })
      setStudents((p) => [newStudent, ...p])
      setModalOpen(false)
      setForm(INITIAL)
      toast.success('Student added successfully')
    } catch { toast.error('Failed to add student') }
    finally { setSaving(false) }
  }

  if (loading) return <Loader />

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Toaster position="top-right" toastOptions={{ style: { background: '#ffffff', color: '#0f172a', border: '1px solid #e2e8f0' } }} />
      <Sidebar />
      <div className="flex-1 ml-64">
        <Navbar title="Manage Users" subtitle={`${students.length} students registered`} />
        <main className="p-6 space-y-6 animate-fade-in">
          <Card>
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <div className="relative flex-1 max-w-sm">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input type="text" placeholder="Search students..." value={search} onChange={(e) => setSearch(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:bg-white transition-all" />
              </div>
              <Button icon={UserPlus} onClick={() => setModalOpen(true)}>Add Student</Button>
            </div>

            <div className="mt-6 space-y-2">
              {filtered.map((s) => (
                <div key={s._id} className="flex items-center justify-between p-4 bg-slate-50 border border-slate-200 rounded-xl hover:border-slate-300 hover:shadow-sm transition-all">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center text-white font-bold text-sm shadow-md">
                      {s.name.charAt(0)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold text-slate-900">{s.name}</p>
                        <Badge risk={s.risk_category} />
                      </div>
                      <p className="text-xs text-slate-500">{s.student_id} • {s.email} • {s.department} Sem {s.semester}</p>
                    </div>
                  </div>
                  <button className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </Card>
        </main>
      </div>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Add New Student" size="lg">
        <form onSubmit={handleAdd} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <InputField label="Full Name" name="name" value={form.name} onChange={handleChange} placeholder="Arjun Sharma" required />
            <InputField label="Student ID" name="student_id" value={form.student_id} onChange={handleChange} placeholder="STU011" required />
          </div>
          <InputField label="Email" name="email" type="email" value={form.email} onChange={handleChange} placeholder="student@college.edu" required />
          <div className="grid grid-cols-2 gap-4">
            <SelectField label="Department" name="department" value={form.department} onChange={handleChange} options={DEPARTMENTS.map((d) => ({ value: d, label: d }))} required />
            <SelectField label="Semester" name="semester" value={form.semester} onChange={handleChange} options={SEMESTERS.map((s) => ({ value: s, label: `Semester ${s}` }))} required />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <InputField label="Attendance %" name="attendance_pct" type="number" value={form.attendance_pct} onChange={handleChange} placeholder="75.5" required />
            <InputField label="Internal Marks" name="internal_marks" type="number" value={form.internal_marks} onChange={handleChange} placeholder="65" required />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <SelectField label="CP/NCP Status" name="cp_ncp" value={form.cp_ncp} onChange={handleChange} options={CP_NCP_OPTIONS} required />
            <InputField label="Previous Backlogs" name="previous_backlogs" type="number" value={form.previous_backlogs} onChange={handleChange} placeholder="0" />
          </div>
          <div className="flex gap-3 pt-2">
            <Button type="submit" loading={saving} className="flex-1">Add Student</Button>
            <Button variant="secondary" onClick={() => setModalOpen(false)} type="button">Cancel</Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}

export default ManageUsers