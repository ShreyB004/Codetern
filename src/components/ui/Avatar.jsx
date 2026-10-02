import { useState } from 'react'
import { cn } from '../../lib/utils.js'

const SIZES = {
  xs: 'h-7 w-7 text-[11px]',
  sm: 'h-9 w-9 text-xs',
  md: 'h-11 w-11 text-sm',
  lg: 'h-14 w-14 text-lg',
}

function Face({ name, photo }) {
  const [broken, setBroken] = useState(false)
  const initial = String(name || '?').trim().slice(0, 1).toUpperCase()
  if (!photo || broken) return <span aria-hidden>{initial}</span>
  return (
    <img
      src={photo} alt={name || ''} loading="lazy" referrerPolicy="no-referrer"
      onError={() => setBroken(true)}
      className="h-full w-full object-cover"
    />
  )
}

export function Avatar({ name, photo, size = 'sm', role, className }) {
  const isAdmin = role === 'admin'
  return (
    <span
      title={name || ''}
      className={cn(
        'grid shrink-0 place-items-center overflow-hidden rounded-full bg-gradient-to-br from-ink to-ink-soft font-display font-extrabold text-neon dark:from-paper dark:to-white/70 dark:text-ink',
        SIZES[size] || SIZES.sm,
        isAdmin && 'ring-2 ring-neon ring-offset-2 ring-offset-paper dark:ring-offset-ink-soft',
        className,
      )}
    >
      <Face name={name} photo={photo} />
    </span>
  )
}

export function RoleBadge({ role }) {
  if (role !== 'admin') return null
  return (
    <span className="rounded-full bg-neon px-1.5 py-px text-[9px] font-extrabold uppercase tracking-wider text-ink">
      Mentor
    </span>
  )
}
