import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import {
  LayoutDashboard, Users, Brain, MessageSquare,
  BarChart3, LogOut, GraduationCap, Star,
  ChevronRight, UserCog
} from 'lucide-react'
import clsx from 'clsx'

const studentLinks = [
  { to: '/student/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/student/prediction', icon: Brain, label: 'My Risk' },
  { to: '/student/recommendations', icon: Star, label: 'Recommendations' },
]

const facultyLinks = [
  { to: '/faculty/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/faculty/students', icon: Users, label: 'All Students' },
  { to: '/faculty/predict', icon: Brain, label: 'Predict Risk' },
  { to: '/faculty/assistant', icon: MessageSquare, label: 'AI Assistant' },
]

const adminLinks = [
  { to: '/admin/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/admin/reports', icon: BarChart3, label: 'Reports' },
  { to: '/admin/users', icon: UserCog, label: 'Manage Users' },
]

const Sidebar = () => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const links =
    user?.role === 'student' ? studentLinks
    : user?.role === 'faculty' ? facultyLinks
    : adminLinks

  const roleColors = {
    student: 'from-blue-500 to-indigo-600',
    faculty: 'from-indigo-500 to-purple-600',
    admin: 'from-purple-500 to-pink-600',
  }

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div className="fixed left-0 top-0 h-full w-64 bg-white border-r border-slate-200 flex flex-col z-50 shadow-sm">
      <div className="p-5 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/30">
            <GraduationCap className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-sm font-bold text-slate-900">RiskPredict AI</h1>
            <p className="text-xs text-slate-500">Academic Engine v1.0</p>
          </div>
        </div>
      </div>

      <div className="px-4 py-3 border-b border-slate-200">
        <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200">
          <div className={clsx('w-9 h-9 bg-gradient-to-br rounded-lg flex items-center justify-center text-white font-bold text-sm shadow-md', roleColors[user?.role])}>
            {user?.name?.charAt(0)}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-slate-900 truncate leading-tight">{user?.name}</p>
            <p className="text-xs text-slate-500 capitalize">{user?.role} • {user?.department}</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-3 px-2">
          Menu
        </p>
        {links.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              clsx(
                'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group',
                isActive
                  ? 'bg-blue-50 text-blue-700 border border-blue-100'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 border border-transparent'
              )
            }
          >
            {({ isActive }) => (
              <>
                <Icon className={clsx('w-4 h-4 transition-colors', isActive ? 'text-blue-600' : 'text-slate-400 group-hover:text-slate-600')} />
                <span className="flex-1">{label}</span>
                {isActive && <ChevronRight className="w-3.5 h-3.5 text-blue-600" />}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="p-3 border-t border-slate-200">
        <div className="mb-2 px-3 py-2 rounded-xl bg-blue-50 border border-blue-100">
          <p className="text-xs font-semibold text-blue-700">Academic Year 2024-25</p>
          <p className="text-xs text-slate-600">Semester — Odd Term</p>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-600 hover:bg-red-50 hover:text-red-600 border border-transparent hover:border-red-100 transition-all duration-200 w-full group"
        >
          <LogOut className="w-4 h-4 group-hover:text-red-600 transition-colors" />
          Sign Out
        </button>
      </div>
    </div>
  )
}

export default Sidebar