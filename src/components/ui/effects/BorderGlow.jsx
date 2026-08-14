import { useRef } from 'react'
import { cn } from '../../../lib/utils.js'
import './BorderGlow.css'

/**
 * BorderGlow — cursor-following glow border (React Bits pattern).
 * color: any CSS color (defaults to the violet-deep token).
 */
export function BorderGlow({ children, className, color = 'var(--color-violet-deep)' }) {
  const cardRef = useRef(null)

  const getPosition = (e) => {
    if (!cardRef.current) return
    const rect = cardRef.current.getBoundingClientRect()
    cardRef.current.style.setProperty('--card-x', `${e.clientX - rect.left}px`)
    cardRef.current.style.setProperty('--card-y', `${e.clientY - rect.top}px`)
  }

  return (
    <div
      ref={cardRef}
      onMouseMove={getPosition}
      style={{ '--border-glow-color': color }}
      className={cn('border-glow', className)}
    >
      {children}
    </div>
  )
}
