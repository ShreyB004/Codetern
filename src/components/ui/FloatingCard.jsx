import { useFloat } from '../../hooks/useParallax.js'
import { cn } from '../../lib/utils.js'

/**
 * Floating physics card — wraps children in a decorative floating element.
 * The inner layer breathes (gentle scale) so the card feels alive without
 * fighting the GSAP transform on the outer wrapper.
 */
export function FloatingCard({ children, className, amplitude = 12, duration = 3.4, delay = 0, depth, breathe = true }) {
  const ref = useFloat({ amplitude, duration, delay })
  return (
    <div
      ref={ref}
      className={cn('pointer-events-none absolute select-none will-change-transform', className)}
      style={{ ['--depth']: depth }}
    >
      {breathe ? <div className="cdt-breathe">{children}</div> : children}
    </div>
  )
}