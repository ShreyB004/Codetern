import { Loader2, Inbox } from 'lucide-react'
import { cn } from '../../lib/utils.js'

export function Loader({ text = 'Loading…' }) {
  return (
    <div className="flex items-center justify-center gap-2 py-10 text-sm opacity-60" role="status" aria-live="polite">
      <Loader2 size={18} className="animate-spin" /> {text}
    </div>
  )
}

export function Empty({ text, action }) {
  return (
    <div className="flex flex-col items-center gap-2 rounded-3xl border border-dashed border-ink/15 px-6 py-10 text-center dark:border-paper/15">
      <span className="grid h-11 w-11 place-items-center rounded-2xl bg-ink/5 dark:bg-paper/10"><Inbox size={19} /></span>
      <p className="max-w-xs text-sm opacity-60">{text}</p>
      {action}
    </div>
  )
}

const TONES = {
  new: 'bg-sky-500/15 text-sky-700 dark:text-sky-300',
  requested: 'bg-amber-500/15 text-amber-700 dark:text-amber-300',
  pending: 'bg-amber-500/15 text-amber-700 dark:text-amber-300',
  submitted: 'bg-sky-500/15 text-sky-700 dark:text-sky-300',
  active: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300',
  approved: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300',
  present: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300',
  rejected: 'bg-rose-500/15 text-rose-700 dark:text-rose-300',
  changes: 'bg-rose-500/15 text-rose-700 dark:text-rose-300',
  absent: 'bg-ink/8 text-ink/60 dark:bg-paper/10 dark:text-paper/60',
}

export function StatusBadge({ status }) {
  const s = String(status || 'new')
  return (
    <span className={cn('inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold', TONES[s] || TONES.new)}>
      <span className="h-1.5 w-1.5 rounded-full bg-current" /> {s}
    </span>
  )
}

export function Card({ children, className, dark = false }) {
  return (
    <div className={cn(
      'rounded-3xl border p-5',
      dark
        ? 'border-ink/10 bg-ink text-white dark:border-paper/10 dark:bg-ink-soft'
        : 'border-ink/10 bg-white shadow-card dark:border-paper/10 dark:bg-ink-soft dark:shadow-none',
      className,
    )}>
      {children}
    </div>
  )
}
