import { Quote } from 'lucide-react'
import { TESTIMONIALS } from '../../data/portfolio.js'
import { useRevealScope } from '../../hooks/useReveal.js'
import { TiltCard } from '../ui/TiltCard.jsx'

export function Testimonials() {
  const scope = useRevealScope()

  return (
    <section ref={scope} className="relative overflow-hidden bg-ink py-24 text-white">
      <div className="pointer-events-none absolute left-1/2 top-0 h-80 w-[720px] -translate-x-1/2 rounded-full bg-violet-deep/15 blur-[140px]" />
      <div className="relative mx-auto max-w-7xl px-5 lg:px-8">
        <div className="mx-auto mb-14 max-w-2xl text-center" data-reveal>
          <span className="mb-4 inline-block rounded-bubble border border-neon/40 bg-neon/10 px-3.5 py-1.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-neon">
            Real outcomes
          </span>
          <h2 className="font-display text-3xl font-bold tracking-tight sm:text-5xl">
            Interns who did the work <span className="text-gradient-snap">got the job.</span>
          </h2>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {TESTIMONIALS.map((t, i) => (
            <div key={t.name} data-reveal style={{ transitionDelay: `${i * 70}ms` }}>
              <TiltCard max={6}>
                <figure className="relative flex h-full flex-col rounded-panel border border-white/10 bg-white/[0.04] p-6 shadow-card backdrop-blur-sm">
                  <Quote size={26} className="text-neon/70" />
                  <blockquote className="mt-4 flex-1 text-sm leading-relaxed text-white/75">“{t.quote}”</blockquote>
                  <figcaption className="mt-6 flex items-center gap-3 border-t border-white/10 pt-5">
                    <span
                      className="grid h-11 w-11 place-items-center rounded-full text-xs font-bold text-ink dark:text-paper"
                      style={{ background: t.gradient }}
                    >
                      {t.avatar}
                    </span>
                    <div>
                      <p className="text-sm font-bold">{t.name}</p>
                      <p className="text-xs text-white/45">{t.role}</p>
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