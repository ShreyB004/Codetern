import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'
import { cn } from '../../lib/utils.js'
import { gsap } from '../../lib/gsap.js'

export function Modal({ open, onClose, children, className, title, size = 'md' }) {
  useEffect(() => {
    if (!open) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const onKey = (e) => e.key === 'Escape' && onClose?.()
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = prev
      window.removeEventListener('keydown', onKey)
    }
  }, [open, onClose])

  useEffect(() => {
    if (open) {
      gsap.fromTo(
        '.cdt-modal-panel',
        { opacity: 0, y: 26, scale: 0.97 },
        { opacity: 1, y: 0, scale: 1, duration: 0.45, ease: 'expo.out' },
      )
      gsap.fromTo('.cdt-modal-backdrop', { opacity: 0 }, { opacity: 1, duration: 0.3 })
    }
  }, [open])

  if (!open) return null

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-end justify-center p-3 sm:items-center sm:p-6">
      <div className="cdt-modal-backdrop absolute inset-0 bg-ink/60 backdrop-blur-sm" onClick={onClose} />
      <div
        className={cn(
          'cdt-modal-panel relative w-full overflow-hidden rounded-panel border border-white/10 bg-paper shadow-float dark:bg-ink-soft dark:shadow-none',
          size === 'sm' && 'max-w-md',
          size === 'md' && 'max-w-xl',
          size === 'lg' && 'max-w-3xl',
          size === 'xl' && 'max-w-5xl',
          'max-h-[92vh] overflow-y-auto',
          className,
        )}
        role="dialog"
        aria-modal="true"
      >
        {title && (
          <div className="sticky top-0 z-10 flex items-center justify-between border-b border-ink/8 bg-paper/90 dark:border-paper/10 dark:bg-ink-soft/90 px-6 py-4 backdrop-blur-md">
            <h3 className="font-display text-lg font-bold text-ink dark:text-paper">{title}</h3>
            <button
              onClick={onClose}
              className="grid h-8 w-8 place-items-center rounded-full border border-ink/10 text-ink/60 transition hover:bg-ink/5 hover:text-ink dark:border-paper/15 dark:text-paper/60 dark:hover:bg-paper/5 dark:hover:text-paper"
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