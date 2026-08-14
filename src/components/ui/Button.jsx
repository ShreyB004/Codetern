import { forwardRef } from 'react'
import { cn } from '../../lib/utils.js'
import { useMagnetic } from '../../hooks/useMagnetic.js'

const base =
  'inline-flex items-center justify-center gap-2 rounded-full font-semibold transition-all duration-300 will-change-transform focus-ring active:scale-[0.97]'

const variants = {
  primary: 'bg-ink text-paper hover:bg-ink-soft shadow-card hover:shadow-float relative overflow-hidden shine disabled:hover:bg-ink dark:bg-paper dark:text-ink dark:hover:bg-white/90 dark:shadow-none',
  accent: 'bg-cyan-snap text-ink hover:bg-cyan-snap/90 shadow-card disabled:hover:bg-cyan-snap',
  neon: 'bg-neon text-ink hover:bg-neon/90 shadow-card disabled:hover:bg-neon',
  ghost: 'border border-ink/15 dark:border-paper/15 bg-transparent text-ink hover:border-ink/40 hover:bg-ink/5 dark:bg-paper/5 dark:text-paper dark:hover:border-paper/35 dark:hover:bg-paper/10 disabled:hover:bg-transparent disabled:dark:hover:bg-transparent',
  lightGhost: 'border border-white/20 bg-white/5 text-white hover:bg-white/10 disabled:hover:bg-white/5',
  danger: 'border border-coral/30 bg-coral/10 text-coral-deep hover:bg-coral/15 dark:text-coral disabled:hover:bg-coral/10',
  white: 'bg-white text-ink hover:bg-white/90 shadow-card disabled:hover:bg-white',
}

const sizes = {
  sm: 'px-4 py-2 text-sm',
  md: 'px-5 py-2.5 text-sm',
  lg: 'px-7 py-3.5 text-[15px]',
}

function mergeRefs(...refs) {
  return (node) => refs.forEach((r) => (typeof r === 'function' ? r(node) : r && (r.current = node)))
}

export const Button = forwardRef(function Button(
  { children, className, variant = 'primary', size = 'md', magnetic = true, as: Tag = 'button', ...props },
  ref,
) {
  const magicRef = useMagnetic(magnetic ? 0.3 : 0)
  return (
    <Tag
      ref={mergeRefs(ref, magicRef)}
      className={cn(base, variants[variant], sizes[size], 'select-none disabled:pointer-events-none disabled:opacity-50', className)}
      {...props}
    >
      {children}
    </Tag>
  )
})

export const GhostButton = forwardRef(function GhostButton(props, ref) {
  return <Button ref={ref} magnetic={false} variant="ghost" {...props} />
})
