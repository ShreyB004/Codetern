import { cn } from '../../lib/utils.js'

export function Card({ children, className, hover = false, style }) {
  return (
    <div
      style={style}
      className={cn(
        'rounded-panel border border-ink/8 bg-white dark:border-paper/10 dark:bg-ink-soft shadow-card dark:border-paper/10 dark:bg-ink-soft dark:shadow-none',
        hover && 'transition-all duration-500 hover:-translate-y-1.5 hover:shadow-float',
        className,
      )}
    >
      {children}
    </div>
  )
}

export function GlassCard({ children, className, hover = false }) {
  return (
    <div
      className={cn(
        'glass rounded-panel border border-white/40 shadow-card',
        hover && 'transition-all duration-500 hover:-translate-y-1.5 hover:shadow-float',
        className,
      )}
    >
      {children}
    </div>
  )
}