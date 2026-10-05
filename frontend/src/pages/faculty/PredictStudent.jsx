import { useState } from 'react'
import Layout from '../../components/common/Layout'
import Card from '../../components/common/Card'
import InputField from '../../components/common/InputField'
import SelectField from '../../components/common/SelectField'
import PredictionResult from '../../components/prediction/PredictionResult'
import { predictStudent } from '../../api/prediction.api'
import { Brain, RotateCcw, Sparkles } from 'lucide-react'
import toast, { Toaster } from 'react-hot-toast'
import { DEPARTMENTS, SEMESTERS, CP_NCP_OPTIONS } from '../../constants/riskLevels'
import { validateAttendance, validateMarks, validateSemester, validateStudentId } from '../../utils/validators'

const INITIAL_FORM = { student_id: '', name: '', attendance_pct: '', internal_marks: '', cp_ncp: 'CP', semester: '', department: 'CSE', previous_backlogs: '0' }

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
    if (!validateStudentId(form.student_id)) newErrors.student_id = 'Enter valid ID'
    if (!form.name.trim()) newErrors.name = 'Required'
    if (!validateAttendance(form.attendance_pct)) newErrors.attendance_pct = 'Invalid %'
    if (!validateMarks(form.internal_marks)) newErrors.internal_marks = 'Invalid marks'
    if (!validateSemester(form.semester)) newErrors.semester = 'Invalid'
    return newErrors
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length > 0) {
      setErrors(errs)
      toast.error('Please fix errors')
      return
    }
    try {
      setLoading(true)
      const res = await predictStudent(form)
      setResult(res)
      toast.success('Prediction generated!')
    } catch { toast.error('Prediction failed.') }
    finally { setLoading(false) }
  }

  return (
    <Layout title="Predict Student Risk">
      <Toaster position="top-right" />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-base font-semibold text-slate-900">Student Data</h3>
              <p className="text-xs text-slate-500 mt-0.5">Enter details to predict risk</p>
            </div>
            <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
              <Brain className="w-5 h-5 text-blue-600" />
            </div>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <InputField label="Student ID" name="student_id" value={form.student_id} onChange={handleChange} placeholder="STU001" error={errors.student_id} required />
              <InputField label="Full Name" name="name" value={form.name} onChange={handleChange} placeholder="Arjun Sharma" error={errors.name} required />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <InputField label="Attendance %" name="attendance_pct" type="number" value={form.attendance_pct} onChange={handleChange} placeholder="75" error={errors.attendance_pct} required />
              <InputField label="Internal Marks" name="internal_marks" type="number" value={form.internal_marks} onChange={handleChange} placeholder="65" error={errors.internal_marks} required />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <SelectField label="CP / NCP" name="cp_ncp" value={form.cp_ncp} onChange={handleChange} options={CP_NCP_OPTIONS} />
              <SelectField label="Department" name="department" value={form.department} onChange={handleChange} options={DEPARTMENTS.map(d => ({value: d, label: d}))} />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <SelectField label="Semester" name="semester" value={form.semester} onChange={handleChange} options={SEMESTERS.map(s => ({value: s, label: `Sem ${s}`}))} error={errors.semester} />
              <InputField label="Past Backlogs" name="previous_backlogs" type="number" value={form.previous_backlogs} onChange={handleChange} placeholder="0" />
            </div>
            <div className="flex gap-3 pt-4">
              <button type="submit" disabled={loading} className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold py-3 rounded-xl flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transition-all disabled:opacity-50">
                {loading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"/> : <Sparkles className="w-4 h-4" />}
                {loading ? 'Predicting...' : 'Generate Prediction'}
              </button>
              <button type="button" onClick={() => setForm(INITIAL_FORM)} className="px-4 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl transition-all border border-slate-200">
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          </form>
        </Card>
        <div>
          {result ? <PredictionResult result={result} /> : (
            <div className="h-full min-h-[300px] flex items-center justify-center border-2 border-dashed border-slate-200 rounded-2xl">
              <div className="text-center p-6">
                <Brain className="w-12 h-12 text-blue-200 mx-auto mb-3" />
                <p className="text-slate-600 font-medium">Awaiting Input</p>
                <p className="text-slate-400 text-sm mt-1">Fill the form to see AI risk assessment.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  )
}
export default PredictStudent