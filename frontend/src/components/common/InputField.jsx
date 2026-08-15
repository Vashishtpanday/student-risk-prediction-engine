import clsx from 'clsx'

const InputField = ({ label, name, type = 'text', value, onChange, placeholder, error, required = false, disabled = false, hint }) => {
  return (
    <div className="space-y-1.5">
      {label && (
        <label htmlFor={name} className="block text-sm font-medium text-slate-700">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <input
        id={name}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        className={clsx(
          'w-full bg-white border rounded-xl px-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed',
          error ? 'border-red-300 focus:border-red-500 focus:ring-red-100' : 'border-slate-200 focus:border-blue-500 focus:ring-blue-100'
        )}
      />
      {hint && !error && <p className="text-xs text-slate-500">{hint}</p>}
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  )
}

export default InputField