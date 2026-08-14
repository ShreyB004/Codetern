import { memo, useEffect, useRef } from 'react'
import { useTheme } from '../../../context/ThemeContext.jsx'
import { cn } from '../../../lib/utils.js'
import './DotField.css'

const DEFAULT_CONFIG = {
  defaultColor: 'rgba(124,92,255,0.8)',
  hoverColor: 'rgba(180,151,207,0.8)',
  radius: 1,
  maxParticles: 300,
  riseFactor: 1.5,
}

const Particle = ({ x, y }) => ({ x, y, vx: 0, vy: 0, rise: 0 })

/**
 * DotField — canvas particle field (React Bits pattern). Dots drift in from
 * the sides and are pushed by the pointer; palette-tuned to violet.
 * Theme-adaptive: brighter in dark mode, softened in light mode.
 */
export const DotField = memo(function DotField({ config = DEFAULT_CONFIG, className }) {
  const canvasRef = useRef(null)
  const pointerRef = useRef({ x: -1000, y: -1000 })
  const { isDark } = useTheme()

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return undefined
    const ctx = canvas.getContext('2d')
    if (!ctx) return undefined

    const riseFactor = config.riseFactor ?? DEFAULT_CONFIG.riseFactor
    const radius = config.radius ?? DEFAULT_CONFIG.radius
    const defaultColor = config.defaultColor ?? (isDark ? 'rgba(124,92,255,0.8)' : 'rgba(91,33,182,0.45)')
    const hoverColor = config.hoverColor ?? (isDark ? 'rgba(180,151,207,0.8)' : 'rgba(91,33,182,0.6)')
    const maxParticles = config.maxParticles ?? DEFAULT_CONFIG.maxParticles

    let width = canvas.clientWidth
    let height = canvas.clientHeight
    const dpr = Math.max(1, window.devicePixelRatio || 1)
    canvas.width = width * dpr
    canvas.height = height * dpr
    ctx.scale(dpr, dpr)

    let particles = []
    const mouseRadius = 150

    const spawnParticle = () => {
      const isLeft = Math.random() < 0.5
      const x = isLeft ? -10 : width + 10
      const y = Math.random() * height
      const p = new Particle({ x, y })
      p.vx = (isLeft ? 1 : -1) * (Math.random() * 2 + 0.5)
      p.vy = Math.random() * -1 - 0.5
      p.rise = Math.random() * riseFactor
      particles.push(p)
      if (particles.length > maxParticles) {
        particles = particles.slice(particles.length - maxParticles)
      }
    }

    const updateParticles = (p) => {
      const dx = pointerRef.current.x - p.x
      const dy = pointerRef.current.y - p.y
      const dist = Math.sqrt(dx * dx + dy * dy)
      const repulsionForce = (mouseRadius - dist) / mouseRadius

      if (dist < mouseRadius && dist > 0) {
        p.vx += (dx / dist) * repulsionForce * 0.3
        p.vy += (dy / dist) * repulsionForce * 0.3
      }

      p.vx *= 0.98
      p.vy *= 0.98
      p.x += p.vx
      p.y += p.vy + p.rise * 0.1

      if (p.y < -20 || p.x < -30 || p.x > width + 30) {
        const isLeft = Math.random() < 0.5
        p.x = isLeft ? -10 : width + 10
        p.y = Math.random() * height
        p.vx = (isLeft ? 1 : -1) * (Math.random() * 2 + 0.5)
        p.vy = Math.random() * -1 - 0.5
        p.rise = Math.random() * riseFactor
      }
    }

    const drawParticle = (p) => {
      const dx = pointerRef.current.x - p.x
      const dy = pointerRef.current.y - p.y
      const dist = Math.sqrt(dx * dx + dy * dy)
      const inRange = dist < mouseRadius

      ctx.beginPath()
      ctx.arc(p.x, p.y, radius, 0, Math.PI * 2)
      ctx.fillStyle = inRange ? hoverColor : defaultColor
      ctx.fill()

      if (inRange) {
        ctx.beginPath()
        ctx.arc(p.x, p.y, radius * 3, 0, Math.PI * 2)
        ctx.fillStyle = hoverColor.replace(/[^,]+(?=\))/, '0.15')
        ctx.fill()
      }
    }

    let animationId
    const render = () => {
      ctx.clearRect(0, 0, width, height)
      particles.forEach(updateParticles)
      particles.forEach(drawParticle)
      animationId = requestAnimationFrame(render)
    }

    const resize = () => {
      width = canvas.clientWidth
      height = canvas.clientHeight
      if (!width || !height) return
      canvas.width = width * dpr
      canvas.height = height * dpr
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }

    const handlePointerMove = (e) => {
      const rect = canvas.getBoundingClientRect()
      pointerRef.current.x = e.clientX - rect.left
      pointerRef.current.y = e.clientY - rect.top
    }
    const handleTouchMove = (e) => {
      const touch = e.touches[0]
      if (!touch) return
      const rect = canvas.getBoundingClientRect()
      pointerRef.current.x = touch.clientX - rect.left
      pointerRef.current.y = touch.clientY - rect.top
    }
    const handlePointerLeave = () => {
      pointerRef.current.x = -1000
      pointerRef.current.y = -1000
    }

    resize()
    window.addEventListener('resize', resize)
    window.addEventListener('pointermove', handlePointerMove, { passive: true })
    window.addEventListener('touchmove', handleTouchMove, { passive: true })
    window.addEventListener('pointerleave', handlePointerLeave)

    for (let i = 0; i < maxParticles / 2; i += 1) {
      spawnParticle()
    }
    animationId = requestAnimationFrame(render)

    return () => {
      cancelAnimationFrame(animationId)
      window.removeEventListener('resize', resize)
      window.removeEventListener('pointermove', handlePointerMove)
      window.removeEventListener('touchmove', handleTouchMove)
      window.removeEventListener('pointerleave', handlePointerLeave)
    }
  }, [config, isDark])

  return <canvas ref={canvasRef} className={cn('dot-field', className)} aria-hidden />
})
