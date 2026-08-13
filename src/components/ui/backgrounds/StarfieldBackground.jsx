import { useRef } from 'react'
import { useCanvasLayer } from '../../../hooks/useCanvasLayer.js'
import { cn } from '../../../lib/utils.js'

const PALETTE = ['#22d3ee', '#38ffb0', '#b4ff39', '#7c5cff', '#ffffff']

/**
 * StarfieldBackground — canvas fly-through hyperspace starfield.
 * Single rAF loop, pauses offscreen / hidden tab, dpr-capped, honours
 * prefers-reduced-motion (one settled frame).
 */
export function StarfieldBackground({ className, count = 120, speed = 1, size = 1.4, colors = PALETTE }) {
  const stars = useRef([])
  const canvasRef = useCanvasLayer((ctx, w, h, dpr) => {
    if (stars.current.length !== count) {
      stars.current = Array.from({ length: count }, () => ({
        x: (Math.random() - 0.5) * w * 1.6,
        y: (Math.random() - 0.5) * h * 1.6,
        z: Math.random() * w,
        c: colors[Math.floor(Math.random() * colors.length)],
      }))
    }

    ctx.clearRect(0, 0, w, h)
    const cx = w / 2
    const cy = h / 2

    for (const s of stars.current) {
      s.z -= speed * 1.6
      if (s.z <= 0) {
        s.z = w
        s.x = (Math.random() - 0.5) * w * 1.6
        s.y = (Math.random() - 0.5) * h * 1.6
      }

      const k = w / s.z
      const sx = cx + s.x * k
      const sy = cy + s.y * k
      if (sx < -50 || sx > w + 50 || sy < -50 || sy > h + 50) continue

      const alpha = Math.min(1, Math.pow(1 - s.z / w, 2) * 0.9)
      const r = Math.max(0.4, (1 - s.z / w) * size * dpr)

      ctx.beginPath()
      ctx.arc(sx, sy, r, 0, Math.PI * 2)
      ctx.fillStyle = s.c
      ctx.globalAlpha = alpha
      ctx.fill()
    }
    ctx.globalAlpha = 1
  })

  return <canvas ref={canvasRef} className={cn('pointer-events-none absolute inset-0 h-full w-full', className)} aria-hidden />
}
