import { Bell, Search } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'

const Navbar = ({ title, subtitle }) => {
  const { user } = useAuth()

  return (
    <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 sticky top-0 z-40">
      <div>
        <h2 className="text-base font-semibold text-slate-900 leading-tight">{title}</h2>
        {subtitle && <p className="text-xs text-slate-500">{subtitle}</p>}
        {!subtitle && user?.department && (
          <p className="text-xs text-slate-500">{user.department} Department</p>
        )}
      </div>
      <div className="flex items-center gap-3">
        <div className="relative hidden md:block">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search..."
            className="bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-700 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:bg-white w-44 transition-all"
          />
        </div>
        <button className="relative w-9 h-9 bg-white border border-slate-200 rounded-xl flex items-center justify-center text-slate-600 hover:text-blue-600 hover:border-blue-300 transition-all">
          <Bell className="w-4 h-4" />
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-blue-600 rounded-full text-xs text-white flex items-center justify-center font-medium">3</span>
        </button>
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center text-white font-bold text-sm shadow-md">
            {user?.name?.charAt(0)}
          </div>
          <div className="hidden md:block">
            <p className="text-xs font-semibold text-slate-900 leading-tight">{user?.name}</p>
            <p className="text-xs text-slate-500 capitalize">{user?.role}</p>
          </div>
        </div>
      </div>
    </header>
  )
}

export default Navbar