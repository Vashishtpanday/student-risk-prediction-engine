import { useNavigate } from 'react-router-dom'
import { ShieldX, ArrowLeft } from 'lucide-react'

const UnauthorizedPage = () => {
  const navigate = useNavigate()
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <div className="text-center max-w-md">
        <div className="w-24 h-24 bg-red-100 border border-red-200 rounded-3xl flex items-center justify-center mx-auto mb-6">
          <ShieldX className="w-12 h-12 text-red-600" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Access Denied</h2>
        <p className="text-slate-500 text-sm mb-8 leading-relaxed">
          You do not have permission to access this page. Please contact your administrator if you think this is a mistake.
        </p>
        <button onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-medium hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg shadow-blue-500/30">
          <ArrowLeft className="w-4 h-4" />
          Go Back
        </button>
      </div>
    </div>
  )
}

export default UnauthorizedPage