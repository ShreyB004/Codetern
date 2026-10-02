import { useEffect, useRef, useState } from 'react'
import { ChevronDown, Check } from 'lucide-react'
import { cn } from '../../lib/utils.js'

// Custom dropdown — replaces native <select> everywhere.
export function CustomSelect({ value, onChange, options, placeholder = 'Select…', className, compact = false }) {
  const [open, setOpen] = useState(false)
  const root = useRef(null)
  const selected = options.find((o) => (typeof o === 'string' ? o : o.value) === value)
  const label = selected ? (typeof selected === 'string' ? selected : selected.label) : placeholder

  useEffect(() => {
    if (!open) return
    const onDoc = (e) => {
      if (!root.current?.contains(e.target)) setOpen(false)
    }
    const onKey = (e) => {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', onDoc)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDoc)
      document.removeEventListener('keydown', onKey)
    }
  }, [open ])

  return (
    <div ref={root} className={cn('relative', className)}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className={cn(
          'flex w-full items-center justify-between gap-2 rounded-2xl border bg-white text-left text-ink transition dark:bg-ink dark:text-paper',
          compact ? 'px-4 py-2 text-sm' : 'px-4 py-3 text-sm',
          open
            ? 'border-ink shadow-card dark:border-paper/40'
            : 'border-ink/12 hover:border-ink/30 dark:border-paper/15 dark:hover:border-paper/30',
          !selected && 'text-ink/40 dark:text-paper/40',
        )}
      >
        <span className="truncate">{label}</span>
        <ChevronDown size={15} className={cn('shrink-0 opacity-50 transition-transform duration-300', open && 'rotate-180')} />
      </button>
      <div className={cn(
        'absolute inset-x-0 top-full z-30 mt-1.5 origin-top overflow-hidden rounded-2xl border border-ink/10 bg-white shadow-float transition-all duration-200 dark:border-paper/15 dark:bg-ink-soft',
        open ? 'visible scale-100 opacity-100' : 'invisible scale-95 opacity-0',
      )}>
        <ul role="listbox" className="cdt-scroll-slim max-h-56 overflow-y-auto p-1.5">
          {options.map((o) => {
            const v = typeof o === 'string' ? o : o.value
            const l = typeof o === 'string' ? o : o.label
            const sub = typeof o === 'string' ? null : o.sub
            const active = v === value
            return (
              <li key={v}>
                <button
                  type="button" role="option" aria-selected={active}
                  onClick={() => { onChange(v); setOpen(false) }}
                  className={cn(
                    'flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-left text-sm transition',
                    active ? 'bg-ink font-bold text-white dark:bg-paper dark:text-ink' : 'hover:bg-ink/5 dark:hover:bg-paper/10',
                  )}
                >
                  <span className="min-w-0 flex-1">
                    <span className="block truncate">{l}</span>
                    {sub && <span className={cn('block truncate text-[11px]', active ? 'opacity-70' : 'opacity-50')}>{sub}</span>}
                  </span>
                  {active && <Check size={14} className="shrink-0" />}
                </button>
              </li>
            )
          })}
        </ul>
      </div>
    </div>
  )
}
