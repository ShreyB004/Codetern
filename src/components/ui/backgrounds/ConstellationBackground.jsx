import { useRef } from 'react'
import { useCanvasLayer } from '../../../hooks/useCanvasLayer.js'
import { useTheme } from '../../../context/ThemeContext.jsx'
import { cn } from '../../../lib/utils.js'

/**
 * ConstellationBackground — canvas of nodes connected by thin lines
 * when within range (nodes + links), drifting slowly.
 * Theme-adaptive: dark = cyan nodes / white links, light = violet nodes /
 * violet links (reads on both paper and ink).
 */
export function ConstellationBackground({ className, count = 42, linkDistance = 130, nodeColor, linkColor, alpha }) {
  const { isDark } = useTheme()
  const nodes = useRef([])
  const canvasRef = useCanvasLayer((ctx, w, h, dpr, now, dt) => {
    const resolvedNode = nodeColor ?? (isDark ? '#22d3ee' : '#7c5cff')
    const resolvedLink = linkColor ?? (isDark ? '255,255,255' : '124,92,255')
    const linkAlpha = alpha ?? (isDark ? 0.22 : 0.14)
    if (nodes.current.length !== count) {
      nodes.current = Array.from({ length: count }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.18,
        vy: (Math.random() - 0.5) * 0.18,
        r: (0.7 + Math.random() * 1.2) * dpr,
        a: 0.3 + Math.random() * 0.4,
      }))
    }

    const t = dt / 1000
    ctx.clearRect(0, 0, w, h)

    for (const n of nodes.current) {
      n.x += n.vx * t * 60
      n.y += n.vy * t * 60
      if (n.x < -30) n.x = w + 30
      if (n.x > w + 30) n.x = -30
      if (n.y < -30) n.y = h + 30
      if (n.y > h + 30) n.y = -30
    }

    for (let i = 0; i < nodes.current.length; i++) {
      const a = nodes.current[i]
      for (let j = i + 1; j < nodes.current.length; j++) {
        const b = nodes.current[j]
        const dx = a.x - b.x
        const dy = a.y - b.y
        const dist = Math.hypot(dx, dy)
        if (dist < linkDistance) {
          const alpha = (1 - dist / linkDistance) * linkAlpha
          ctx.beginPath()
          ctx.moveTo(a.x, a.y)
          ctx.lineTo(b.x, b.y)
          ctx.strokeStyle = `rgba(${resolvedLink},${alpha})`
          ctx.lineWidth = 0.7 * dpr
          ctx.stroke()
        }
      }
      ctx.beginPath()
      ctx.arc(a.x, a.y, a.r, 0, Math.PI * 2)
      ctx.fillStyle = resolvedNode
      ctx.globalAlpha = a.a
      ctx.fill()
    }
    ctx.globalAlpha = 1
  })

  return <canvas ref={canvasRef} className={cn('pointer-events-none absolute inset-0 h-full w-full', className)} aria-hidden />
}
