import { useEffect } from 'react'
import { X } from 'lucide-react'
import clsx from 'clsx'

const Modal = ({ isOpen, onClose, title, children, size = 'md' }) => {
  useEffect(() => {
    if (isOpen) document.body.style.overflow = 'hidden'
    else document.body.style.overflow = 'unset'
    return () => { document.body.style.overflow = 'unset' }
  }, [isOpen])

  if (!isOpen) return null

  const sizeMap = { sm: 'max-w-md', md: 'max-w-lg', lg: 'max-w-2xl', xl: 'max-w-4xl' }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={onClose} />
      <div className={clsx('relative w-full bg-white border border-slate-200 rounded-2xl shadow-2xl animate-slide-up', sizeMap[size])}>
        <div className="flex items-center justify-between p-6 border-b border-slate-200">
          <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-all">
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  )
}

export default Modal