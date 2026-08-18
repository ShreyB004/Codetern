import { useEffect, useRef } from 'react'
import { useTheme } from '../../../context/ThemeContext.jsx'
import { cn } from '../../../lib/utils.js'
import './DotGrid.css'

const DEFAULT_CONFIG = {
  dotSize: 2,
  ringSize: 160,
  spacing: 26,
  pushStrength: 36,
  colors: ['#22d3ee', '#38ffb0', '#7c5cff', '#b4ff39'],
}

/**
 * DotGrid — interactive canvas dot field (React Bits pattern). Dots sit on a
 * grid and are repelled by the cursor with inertia-damped motion.
 * Theme-adaptive: idle dots are white in dark mode, violet in light mode.
 */
export function DotGrid({ config = DEFAULT_CONFIG, className }) {
  const canvasRef = useRef(null)
  const { isDark } = useTheme()

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return undefined
    const ctx = canvas.getContext('2d')
    if (!ctx) return undefined

    const dotSize = config.dotSize ?? DEFAULT_CONFIG.dotSize
    const ringSize = config.ringSize ?? DEFAULT_CONFIG.ringSize
    const spacing = config.spacing ?? DEFAULT_CONFIG.spacing
    const pushStrength = config.pushStrength ?? DEFAULT_CONFIG.pushStrength
    const colors = config.colors ?? DEFAULT_CONFIG.colors
    const idleColor = isDark ? 'rgba(255,255,255,0.14)' : 'rgba(124,92,255,0.35)'

    let width = 0
    let height = 0

    const handleResize = () => {
      const rect = canvas.getBoundingClientRect()
      width = rect.width
      height = rect.height
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      canvas.width = width * dpr
      canvas.height = height * dpr
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      buildDots()
    }

    let dots = []
    const buildDots = () => {
      dots = []
      for (let x = spacing / 2; x < width; x += spacing) {
        for (let y = spacing / 2; y < height; y += spacing) {
          dots.push({
            baseX: x,
            baseY: y,
            x,
            y,
            color: colors[Math.floor(Math.random() * colors.length)],
          })
        }
      }
    }

    const draw = (mouseX, mouseY) => {
      ctx.clearRect(0, 0, width, height)
      for (const dot of dots) {
        const dx = dot.baseX - mouseX
        const dy = dot.baseY - mouseY
        const dist = Math.sqrt(dx * dx + dy * dy)
        let targetX = dot.baseX
        let targetY = dot.baseY
        if (dist < ringSize && dist > 0) {
          const force = (ringSize - dist) / ringSize
          const angle = Math.atan2(dy, dx)
          targetX = dot.baseX + Math.cos(angle) * force * pushStrength
          targetY = dot.baseY + Math.sin(angle) * force * pushStrength
        }
        dot.x += (targetX - dot.x) * 0.14
        dot.y += (targetY - dot.y) * 0.14

        ctx.fillStyle = dist < ringSize ? dot.color : idleColor
        ctx.beginPath()
        ctx.arc(dot.x, dot.y, dotSize, 0, Math.PI * 2)
        ctx.fill()
      }
    }

    let mouseX = -1000
    let mouseY = -1000
    let animatedMouseX = -1000
    let animatedMouseY = -1000
    let frameId

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    const lerp = (from, to) => from + (to - from) * 0.12

    const handlePointerMove = (e) => {
      const rect = canvas.getBoundingClientRect()
      mouseX = e.clientX - rect.left
      mouseY = e.clientY - rect.top
    }
    const handlePointerLeave = () => {
      mouseX = -1000
      mouseY = -1000
    }

    const animate = () => {
      frameId = requestAnimationFrame(animate)
      animatedMouseX = lerp(animatedMouseX, mouseX)
      animatedMouseY = lerp(animatedMouseY, mouseY)
      draw(animatedMouseX, animatedMouseY)
    }

    handleResize()
    window.addEventListener('resize', handleResize)
    if (!reducedMotion) {
      window.addEventListener('pointermove', handlePointerMove, { passive: true })
      window.addEventListener('pointerleave', handlePointerLeave)
    }
    frameId = requestAnimationFrame(animate)

    return () => {
      cancelAnimationFrame(frameId)
      window.removeEventListener('resize', handleResize)
      window.removeEventListener('pointermove', handlePointerMove)
      window.removeEventListener('pointerleave', handlePointerLeave)
    }
  }, [config, isDark])

  return (
    <div className={cn('dot-grid-container', className)} aria-hidden>
      <canvas ref={canvasRef} className="dot-grid-canvas" />
    </div>
  )
}
