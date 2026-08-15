import clsx from 'clsx'

const SelectField = ({ label, name, value, onChange, options, error, required = false, disabled = false }) => {
  return (
    <div className="space-y-1.5">
      {label && (
        <label htmlFor={name} className="block text-sm font-medium text-slate-700">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <select
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        disabled={disabled}
        className={clsx(
          'w-full bg-white border rounded-xl px-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 transition-all disabled:opacity-50',
          error ? 'border-red-300 focus:border-red-500 focus:ring-red-100' : 'border-slate-200 focus:border-blue-500 focus:ring-blue-100'
        )}
      >
        {options.map(({ value: val, label: lab }) => (
          <option key={val} value={val}>
            {lab}
          </option>
        ))}
      </select>
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  )
}

export default SelectField