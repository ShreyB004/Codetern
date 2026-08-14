import { Quote } from 'lucide-react'
import { TESTIMONIALS } from '../../data/portfolio.js'
import { useRevealScope } from '../../hooks/useReveal.js'
import { useTheme } from '../../context/ThemeContext.jsx'
import { TiltCard } from '../ui/TiltCard.jsx'
import { ConstellationBackground } from '../ui/backgrounds/ConstellationBackground.jsx'
import { ScrollReveal } from '../ui/effects/ScrollReveal.jsx'

export function Testimonials() {
  const scope = useRevealScope()
  const { isDark } = useTheme()

  return (
    <section ref={scope} className="relative overflow-hidden bg-paper py-24 text-ink dark:bg-ink dark:text-paper">
      <div className="pointer-events-none absolute left-1/2 top-0 h-80 w-[720px] -translate-x-1/2 rounded-full bg-violet-deep/15 blur-[140px]" />
      <ConstellationBackground count={36} className="opacity-70" />
      <div className="relative mx-auto max-w-7xl px-5 lg:px-8">
        <div className="mx-auto mb-14 max-w-2xl text-center" data-reveal>
          <span className="mb-4 inline-block rounded-bubble border border-neon-deep/40 bg-neon-deep/10 px-3.5 py-1.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-neon-deep dark:border-neon/40 dark:bg-neon/10 dark:text-neon">
            Real outcomes
          </span>
          <ScrollReveal
            as="h2"
            className="font-display text-3xl font-bold tracking-tight sm:text-5xl"
            colors={isDark ? ['transparent', 'transparent', 'transparent', 'transparent', 'transparent', '#22d3ee', 'transparent', '#b4ff39'] : ['transparent', 'transparent', 'transparent', 'transparent', 'transparent', '#0e7490', 'transparent', '#4d7c0f']}
          >
            Interns who did the work got the job.
          </ScrollReveal>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {TESTIMONIALS.map((t, i) => (
            <div key={t.name} data-reveal style={{ transitionDelay: `${i * 70}ms` }}>
              <TiltCard max={6}>
                <figure className="relative flex h-full flex-col rounded-panel border border-ink/10 bg-ink/[0.05] p-6 shadow-card backdrop-blur-md dark:border-white/10 dark:bg-white/[0.07]">
                  <Quote size={26} className="text-neon-deep/70 dark:text-neon/70" />
                  <blockquote className="mt-4 flex-1 text-sm leading-relaxed text-ink/75 dark:text-paper/75">“{t.quote}”</blockquote>
                  <figcaption className="mt-6 flex items-center gap-3 border-t border-ink/10 pt-5 dark:border-white/10">
                    <span
                      className="grid h-11 w-11 place-items-center rounded-full text-xs font-bold text-white"
                      style={{ background: `linear-gradient(rgba(11,14,26,0.45), rgba(11,14,26,0.45)), ${t.gradient}` }}
                    >
                      {t.avatar}
                    </span>
                    <div>
                      <p className="text-sm font-bold">{t.name}</p>
                      <p className="text-xs text-ink/55 dark:text-paper/55">{t.role}</p>
                    </div>
                  </figcaption>
                </figure>
              </TiltCard>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}