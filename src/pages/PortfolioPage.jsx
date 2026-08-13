import { ArrowUpRight, Star } from 'lucide-react'
import { Page } from '../components/layout/Page.jsx'
import { useRevealScope } from '../hooks/useReveal.js'
import { PORTFOLIO_PROJECTS } from '../data/portfolio.js'
import { DOMAIN_COLORS } from '../data/programmes.js'
import { TiltCard } from '../components/ui/TiltCard.jsx'
import { cn } from '../lib/utils.js'
import { AuroraBackground } from '../components/ui/backgrounds/AuroraBackground.jsx'

export default function PortfolioPage() {
  const scope = useRevealScope()

  return (
    <Page className="overflow-hidden">
      <section className="relative overflow-hidden bg-ink py-20 text-white">
        <div className="grid-lines absolute inset-0 opacity-20" />
        <AuroraBackground className="opacity-50" />
        <div className="relative mx-auto max-w-4xl px-5 text-center lg:px-8">
          <span data-enter className="mb-5 inline-block rounded-bubble border border-neon/40 bg-neon/10 px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-neon">
            Live project gallery
          </span>
          <h1 data-enter className="font-display text-4xl font-extrabold leading-tight tracking-tight sm:text-6xl">
            Work our interns <span className="text-gradient-snap">actually shipped.</span>
          </h1>
          <p data-enter className="mx-auto mt-5 max-w-2xl text-base text-white/60">
            These aren’t tutorials and there’s no “demo project”. Each outcome below ran a real sprint loop — tickets,
            reviews and releases — the same way you’ll work inside Codetern.
          </p>
        </div>
      </section>

      <section ref={scope} className="bg-paper py-20 dark:bg-ink">
        <div className="mx-auto max-w-7xl px-5 lg:px-8">
          <div className="grid gap-7 sm:grid-cols-2 lg:grid-cols-3">
            {PORTFOLIO_PROJECTS.map((project, i) => {
              const color = DOMAIN_COLORS[project.domain]
              return (
                <div key={project.id} data-reveal style={{ transitionDelay: `${(i % 3) * 60}ms` }}>
                  <TiltCard max={6}>
                    <article className="group flex h-full flex-col overflow-hidden rounded-panel border border-ink/8 bg-white shadow-card transition-shadow duration-500 hover:shadow-float dark:border-paper/10 dark:bg-ink-soft dark:shadow-none">
                      <div className="relative h-44 overflow-hidden">
                        <div className="absolute inset-0" style={{ background: project.gradient }} />
                        {/* faux editor window */}
                        <div className="absolute inset-0 p-5">
                          <div className="flex h-full flex-col rounded-xl border border-white/20 bg-ink/30 backdrop-blur-sm">
                            <div className="flex items-center gap-1.5 border-b border-white/15 px-3 py-2">
                              <span className="h-2 w-2 rounded-full bg-white/60 dark:bg-ink-soft/60" />
                              <span className="h-2 w-2 rounded-full bg-white/35" />
                              <span className="h-2 w-2 rounded-full bg-white/20" />
                              <span className="ml-2 text-[10px] font-medium text-white/60">{project.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}.app</span>
                            </div>
                            <div className="flex-1 p-3 font-mono text-[10px] leading-relaxed text-white/70 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                              <p className="text-mint">$ npm run ship</p>
                              <p className="text-neon">✔ 32 tests passed</p>
                              <p className="text-white/70">deployed to production in 1m 12s</p>
                            </div>
                          </div>
                        </div>
                        <span
                          className="absolute left-4 top-4 rounded-bubble px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-ink dark:text-paper"
                          style={{ background: color.fg }}
                        >
                          {project.domain}
                        </span>
                        <span className="absolute right-4 top-4 grid h-8 w-8 place-items-center rounded-full bg-white/90 text-ink dark:text-paper shadow-card opacity-0 transition group-hover:opacity-100">
                          <ArrowUpRight size={15} />
                        </span>
                      </div>

                      <div className="flex flex-1 flex-col p-5">
                        <div className="flex items-start justify-between gap-2">
                          <h3 className="font-display text-lg font-bold leading-snug text-ink dark:text-paper">{project.title}</h3>
                          <span className="flex shrink-0 items-center gap-1 text-[11px] font-semibold text-ink/40 dark:text-paper/40">
                            <Star size={11} className="fill-neon text-neon" />
                            {project.year}
                          </span>
                        </div>
                        <p className="mt-2 flex-1 text-sm leading-relaxed text-ink/55 dark:text-paper/55">{project.description}</p>
                        <div className="mt-3 flex flex-wrap gap-1.5">
                          {project.stack.map((s) => (
                            <span key={s} className="rounded-bubble bg-ink/5 dark:bg-paper/5 px-2.5 py-0.5 text-[10px] font-semibold text-ink/55 dark:text-paper/55">
                              {s}
                            </span>
                          ))}
                        </div>
                        <div className="mt-4 flex items-center justify-between border-t border-ink/8 dark:border-paper/8 pt-3">
                          <p className="text-xs font-medium text-ink/45 dark:text-paper/45">by {project.intern}</p>
                          <div className="flex gap-2">
                            {project.metrics.map((m) => (
                              <span key={m} className={cn('rounded-bubble px-2 py-0.5 text-[10px] font-bold', 'bg-mint/10 text-mint')}>
                                {m}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </article>
                  </TiltCard>
                </div>
              )
            })}
          </div>
        </div>
      </section>
    </Page>
  )
}
