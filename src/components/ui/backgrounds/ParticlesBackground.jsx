import { useRef } from 'react'
import { useCanvasLayer } from '../../../hooks/useCanvasLayer.js'
import { cn } from '../../../lib/utils.js'

/**
 * ParticlesBackground — canvas floating dots with gentle drift and
 * cursor magnetism. Same perf contract as StarfieldBackground.
 */
export function ParticlesBackground({ className, count = 60, color = '#22d3ee', speed = 0.3, radius = 1.6 }) {
  const mouse = useRef({ x: null, y: null })
  const parts = useRef([])
  const canvasRef = useCanvasLayer((ctx, w, h, dpr, now, dt) => {
    if (parts.current.length !== count) {
      parts.current = Array.from({ length: count }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * speed,
        vy: (Math.random() - 0.5) * speed,
        r: (0.6 + Math.random() * radius) * dpr,
        a: 0.25 + Math.random() * 0.55,
      }))
    }

    const { x: mx, y: my } = mouse.current
    const t = dt / 1000

    ctx.clearRect(0, 0, w, h)
    for (const p of parts.current) {
      p.x += p.vx * t * 60
      p.y += p.vy * t * 60

      if (mx != null && my != null) {
        const dx = mx - p.x
        const dy = my - p.y
        const dist = Math.hypot(dx, dy)
        if (dist < 160 && dist > 0) {
          const pull = (1 - dist / 160) * 0.6
          p.x -= dx * pull * t
          p.y -= dy * pull * t
        }
      }

      if (p.x < -20) p.x = w + 20
      if (p.x > w + 20) p.x = -20
      if (p.y < -20) p.y = h + 20
      if (p.y > h + 20) p.y = -20

      ctx.beginPath()
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
      ctx.fillStyle = color
      ctx.globalAlpha = p.a
      ctx.fill()
    }
    ctx.globalAlpha = 1
  })

  const onPointer = (e) => {
    const rect = e.currentTarget.getBoundingClientRect()
    mouse.current = { x: e.clientX - rect.left, y: e.clientY - rect.top }
  }
  const clearPointer = () => {
    mouse.current = { x: null, y: null }
  }

  return (
    <div className={cn('pointer-events-none absolute inset-0 overflow-hidden', className)} onPointerMove={onPointer} onPointerLeave={clearPointer} aria-hidden>
      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />
    </div>
  )
}
