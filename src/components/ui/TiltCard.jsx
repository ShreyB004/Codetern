import { useRef } from 'react'
import { gsap } from '../../lib/gsap.js'
import { cn } from '../../lib/utils.js'

/**
 * Tilt card — 3D hover tilt via GSAP quickTo. Pair with FloatingCard for float physics.
 */
export function TiltCard({ children, className, max = 8, scale = 1.01 }) {
  const ref = useRef(null)

  const onMove = (e) => {
    const el = ref.current
    if (!el || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const rect = el.getBoundingClientRect()
    const px = (e.clientX - rect.left) / rect.width - 0.5
    const py = (e.clientY - rect.top) / rect.height - 0.5
    gsap.to(el, { rotateY: px * max * 2, rotateX: py * max * -2, scale, duration: 0.4, ease: 'power2.out' })
  }

  const onLeave = () => {
    const el = ref.current
    if (!el) return
    gsap.to(el, { rotateY: 0, rotateX: 0, scale: 1, duration: 0.6, ease: 'elastic.out(1,0.5)' })
  }

  return (
    <div style={{ perspective: 900 }} className="h-full">
      <div
        ref={ref}
        onMouseMove={onMove}
        onMouseLeave={onLeave}
        className={cn('h-full will-change-transform', className)}
      >
        {children}
      </div>
    </div>
  )
}