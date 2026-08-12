import { useFloat } from '../../hooks/useParallax.js'
import { cn } from '../../lib/utils.js'

/**
 * Floating physics card — wraps children in a decorative floating element.
 */
export function FloatingCard({ children, className, amplitude = 12, duration = 3.4, delay = 0, depth }) {
  const ref = useFloat({ amplitude, duration, delay })
  return (
    <div
      ref={ref}
      className={cn('pointer-events-none absolute select-none will-change-transform', className)}
      style={{ ['--depth']: depth }}
    >
      {children}
    </div>
  )
}