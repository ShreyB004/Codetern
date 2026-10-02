import { cn } from '../../lib/utils.js'

export function Pill({ children, className, tone = 'ink', dot, pulse = false }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-card',
        tone === 'ink' && 'border-ink/10 bg-ink text-paper dark:border-paper/10 dark:bg-paper dark:text-ink',
        tone === 'cyan' && 'border-cyan-deep/30 bg-cyan-deep/10 text-cyan-deep dark:border-cyan-snap/30 dark:bg-cyan-snap/10 dark:text-cyan-snap',
        tone === 'neon' && 'border-neon-deep/40 bg-neon-deep/10 text-neon-deep dark:border-neon/40 dark:bg-neon/10 dark:text-neon',
        tone === 'mint' && 'border-mint-deep/30 bg-mint-deep/10 text-mint-deep dark:border-mint/30 dark:bg-mint/10 dark:text-mint',
        tone === 'coral' && 'border-coral-deep/40 bg-coral-deep/10 text-coral-deep dark:border-coral/40 dark:bg-coral/10 dark:text-coral',
        tone === 'violet' && 'border-violet-ink/30 bg-violet-ink/10 text-violet-ink dark:border-violet-deep/40 dark:bg-violet-deep/15 dark:text-violet-deep',
        tone === 'soft' && 'border-ink/10 bg-white text-ink/80 dark:border-paper/10 dark:bg-ink-soft dark:text-paper/80',
        className,
      )}
    >
      {dot && <span className={cn('h-1.5 w-1.5 rounded-full bg-current', pulse && 'animate-pulse')} />}
      {children}
    </span>
  )
}

// Floating decorative pill — hero ornament with drift animation
export function FloatPill({ children, className, tone = 'soft', delay = '0s' }) {
  return (
    <span
      className={cn('cdt-float pointer-events-none absolute z-10 hidden sm:inline-flex', className)}
      style={{ animationDelay: delay }}
    >
      <Pill tone={tone} dot pulse>{children}</Pill>
    </span>
  )
}
