import { cn } from '../../lib/utils.js'

export function Pill({ children, className, tone = 'ink', dot }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-2 rounded-bubble border px-3.5 py-1.5 text-[11px] font-semibold uppercase tracking-[0.14em]',
        tone === 'ink' && 'border-ink/10 bg-ink text-paper',
        tone === 'cyan' && 'border-cyan-snap/30 bg-cyan-snap/10 text-cyan-snap',
        tone === 'neon' && 'border-neon/40 bg-neon/10 text-neon',
        tone === 'mint' && 'border-mint/30 bg-mint/10 text-mint',
        tone === 'coral' && 'border-coral/40 bg-coral/10 text-coral',
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
        color: (domain ? color?.fg : null) || '#22d3ee',
      }}
    >
      <span className="h-1.5 w-1.5 rounded-full" style={{ background: 'currentColor' }} />
      {domain && programme ? programme.title : ''}
    </span>
  )
}