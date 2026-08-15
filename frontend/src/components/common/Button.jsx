import clsx from 'clsx'

const variants = {
  primary: 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-md shadow-blue-500/20',
  secondary: 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200',
  danger: 'bg-red-50 hover:bg-red-100 text-red-700 border border-red-200',
  ghost: 'hover:bg-slate-100 text-slate-600 hover:text-slate-900',
  success: 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200',
}

const sizes = {
  sm: 'px-3 py-1.5 text-xs rounded-lg',
  md: 'px-4 py-2.5 text-sm rounded-xl',
  lg: 'px-6 py-3 text-sm rounded-xl',
}

const Button = ({ children, variant = 'primary', size = 'md', loading = false, disabled = false, onClick, type = 'button', className, icon: Icon }) => {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={clsx(
        'inline-flex items-center justify-center gap-2 font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed',
        variants[variant],
        sizes[size],
        className
      )}
    >
      {loading ? (
        <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
      ) : Icon ? (
        <Icon className="w-4 h-4" />
      ) : null}
      {children}
    </button>
  )
}

export default Button