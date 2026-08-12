import { forwardRef } from 'react'
import { cn } from '../../lib/utils.js'
import { useMagnetic } from '../../hooks/useMagnetic.js'

const base =
  'inline-flex items-center justify-center gap-2 rounded-full font-semibold transition-colors duration-300 will-change-transform'

const variants = {
  primary: 'bg-ink text-paper hover:bg-ink-soft shadow-card hover:shadow-float relative overflow-hidden shine',
  accent: 'bg-cyan-snap text-ink hover:bg-cyan-snap/90 shadow-card',
  neon: 'bg-neon text-ink hover:bg-neon/90 shadow-card',
  ghost: 'border border-ink/15 bg-transparent text-ink hover:border-ink/40 hover:bg-ink/5',
  lightGhost: 'border border-white/20 bg-white/5 text-white hover:bg-white/10',
  danger: 'bg-coral/10 text-coral border border-coral/30 hover:bg-coral/15',
  white: 'bg-white text-ink hover:bg-white/90 shadow-card',
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
    <Tag ref={mergeRefs(ref, magicRef)} className={cn(base, variants[variant], sizes[size], 'select-none', className)} {...props}>
      {children}
    </Tag>
  )
})

export const GhostButton = forwardRef(function GhostButton(props, ref) {
  return <Button ref={ref} magnetic={false} variant="ghost" {...props} />
})