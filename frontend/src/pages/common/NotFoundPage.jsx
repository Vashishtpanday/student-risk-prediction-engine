import { useNavigate } from 'react-router-dom'
import { Home, AlertCircle } from 'lucide-react'

const NotFoundPage = () => {
  const navigate = useNavigate()
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <div className="text-center max-w-md">
        <div className="w-24 h-24 bg-blue-100 border border-blue-200 rounded-3xl flex items-center justify-center mx-auto mb-6">
          <AlertCircle className="w-12 h-12 text-blue-600" />
        </div>
        <p className="text-7xl font-bold gradient-text mb-4">404</p>
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Page Not Found</h2>
        <p className="text-slate-500 text-sm mb-8 leading-relaxed">
          The page you are looking for does not exist or has been moved.
        </p>
        <button onClick={() => navigate('/')}
          className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-medium hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg shadow-blue-500/30">
          <Home className="w-4 h-4" />
          Go to Home
        </button>
      </div>
    </div>
  )
}

export default NotFoundPage