import { useRef } from 'react'
import { useTheme } from '../../../context/ThemeContext.jsx'
import { cn } from '../../../lib/utils.js'
import './AuroraGlow.css'

const DEFAULT_STOPS = [
  { r: 0.22, g: 0.83, b: 0.93 },
  { r: 0.37, g: 0.49, b: 1.0 },
  { r: 0.13, g: 0.55, b: 0.95 },
]

/**
 * AuroraGlow — pure CSS aurora wash (WebGL-free). Three conic-gradient bands
 * drift on slow loops with a screen blend, tinted to a vibrant bluish palette
 * (cyan → periwinkle → azure). Subtle but noticeable motion; sits behind
 * content. Theme-adaptive: opacity is tuned so it reads on both paper and ink.
 */
export function AuroraGlow({ children, className, colorStops, alpha = 0.14 }) {
  const containerRef = useRef(null)
  const { isDark } = useTheme()

  const stops = colorStops ?? DEFAULT_STOPS
  const a = alpha

  const rgba = (c, o) => `rgba(${Math.round(c.r * 255)}, ${Math.round(c.g * 255)}, ${Math.round(c.b * 255)}, ${o})`

  const sheets = [
    `conic-gradient(from 140deg at 46% 34%, ${rgba(stops[0], 0.55)}, ${rgba(stops[1], 0.35)}, ${rgba(stops[2], 0.18)}, ${rgba(stops[0], 0.55)})`,
    `conic-gradient(from 300deg at 66% 68%, ${rgba(stops[1], 0.42)}, ${rgba(stops[0], 0.24)}, ${rgba(stops[2], 0.3)}, ${rgba(stops[1], 0.42)})`,
    'radial-gradient(55% 55% at 24% 78%, rgba(34,211,238,0.34), transparent 70%)',
    'radial-gradient(60% 60% at 82% 20%, rgba(32,110,255,0.3), transparent 70%)',
  ]

  return (
    <div ref={containerRef} className={cn('aurora-glow', className)} aria-hidden>
      {sheets.map((bg, i) => (
        <div
          key={i}
          className={cn(
            'aurora-glow-sheet',
            i === 1 && 'aurora-glow-alt',
            i >= 2 && 'aurora-glow-blob',
            !isDark && 'aurora-glow-noblend',
          )}
          style={{ background: bg, opacity: a * (i >= 2 ? 1.3 : 1), animationDelay: `${-i * 6}s` }}
        />
      ))}
      {children && <div className="pointer-events-auto absolute inset-0 z-10">{children}</div>}
    </div>
  )
}
