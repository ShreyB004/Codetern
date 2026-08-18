import { cn } from '../../lib/utils.js'
import { ScrollReveal } from './effects/ScrollReveal.jsx'

export function SectionHeading({ eyebrow, title, description, align = 'center', dark = false, className }) {
  return (
    <div className={cn('max-w-3xl', align === 'center' ? 'mx-auto text-center' : 'text-left', className)} data-reveal>
      {eyebrow && (
        <span
          className={cn(
            'mb-4 inline-flex items-center gap-2 rounded-bubble px-3.5 py-1.5 text-[11px] font-semibold uppercase tracking-[0.16em]',
            dark
              ? 'border-neon/40 bg-neon/10 text-neon'
              : 'border-cyan-deep/30 bg-cyan-deep/10 text-cyan-deep dark:border-cyan-snap/30 dark:bg-cyan-snap/10 dark:text-cyan-snap',
          )}
        >
          {eyebrow}
        </span>
      )}
      <ScrollReveal
        as="h2"
        className={cn(
          'font-display text-balance text-3xl font-bold leading-[1.08] tracking-tight sm:text-4xl lg:text-5xl',
          dark ? 'text-white' : 'text-ink dark:text-paper',
        )}
      >
        {title}
      </ScrollReveal>
      {description && (
        <p className={cn('mt-4 text-base leading-relaxed sm:text-lg', dark ? 'text-white/65' : 'text-ink/60 dark:text-paper/60')} data-reveal>
          {description}
        </p>
      )}
    </div>
  )
}