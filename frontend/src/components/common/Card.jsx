import clsx from 'clsx'

const Card = ({ children, className, onClick, hover = false }) => {
  return (
    <div
      onClick={onClick}
      className={clsx(
        'bg-white border border-slate-200 rounded-2xl p-6 shadow-sm transition-all duration-200',
        hover && 'hover:border-blue-300 hover:shadow-md cursor-pointer',
        className
      )}
    >
      {children}
    </div>
  )
}

export default Card