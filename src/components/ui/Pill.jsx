import { cn } from '../../lib/utils.js'

export function Pill({ children, className, tone = 'ink', dot }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-2 rounded-bubble border px-3.5 py-1.5 text-[11px] font-semibold uppercase tracking-[0.14em]',
        tone === 'ink' && 'border-ink/10 dark:border-paper/10 bg-ink text-paper',
        tone === 'cyan' && 'border-cyan-deep/30 bg-cyan-deep/10 text-cyan-deep dark:border-cyan-snap/30 dark:bg-cyan-snap/10 dark:text-cyan-snap',
        tone === 'neon' && 'border-neon-deep/40 bg-neon-deep/10 text-neon-deep dark:border-neon/40 dark:bg-neon/10 dark:text-neon',
        tone === 'mint' && 'border-mint-deep/30 bg-mint-deep/10 text-mint-deep dark:border-mint/30 dark:bg-mint/10 dark:text-mint',
        tone === 'coral' && 'border-coral-deep/40 bg-coral-deep/10 text-coral-deep dark:border-coral/40 dark:bg-coral/10 dark:text-coral',
        tone === 'dark' && 'border-white/15 bg-white/5 text-white/90',
        className,
      )}
    >
      {dot && <span className="h-1.5 w-1.5 rounded-full bg-current animate-pulse" />}
      {children}
    </span>
  )
}

export function DomainBadge({ domain, programme, size = 'sm' }) {
  const color = domain?.color
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full font-semibold',
        size === 'sm' ? 'px-2.5 py-1 text-[11px]' : 'px-3 py-1.5 text-xs',
      )}
      style={{
        background: (domain ? color?.bg : null) || 'rgba(34,211,238,0.12)',
      }}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current text-ink/60 dark:text-paper/70" />
      <span className="text-ink/80 dark:text-paper">{domain && programme ? programme.title : ''}</span>
    </span>
  )
}
