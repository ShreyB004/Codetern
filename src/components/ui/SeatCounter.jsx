import { Flame } from 'lucide-react'
import { useLiveNumber } from '../../hooks/useCountUp.js'
import { cn } from '../../lib/utils.js'
import { Pill } from './Pill.jsx'

/**
 * Live seat counter block — flame + pulsing number for urgency.
 * `onDark` renders light-on-glass for dark hero surfaces.
 */
export function SeatCounter({ remaining, total, duration, compact = false, onDark = false }) {
  const value = useLiveNumber(remaining)
  const urgent = total > 0 && remaining / total <= 0.22

  return (
    <div
      className={cn(
        'inline-flex items-center gap-3 rounded-2xl border px-4 py-3',
        urgent ? 'border-coral/40 bg-coral/8' : 'border-mint/30 bg-mint/5',
        compact && 'px-3 py-2',
      )}
    >
      <span
        className={cn(
          'grid h-8 w-8 shrink-0 place-items-center rounded-xl',
          urgent ? 'bg-coral/15 text-coral' : 'bg-mint/15 text-mint',
        )}
      >
        <Flame className={cn('h-4 w-4', urgent && 'animate-pulse')} />
      </span>
      <div className="min-w-[92px]">
        <div className="flex items-baseline gap-1.5">
          <span className={cn('font-display text-xl font-bold tabular-nums', urgent ? 'text-coral' : onDark ? 'text-white' : 'text-ink dark:text-paper')}>
            {value}
          </span>
          <span className={cn('text-[11px] font-semibold uppercase tracking-wider', onDark ? 'text-white/45' : 'text-ink/45 dark:text-paper/45')}>left · {duration}mo</span>
        </div>
        <div className={cn('mt-1 h-1.5 w-full overflow-hidden rounded-full', onDark ? 'bg-white/10' : 'bg-ink/10 dark:bg-paper/10')}>
          <div
            className="h-full rounded-full transition-all duration-700"
            style={{ width: `${total ? (remaining / total) * 100 : 0}%`, background: urgent ? '#ff5c7a' : '#38ffb0' }}
          />
        </div>
      </div>
      {urgent && <Pill tone="coral" dot className="hidden md:inline-flex">Filling fast</Pill>}
    </div>
  )
}
