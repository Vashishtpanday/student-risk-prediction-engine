import { useState } from 'react'
import Sidebar from '../../components/common/Sidebar'
import Navbar from '../../components/common/Navbar'
import Card from '../../components/common/Card'
import InputField from '../../components/common/InputField'
import SelectField from '../../components/common/SelectField'
import PredictionResult from '../../components/prediction/PredictionResult'
import { predictStudent } from '../../api/prediction.api'
import { Brain, RotateCcw, Sparkles } from 'lucide-react'
import toast, { Toaster } from 'react-hot-toast'
import { DEPARTMENTS, SEMESTERS, CP_NCP_OPTIONS } from '../../constants/riskLevels'
import { validateAttendance, validateMarks, validateSemester, validateStudentId } from '../../utils/validators'

const INITIAL_FORM = {
  student_id: '', name: '', attendance_pct: '', internal_marks: '',
  cp_ncp: 'CP', semester: '', department: 'CSE', previous_backlogs: '0',
}

const PredictStudent = () => {
  const [form, setForm] = useState(INITIAL_FORM)
  const [errors, setErrors] = useState({})
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }))
  }

  const validate = () => {
    const newErrors = {}
    if (!validateStudentId(form.student_id)) newErrors.student_id = 'Enter a valid student ID'
    if (!form.name.trim()) newErrors.name = 'Name is required'
    if (!validateAttendance(form.attendance_pct)) newErrors.attendance_pct = 'Enter valid attendance (0-100)'
    if (!validateMarks(form.internal_marks)) newErrors.internal_marks = 'Enter valid marks (0-100)'
    if (!validateSemester(form.semester)) newErrors.semester = 'Enter valid semester (1-8)'
    return newErrors
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length > 0) {
      setErrors(errs)
      toast.error('Please fix the errors before submitting')
      return
    }
    try {
      setLoading(true)
      const payload = {
        ...form,
        attendance_pct: parseFloat(form.attendance_pct),
        internal_marks: parseFloat(form.internal_marks),
        semester: parseInt(form.semester),
        previous_backlogs: parseInt(form.previous_backlogs),
      }
      const res = await predictStudent(payload)
      setResult(res)
      toast.success('Prediction generated successfully!')
    } catch { toast.error('Prediction failed. Please try again.') }
    finally { setLoading(false) }
  }

  const handleReset = () => {
    setForm(INITIAL_FORM)
    setResult(null)
    setErrors({})
  }

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Toaster position="top-right" toastOptions={{ style: { background: '#ffffff', color: '#0f172a', border: '1px solid #e2e8f0' } }} />
      <Sidebar />
      <div className="flex-1 ml-64">
        <Navbar title="Predict Student Risk" />
        <main className="p-6 animate-fade-in">
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            <div className="space-y-4">
              <Card>
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-base font-semibold text-slate-900">Student Academic Data</h3>
                    <p className="text-xs text-slate-500 mt-0.5">Enter details to generate AI risk prediction</p>
                  </div>
                  <div className="w-10 h-10 bg-blue-100 border border-blue-200 rounded-xl flex items-center justify-center">
                    <Brain className="w-5 h-5 text-blue-600" />
                  </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <InputField label="Student ID" name="student_id" value={form.student_id} onChange={handleChange} placeholder="STU001" required error={errors.student_id} />
                    <InputField label="Full Name" name="name" value={form.name} onChange={handleChange} placeholder="Arjun Sharma" required error={errors.name} />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <InputField label="Attendance %" name="attendance_pct" type="number" value={form.attendance_pct} onChange={handleChange} placeholder="75.5" required error={errors.attendance_pct} hint="Between 0 and 100" />
                    <InputField label="Internal Marks" name="internal_marks" type="number" value={form.internal_marks} onChange={handleChange} placeholder="65" required error={errors.internal_marks} hint="Out of 100" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <SelectField label="CP / NCP Status" name="cp_ncp" value={form.cp_ncp} onChange={handleChange} options={CP_NCP_OPTIONS} required />
                    <SelectField label="Department" name="department" value={form.department} onChange={handleChange} options={DEPARTMENTS.map((d) => ({ value: d, label: d }))} required />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <SelectField label="Semester" name="semester" value={form.semester} onChange={handleChange} options={[{ value: '', label: 'Select Semester' }, ...SEMESTERS.map((s) => ({ value: s, label: `Semester ${s}` }))]} error={errors.semester} required />
                    <InputField label="Previous Backlogs" name="previous_backlogs" type="number" value={form.previous_backlogs} onChange={handleChange} placeholder="0" hint="Number of backlogs" />
                  </div>

                  <div className="flex gap-3 pt-2">
                    <button type="submit" disabled={loading}
                      className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-3 rounded-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-blue-500/30">
                      {loading ? (
                        <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /><span>Predicting...</span></>
                      ) : (
                        <><Sparkles className="w-4 h-4" /><span>Generate Prediction</span></>
                      )}
                    </button>
                    <button type="button" onClick={handleReset} className="px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-all border border-slate-200" title="Reset form">
                      <RotateCcw className="w-4 h-4" />
                    </button>
                  </div>
                </form>
              </Card>
            </div>

            <div>
              {result ? (
                <PredictionResult result={result} />
              ) : (
                <div className="h-full flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-24 h-24 bg-blue-50 border border-blue-100 rounded-3xl flex items-center justify-center mx-auto mb-5">
                      <Brain className="w-12 h-12 text-blue-400" />
                    </div>
                    <p className="text-slate-900 font-semibold mb-1">Awaiting Input</p>
                    <p className="text-slate-500 text-sm">Fill in the student details and click Generate Prediction.</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}

export default PredictStudent