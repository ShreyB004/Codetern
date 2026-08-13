import { cn } from '../../../lib/utils.js'

/**
 * BeamsBackground — parallel light beams streaming top-to-bottom with a
 * soft glow. Pure CSS (conic gradients + blur), GPU-composited.
 */
export function BeamsBackground({ children, className }) {
  const beams = [
    { left: '6%', delay: 0, dur: 9 },
    { left: '22%', delay: -3, dur: 12 },
    { left: '38%', delay: -6, dur: 10 },
    { left: '54%', delay: -1.5, dur: 13 },
    { left: '70%', delay: -4, dur: 9.5 },
    { left: '86%', delay: -7, dur: 11 },
  ]

  return (
    <div className={cn('pointer-events-none absolute inset-0 overflow-hidden', className)} aria-hidden>
      {beams.map((b, i) => (
        <div
          key={i}
          className="cdt-beam"
          style={{ left: b.left, animationDelay: `${b.delay}s`, animationDuration: `${b.dur}s` }}
        >
          <div className="cdt-beam-glow" />
        </div>
      ))}
      {children && <div className="pointer-events-auto absolute inset-0 z-10">{children}</div>}
    </div>
  )
}
