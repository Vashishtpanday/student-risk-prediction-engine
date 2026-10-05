import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Bell, Search, Menu } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'

const Navbar = ({ title, subtitle, onMenuClick }) => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [searchTerm, setSearchTerm] = useState('')

  // Sync initial state with URL parameter if present
  useEffect(() => {
    const query = searchParams.get('search') || ''
    setSearchTerm(query)
  }, [searchParams])

  const handleSearchKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      const query = searchTerm.trim()
      if (user?.role === 'faculty' || user?.role === 'admin') {
        if (query) {
          navigate(`/faculty/students?search=${encodeURIComponent(query)}`)
        } else {
          navigate('/faculty/students')
        }
      }
    }
  }

  return (
    <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 sm:px-6 sticky top-0 z-30">
      <div className="flex items-center gap-3">
        {/* Hamburger Menu for Mobile */}
        <button 
          onClick={onMenuClick}
          className="lg:hidden p-2 -ml-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
        >
          <Menu className="w-5 h-5" />
        </button>
        
        <div>
          <h2 className="text-sm sm:text-base font-semibold text-slate-900 leading-tight">{title}</h2>
          {subtitle && <p className="text-xs text-slate-500 hidden sm:block">{subtitle}</p>}
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        {/* Global Search Input */}
        <div className="relative hidden md:block">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search student or ID (Press Enter)..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={handleSearchKeyDown}
            className="bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-700 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:bg-white w-48 lg:w-60 transition-all"
          />
        </div>

        <button className="relative w-8 h-8 sm:w-9 sm:h-9 bg-white border border-slate-200 rounded-xl flex items-center justify-center text-slate-600 hover:text-blue-600 hover:border-blue-300 transition-all shrink-0">
          <Bell className="w-4 h-4" />
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-blue-600 rounded-full text-[10px] text-white flex items-center justify-center font-medium">3</span>
        </button>

        <div className="flex items-center gap-2.5 ml-1 sm:ml-0">
          <div className="w-8 h-8 sm:w-9 sm:h-9 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center text-white font-bold text-sm shadow-md shrink-0">
            {user?.name?.charAt(0)}
          </div>
          <div className="hidden md:block">
            <p className="text-xs font-semibold text-slate-900 leading-tight">{user?.name}</p>
            <p className="text-[10px] text-slate-500 capitalize">{user?.role}</p>
          </div>
        </div>
      </div>
    </header>
  )
}

export default Navbar