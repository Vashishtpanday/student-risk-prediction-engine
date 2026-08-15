const Loader = ({ fullScreen = true, message = 'Loading...' }) => {
  if (fullScreen) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="w-14 h-14 border-2 border-blue-100 rounded-full" />
            <div className="w-14 h-14 border-2 border-blue-600 border-t-transparent rounded-full animate-spin absolute inset-0" />
          </div>
          <p className="text-slate-600 text-sm font-medium">{message}</p>
        </div>
      </div>
    )
  }
  return (
    <div className="flex items-center justify-center py-12">
      <div className="relative">
        <div className="w-10 h-10 border-2 border-blue-100 rounded-full" />
        <div className="w-10 h-10 border-2 border-blue-600 border-t-transparent rounded-full animate-spin absolute inset-0" />
      </div>
    </div>
  )
}

export default Loader