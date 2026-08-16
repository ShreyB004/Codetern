import { ArrowRight, ArrowUpRight } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useRevealScope } from '../../hooks/useReveal.js'
import { useTheme } from '../../context/ThemeContext.jsx'
import { useApp } from '../../context/AppContext.jsx'
import { DOMAIN_COLORS } from '../../data/programmes.js'
import { DomainIcon } from '../ui/Icon.jsx'

const CURATED = ['mern', 'frontend', 'backend', 'mobile', 'ai', 'uiux']

export function ProgrammeShowcase() {
  const scope = useRevealScope()
  const { isDark } = useTheme()
  const { programmes } = useApp()
  const navigate = useNavigate()

  const featured = CURATED.map((id) => programmes.find((p) => p.id === id)).filter(Boolean)

  return (
    <section ref={scope} className="cdt-lively relative overflow-hidden bg-paper py-24 dark:bg-ink">
      <div className="cdt-drift pointer-events-none absolute left-1/4 top-0 h-72 w-72 rounded-full bg-cyan-snap/8 blur-[120px]" />
      <div className="cdt-drift cdt-drift-slow cdt-drift-delayed pointer-events-none absolute bottom-0 right-1/4 h-72 w-72 rounded-full bg-violet-deep/8 blur-[120px]" />

      <div className="relative mx-auto max-w-6xl px-5 lg:px-8">
        <div className="mx-auto mb-12 max-w-2xl text-center" data-reveal>
          <span className="mb-4 inline-block rounded-bubble border border-cyan-deep/30 bg-cyan-deep/10 px-3.5 py-1.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-cyan-deep dark:border-cyan-snap/30 dark:bg-cyan-snap/10 dark:text-cyan-snap">
            Internship tracks
          </span>
          <h2 className="font-display text-3xl font-bold tracking-tight text-ink dark:text-paper sm:text-4xl">
            Pick a track. Ship something real.
          </h2>
          <p className="mt-3 text-sm text-ink/55 dark:text-paper/55">
            Six of the fourteen — the rest live on the domains page.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {featured.map((p, i) => {
            const c = DOMAIN_COLORS[p.color]
            return (
              <button
                key={p.id}
                onClick={() => navigate(`/domains?d=${p.id}`)}
                data-reveal
                style={{ transitionDelay: `${(i % 3) * 60}ms` }}
                className="group flex flex-col rounded-panel border border-ink/8 bg-white p-5 text-left transition-all duration-300 hover:-translate-y-1 hover:border-ink/20 hover:shadow-card dark:border-paper/10 dark:bg-ink-soft dark:hover:border-paper/30"
              >
                <div className="flex items-start justify-between">
                  <span
                    className="grid h-11 w-11 place-items-center rounded-xl transition-transform duration-300 group-hover:scale-105"
                    style={{ background: c.bg, color: isDark ? c.fg : 'var(--color-ink)' }}
                  >
                    <DomainIcon name={p.icon} size={18} />
                  </span>
                  <ArrowUpRight
                    size={16}
                    className="text-ink/25 transition-all duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-ink dark:text-paper/25 dark:group-hover:text-paper"
                  />
                </div>
                <p className="mt-4 font-display text-base font-bold text-ink dark:text-paper">{p.title}</p>
                <p className="mt-1 text-xs text-ink/50 dark:text-paper/50">{p.sub}</p>
                <p className="mt-4 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-ink/40 dark:text-paper/40">
                  {p.durations.join(' · ')} months
                  <span className="ml-auto flex items-center gap-1 text-cyan-deep dark:text-cyan-snap">
                    View <ArrowRight size={11} />
                  </span>
                </p>
              </button>
            )
          })}
        </div>

        <div className="mt-10 text-center" data-reveal>
          <button
            onClick={() => navigate('/domains')}
            className="group inline-flex min-h-11 items-center gap-1.5 rounded-full px-4 py-2 text-sm font-semibold text-ink transition-colors hover:text-violet-ink focus-ring dark:text-paper dark:hover:text-violet-deep"
          >
            Browse all 14 tracks
            <ArrowUpRight size={15} className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </button>
        </div>
      </div>
    </section>
  )
}
