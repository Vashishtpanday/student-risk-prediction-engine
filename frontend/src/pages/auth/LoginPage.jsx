import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { loginUser } from '../../api/auth.api'
import { GraduationCap, Eye, EyeOff, Brain, Shield, Zap } from 'lucide-react'
import toast, { Toaster } from 'react-hot-toast'

const LoginPage = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!email.trim() || !password) {
      toast.error('Please fill in all fields')
      return
    }
    try {
      setLoading(true)
      const { user, token } = await loginUser(email.trim(), password)
      login(user, token)
      toast.success(`Welcome, ${user.name}!`)
      setTimeout(() => {
        if (user.role === 'student') navigate('/student/dashboard')
        else if (user.role === 'faculty') navigate('/faculty/dashboard')
        else navigate('/admin/dashboard')
      }, 600)
    } catch (err) {
      toast.error(err.message || 'Login failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const demoAccounts = [
    { label: 'Faculty Login', email: 'faculty@college.edu', color: 'border-indigo-200 hover:bg-indigo-50 hover:border-indigo-300' },
    { label: 'Student Login', email: 'student@college.edu', color: 'border-blue-200 hover:bg-blue-50 hover:border-blue-300' },
    { label: 'Admin Login', email: 'admin@college.edu', color: 'border-purple-200 hover:bg-purple-50 hover:border-purple-300' },
  ]

  const features = [
    { icon: Brain, title: 'AI-Powered Predictions', desc: 'ML models trained on academic data' },
    { icon: Shield, title: 'Early Intervention', desc: 'Identify at-risk students before exams' },
    { icon: Zap, title: 'Real-time Analysis', desc: 'Instant risk assessment and insights' },
  ]

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <Toaster
        position="top-right"
        toastOptions={{
          style: { background: '#ffffff', color: '#0f172a', border: '1px solid #e2e8f0', fontSize: '14px' },
        }}
      />

      <div className="hidden lg:flex flex-1 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 items-center justify-center p-14 relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(5)].map((_, i) => (
            <div key={i}
              className="absolute rounded-full border border-blue-200/30"
              style={{ width: `${(i + 1) * 180}px`, height: `${(i + 1) * 180}px`, top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}
            />
          ))}
          <div className="absolute top-20 right-20 w-32 h-32 bg-blue-200/30 rounded-full blur-3xl" />
          <div className="absolute bottom-20 left-20 w-40 h-40 bg-purple-200/30 rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-md">
          <div className="flex items-center gap-3 mb-10">
            <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-xl shadow-blue-500/30">
              <Brain className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900 leading-tight">Student Risk</h1>
              <h1 className="text-xl font-bold gradient-text leading-tight">Prediction Engine</h1>
            </div>
          </div>

          <h2 className="text-4xl font-bold text-slate-900 mb-3 leading-tight">
            AI-Powered Academic<br />Risk Intelligence
          </h2>
          <p className="text-slate-600 text-base mb-10 leading-relaxed">
            Early identification of academically at-risk students using advanced machine learning — enabling timely intervention and improved outcomes.
          </p>

          <div className="space-y-4">
            {features.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="flex items-center gap-4 p-4 bg-white/70 border border-white rounded-2xl backdrop-blur-sm shadow-sm">
                <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center shrink-0">
                  <Icon className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-900">{title}</p>
                  <p className="text-xs text-slate-600">{desc}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-10 pt-8 border-t border-slate-200 grid grid-cols-3 gap-4">
            {[['98%', 'Accuracy'], ['500+', 'Students Analyzed'], ['3x', 'Faster Alerts']].map(([val, lab]) => (
              <div key={lab} className="text-center">
                <p className="text-2xl font-bold gradient-text">{val}</p>
                <p className="text-xs text-slate-500 mt-1">{lab}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex-1 lg:max-w-md flex items-center justify-center p-8 bg-white">
        <div className="w-full max-w-sm">
          <div className="flex items-center gap-3 mb-10 lg:hidden">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
              <GraduationCap className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-bold text-slate-900">RiskPredict AI</span>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-bold text-slate-900 mb-1">Sign in</h2>
            <p className="text-slate-500 text-sm">Access your academic dashboard</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@college.edu"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100 transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 pr-11 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-3 rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-blue-500/30 mt-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Signing in...</span>
                </>
              ) : 'Sign In'}
            </button>
          </form>

          <div className="mt-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex-1 h-px bg-slate-200" />
              <p className="text-xs text-slate-500 font-medium">Demo Accounts</p>
              <div className="flex-1 h-px bg-slate-200" />
            </div>
            <p className="text-xs text-slate-500 text-center mb-3">Password for all: <span className="text-slate-700 font-mono bg-slate-100 px-2 py-0.5 rounded">password123</span></p>
            <div className="space-y-2">
              {demoAccounts.map(({ label, email: demoEmail, color }) => (
                <button
                  key={label}
                  onClick={() => { setEmail(demoEmail); setPassword('password123') }}
                  className={`w-full py-2.5 px-4 bg-white border rounded-xl text-sm text-slate-700 transition-all text-left flex items-center justify-between group ${color}`}
                >
                  <span className="font-medium">{label}</span>
                  <span className="text-xs text-slate-500 font-mono">{demoEmail}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default LoginPage