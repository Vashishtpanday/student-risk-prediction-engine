import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { loginUser } from '../../api/auth.api'
import { GraduationCap, Eye, EyeOff, Brain, Shield, Zap, Sparkles } from 'lucide-react'
import toast, { Toaster } from 'react-hot-toast'

const LoginPage = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState('faculty') // Default selected role
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleLogin = async (e, customEmail, customPassword, customRole) => {
    if (e) {
      e.preventDefault()
      e.stopPropagation()
    }
    
    const targetEmail = (customEmail || email).trim()
    const targetPassword = (customPassword || password).trim()
    const targetRole = customRole || role || (targetEmail.includes('faculty') ? 'faculty' : targetEmail.includes('admin') ? 'admin' : 'student')

    if (!targetEmail || !targetPassword) {
      toast.error('Please enter email and password')
      return
    }

    try {
      setLoading(true)
      console.log(' Initiating Login:', { email: targetEmail, role: targetRole })

      const authData = await loginUser(targetEmail, targetPassword, targetRole)

      console.log('Login Successful:', authData)
      
      const { user, token } = authData
      login(user, token)
      toast.success(`Welcome, ${user.name || 'User'}!`)

      setTimeout(() => {
        if (user.role === 'student') navigate('/student/dashboard')
        else if (user.role === 'faculty') navigate('/faculty/dashboard')
        else navigate('/admin/dashboard')
      }, 400)

    } catch (err) {
      console.error(' Login Failed:', err)
      toast.error(err.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  const demoAccounts = [
    {
      label: 'Faculty Login',
      email: 'faculty@college.edu',
      password: 'password123',
      role: 'faculty',
      color: 'border-indigo-200 hover:bg-indigo-50 hover:border-indigo-300',
    },
    {
      label: 'Student Login',
      email: 'student@college.edu',
      password: 'password123',
      role: 'student',
      color: 'border-blue-200 hover:bg-blue-50 hover:border-blue-300',
    },
    {
      label: 'Admin Login',
      email: 'admin@college.edu',
      password: 'password123',
      role: 'admin',
      color: 'border-purple-200 hover:bg-purple-50 hover:border-purple-300',
    },
  ]

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <Toaster position="top-right" />

      {/* Left Banner */}
      <div className="hidden lg:flex flex-1 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 items-center justify-center p-14">
        <div className="max-w-md">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-xl">
              <Brain className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900">Student Risk</h1>
              <h1 className="text-xl font-bold text-blue-700">Prediction Engine</h1>
            </div>
          </div>

          <h2 className="text-4xl font-bold text-slate-900 mb-3 leading-tight">
            AI-Powered Academic<br />Risk Intelligence
          </h2>
          <p className="text-slate-600 mb-8">
            Early identification of at-risk students with ML predictions, recommendations, and faculty insights.
          </p>

          <div className="space-y-3">
            <div className="flex items-center gap-3 p-4 bg-white rounded-2xl border border-slate-200 shadow-sm">
              <Shield className="w-5 h-5 text-blue-600" />
              <p className="text-sm text-slate-700">Secure role-based access via backend JWT</p>
            </div>
            <div className="flex items-center gap-3 p-4 bg-white rounded-2xl border border-slate-200 shadow-sm">
              <Zap className="w-5 h-5 text-blue-600" />
              <p className="text-sm text-slate-700">Realtime ML prediction and AI assistant</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right Login Form */}
      <div className="flex-1 lg:max-w-md flex items-center justify-center p-8 bg-white">
        <div className="w-full max-w-sm">
          <div className="flex items-center gap-3 mb-8 lg:hidden">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
              <GraduationCap className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-bold text-slate-900">RiskPredict AI</span>
          </div>

          <h2 className="text-2xl font-bold text-slate-900 mb-1">Sign in</h2>
          <p className="text-slate-500 text-sm mb-6">Enter your credentials or select a quick demo login</p>

          <form onSubmit={(e) => handleLogin(e)} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@college.edu"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500 focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 pr-11 text-sm focus:outline-none focus:border-blue-500 focus:bg-white"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Role</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500 focus:bg-white"
              >
                <option value="faculty">Faculty</option>
                <option value="student">Student</option>
                <option value="admin">Admin</option>
              </select>
            </div>

            <button
              type="button"
              onClick={(e) => handleLogin(e)}
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold py-3 rounded-xl disabled:opacity-50 transition-all shadow-md shadow-blue-500/20"
            >
              {loading ? 'Processing...' : 'Sign In'}
            </button>
          </form>

          {/* Quick Demo Login Buttons */}
          <div className="mt-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex-1 h-px bg-slate-200" />
              <p className="text-xs text-slate-500 font-medium flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-blue-600" /> Quick Login
              </p>
              <div className="flex-1 h-px bg-slate-200" />
            </div>

            <div className="space-y-2">
              {demoAccounts.map(({ label, email: demoEmail, password: demoPassword, role: demoRole, color }) => (
                <button
                  key={label}
                  type="button"
                  onClick={(e) => handleLogin(e, demoEmail, demoPassword, demoRole)}
                  className={`w-full py-2.5 px-4 bg-white border rounded-xl text-sm text-slate-700 transition-all text-left flex items-center justify-between group ${color}`}
                >
                  <span className="font-medium">{label}</span>
                  <span className="text-xs text-slate-400 font-mono">{demoEmail}</span>
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