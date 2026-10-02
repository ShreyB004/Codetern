import { forwardRef } from 'react'
import { cn } from '../../lib/utils.js'

const base =
  'inline-flex items-center justify-center gap-2 rounded-full font-semibold transition-all duration-300 focus-ring active:scale-[0.97]'

const variants = {
  primary: 'bg-ink text-paper hover:-translate-y-0.5 hover:shadow-float shadow-card disabled:hover:translate-none dark:bg-paper dark:text-ink dark:hover:bg-white/90 dark:shadow-none',
  accent: 'bg-cyan-snap text-ink hover:-translate-y-0.5 hover:shadow-card shadow-card',
  neon: 'bg-neon text-ink hover:-translate-y-0.5 hover:shadow-card shadow-card',
  ghost: 'border border-ink/15 bg-transparent text-ink hover:border-ink/40 hover:bg-ink/5 dark:border-paper/15 dark:text-paper dark:hover:border-paper/35 dark:hover:bg-paper/10',
  lightGhost: 'border border-white/20 bg-white/5 text-white hover:bg-white/10',
  danger: 'border border-coral/30 bg-coral/10 text-coral-deep hover:bg-coral/15 dark:text-coral',
  white: 'bg-white text-ink hover:-translate-y-0.5 hover:bg-white/90 shadow-card',
}

const sizes = {
  sm: 'px-4 py-2 text-sm',
  md: 'px-5 py-2.5 text-sm',
  lg: 'px-7 py-3.5 text-[15px]',
}

export const Button = forwardRef(function Button(
  { children, className, variant = 'primary', size = 'md', as: Tag = 'button', ...props },
  ref,
) {
  return (
    <Tag
      ref={ref}
      className={cn(base, variants[variant], sizes[size], 'select-none disabled:pointer-events-none disabled:opacity-50', className)}
      {...props}
    >
      {children}
    </Tag>
  )
})

export const GhostButton = forwardRef(function GhostButton(props, ref) {
  return <Button ref={ref} variant="ghost" {...props} />
})
