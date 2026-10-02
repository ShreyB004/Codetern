import { useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'
import { cn } from '../../lib/utils.js'

export function Modal({ open, onClose, children, className, title, size = 'md' }) {
  const panelRef = useRef(null)
  const closeBtnRef = useRef(null)

  useEffect(() => {
    if (!open) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    closeBtnRef.current?.focus()
    const onKey = (e) => {
      if (e.key === 'Escape') onClose?.()
    }
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = prev
      window.removeEventListener('keydown', onKey)
    }
  }, [open, onClose])

  if (!open) return null

  return createPortal(
    <div className="animate-in fixed inset-0 z-[100] flex items-end justify-center p-3 sm:items-center sm:p-6">
      <div className="absolute inset-0 bg-ink/60 backdrop-blur-sm dark:bg-black/70" onClick={onClose} />
      <div
        ref={panelRef}
        className={cn(
          'relative max-h-[92vh] w-full overflow-y-auto rounded-3xl border border-ink/10 bg-paper text-ink shadow-float dark:border-paper/10 dark:bg-ink-soft dark:text-paper',
          size === 'sm' && 'max-w-md',
          size === 'md' && 'max-w-xl',
          size === 'lg' && 'max-w-3xl',
          size === 'xl' && 'max-w-5xl',
          className,
        )}
        role="dialog"
        aria-modal="true"
      >
        {title && (
          <div className="sticky top-0 z-10 flex items-center justify-between border-b border-ink/10 bg-paper/95 px-6 py-4 backdrop-blur-md dark:border-paper/10 dark:bg-ink-soft/95">
            <h3 className="font-display text-lg font-bold">{title}</h3>
            <button
              ref={closeBtnRef}
              onClick={onClose}
              className="grid h-8 w-8 place-items-center rounded-full border border-ink/10 transition hover:bg-ink/5 dark:border-paper/15 dark:hover:bg-paper/10"
              aria-label="Close"
            >
              <X size={16} />
            </button>
          </div>
        )}
        <div className={cn(!title && 'p-0', title && 'p-6')}>{children}</div>
      </div>
    </div>,
    document.body,
  )
}
