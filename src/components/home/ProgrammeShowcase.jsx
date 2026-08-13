import { useNavigate } from 'react-router-dom'
import { ArrowUpRight, Check } from 'lucide-react'
import { useRevealScope } from '../../hooks/useReveal.js'
import { useApp } from '../../context/AppContext.jsx'
import { useSeats } from '../../context/SeatsContext.jsx'
import { DOMAIN_COLORS } from '../../data/programmes.js'
import { SeatCounter } from '../ui/SeatCounter.jsx'
import { DomainIcon } from '../ui/Icon.jsx'

export function ProgrammeShowcase() {
  const scope = useRevealScope()
  const { programmes } = useApp()
  const { getRemaining, getTotal } = useSeats()
  const navigate = useNavigate()

  const featured = programmes.slice(0, 8)

  return (
    <section ref={scope} className="bg-paper py-24 dark:bg-ink">
      <div className="mx-auto max-w-7xl px-5 lg:px-8">
        <div className="mb-12 flex flex-col items-start justify-between gap-4 lg:flex-row lg:items-end" data-reveal>
          <div>
            <span className="mb-4 inline-block rounded-bubble border border-cyan-snap/30 bg-cyan-snap/10 px-3.5 py-1.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-cyan-snap">
              Trending tracks
            </span>
            <h2 className="font-display text-3xl font-bold tracking-tight text-ink dark:text-paper sm:text-4xl">
              Domains with live seats right now
            </h2>
          </div>
          <button
            onClick={() => navigate('/domains')}
            className="group inline-flex items-center gap-1.5 text-sm font-semibold text-ink dark:text-paper transition hover:text-cyan-snap"
          >
            See all programmes
            <ArrowUpRight size={15} className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </button>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {featured.map((p, i) => {
            const color = DOMAIN_COLORS[p.color]
            const dur = p.durations.includes(3) ? 3 : p.durations[0]
            const remaining = getRemaining(p.id, dur)
            const total = getTotal(p.id, dur)
            return (
              <button
                key={p.id}
                data-reveal
                onClick={() => navigate(`/domains?d=${p.id}`)}
                className="group relative flex flex-col overflow-hidden rounded-panel border border-ink/8 bg-white dark:border-paper/10 dark:bg-ink-soft p-5 text-left shadow-card transition-all duration-500 hover:-translate-y-1.5 hover:shadow-float"
                style={{ transitionDelay: `${(i % 4) * 50}ms` }}
              >
                <div className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full blur-2xl transition-opacity duration-500 opacity-0 group-hover:opacity-100" style={{ background: color.bg }} />
                <div className="relative flex items-start justify-between gap-3">
                  <span
                    className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl"
                    style={{ background: color.bg, color: color.fg }}
                  >
                    <DomainIcon name={p.icon} size={20} />
                  </span>
                  <span className="flex flex-col items-end gap-1.5">
                    <SeatCounter remaining={remaining} total={total} duration={dur} compact />
                  </span>
                </div>
                <h3 className="relative mt-4 font-display text-lg font-bold leading-snug text-ink dark:text-paper">{p.title}</h3>
                <p className="relative mt-1 text-xs font-medium text-ink/45 dark:text-paper/45">{p.sub}</p>

                <div className="relative mt-4 flex flex-wrap gap-1.5">
                  {p.stack.slice(0, 4).map((s) => (
                    <span key={s} className="rounded-bubble bg-ink/5 dark:bg-paper/5 px-2.5 py-1 text-[10px] font-semibold text-ink/60 dark:text-paper/60">
                      {s}
                    </span>
                  ))}
                </div>

                <div className="relative mt-5 flex items-center justify-between border-t border-ink/8 dark:border-paper/8 pt-4">
                  <span className="flex items-center gap-1.5 text-xs font-semibold text-ink/55 dark:text-paper/55">
                    <Check size={13} className="text-mint" />
                    {dur}-month track
                  </span>
                  <span className="text-xs font-bold text-cyan-snap opacity-0 transition group-hover:opacity-100">
                    Reserve →
                  </span>
                </div>
              </button>
            )
          })}
        </div>
      </div>
    </section>
  )
}
