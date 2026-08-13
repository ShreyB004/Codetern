import { useEffect, useRef, useState } from 'react'
import { gsap } from '../../lib/gsap.js'

/**
 * Radial seat gauge. remaining/total drives a sweep animation (GSAP).
 */
export function SeatGauge({ remaining, total, size = 96, urgent = false }) {
  const [shown, setShown] = useState(remaining)
  const circleRef = useRef(null)
  const prevRef = useRef(remaining)
  const radius = (size - 14) / 2
  const cx = size / 2
  const circumference = 2 * Math.PI * radius
  const pct = total > 0 ? remaining / total : 0

  useEffect(() => {
    const obj = { v: prevRef.current }
    const tween = gsap.to(obj, {
      v: remaining,
      duration: 0.8,
      ease: 'power2.out',
      onUpdate: () => {
        setShown(Math.round(obj.v))
        if (circleRef.current) {
          const frac = total > 0 ? obj.v / total : 0
          circleRef.current.style.strokeDasharray = `${frac * circumference} ${circumference}`
        }
      },
    })
    prevRef.current = remaining
    return () => tween.kill()
  }, [remaining, total, circumference])

  useEffect(() => {
    if (circleRef.current) {
      const frac = total > 0 ? remaining / total : 0
      circleRef.current.style.strokeDasharray = `${frac * circumference} ${circumference}`
    }
  }, [total, remaining, circumference])

  const stroke = urgent ? '#ff5c7a' : pct > 0.34 ? '#22d3ee' : '#b4ff39'

  return (
    <div className="relative inline-grid place-items-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={cx}
          cy={cx}
          r={radius}
          fill="none"
          strokeWidth={7}
          className="stroke-ink/10 dark:stroke-paper/10"
        />
        <circle
          ref={circleRef}
          cx={cx}
          cy={cx}
          r={radius}
          fill="none"
          strokeWidth={7}
          strokeLinecap="round"
          style={{
            stroke,
            strokeDasharray: '0 0',
            transition: 'stroke 0.4s',
          }}
        />
      </svg>
      <div className="absolute inset-0 grid place-items-center text-center">
        <div>
          <div className="font-display text-lg font-bold leading-none text-ink dark:text-paper">{shown}</div>
          <div className="mt-0.5 text-[10px] font-semibold uppercase tracking-wider text-ink/45 dark:text-paper/45">seats</div>
        </div>
      </div>
    </div>
  )
}
