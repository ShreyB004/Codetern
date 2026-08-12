import { useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { ArrowRight, Check, Filter } from 'lucide-react'
import { Page } from '../components/layout/Page.jsx'
import { SectionHeading } from '../components/ui/SectionHeading.jsx'
import { SeatCounter } from '../components/ui/SeatCounter.jsx'
import { DomainIcon } from '../components/ui/Icon.jsx'
import { useApp } from '../context/AppContext.jsx'
import { useSeats } from '../context/SeatsContext.jsx'
import { useLoginModal } from '../components/ui/LoginModal.jsx'
import { DURATIONS, DOMAIN_COLORS } from '../data/programmes.js'
import { useRevealScope } from '../hooks/useReveal.js'
import { cn } from '../lib/utils.js'
import { useToast } from '../context/ToastContext.jsx'
import { useNavigate } from 'react-router-dom'

const ALL = 'ALL'

export default function DomainsPage() {
  const scope = useRevealScope()
  const { programmes } = useApp()
  const { getRemaining, getTotal } = useSeats()
  const [params] = useSearchParams()
  const openLogin = useLoginModal()
  const { push } = useToast()
  const navigate = useNavigate()

  const preselect = params.get('d')
  const [duration, setDuration] = useState(ALL)
  const [expanded, setExpanded] = useState(preselect || null)

  const filtered = useMemo(() => {
    if (duration === ALL) return programmes
    return programmes.filter((p) => p.durations.includes(duration))
  }, [duration, programmes])

  const resign = (p) => {
    setExpanded(expanded === p.id ? null : p.id)
    navigate(`/domains?d=${p.id}`, { replace: true })
  }

  return (
    <Page className="overflow-hidden">
      <section className="relative overflow-hidden bg-ink py-20 text-white">
        <div className="grid-lines absolute inset-0 opacity-20" />
        <div className="pointer-events-none absolute left-1/2 top-[-30%] h-96 w-[760px] -translate-x-1/2 rounded-full bg-cyan-snap/15 blur-[120px]" />
        <div className="relative mx-auto max-w-4xl px-5 text-center lg:px-8">
          <span data-enter className="mb-5 inline-block rounded-bubble border border-neon/40 bg-neon/10 px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-neon">
            Career tracks
          </span>
          <h1 data-enter className="font-display text-4xl font-extrabold leading-tight tracking-tight sm:text-6xl">
            Fourteen ways to get a <span className="text-gradient-snap">head start.</span>
          </h1>
          <p data-enter className="mx-auto mt-5 max-w-2xl text-base text-white/60">
            Every track includes live seat counts, a screening quiz and an AI mock interview before you begin. Pick a
            duration and claim your seat while it lasts.
          </p>

          {/* duration tabs */}
          <div data-enter className="mx-auto mt-10 flex max-w-xl flex-wrap items-center justify-center gap-2">
            <button
              onClick={() => setDuration(ALL)}
              className={cn(
                'inline-flex items-center gap-1.5 rounded-full px-5 py-2.5 text-sm font-semibold transition-all',
                duration === ALL ? 'bg-neon text-ink shadow-card' : 'border border-white/15 bg-white/5 text-white/70 hover:bg-white/10',
              )}
            >
              <Filter size={14} />
              All
            </button>
            {DURATIONS.map((d) => (
              <button
                key={d}
                onClick={() => setDuration(d)}
                className={cn(
                  'rounded-full px-5 py-2.5 text-sm font-semibold transition-all',
                  duration === d ? 'bg-neon text-ink shadow-card' : 'border border-white/15 bg-white/5 text-white/70 hover:bg-white/10',
                )}
              >
                {d} Month{d > 1 ? 's' : ''}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section ref={scope} className="bg-paper py-20">
        <div className="mx-auto max-w-7xl px-5 lg:px-8">
          <SectionHeading
            eyebrow={`${filtered.length} programmes`}
            title={duration === ALL ? 'All career tracks' : `${duration}-month career tracks`}
            align="left"
            className="mb-12"
          />

          <div className="grid gap-6 lg:grid-cols-2">
            {filtered.map((p, i) => {
              const color = DOMAIN_COLORS[p.color]
              const isOpen = expanded === p.id
              const dur = duration !== ALL ? duration : p.durations.includes(3) ? 3 : p.durations[0]
              const remaining = getRemaining(p.id, dur)
              const total = getTotal(p.id, dur)
              return (
                <div
                  key={p.id}
                  data-reveal
                  style={{ transitionDelay: `${(i % 2) * 60}ms` }}
                  className={cn(
                    'group overflow-hidden rounded-panel border bg-white shadow-card transition-all duration-500',
                    isOpen ? 'border-cyan-snap/40 shadow-float' : 'border-ink/8 hover:-translate-y-1 hover:shadow-float',
                  )}
                >
                  <button onClick={() => resign(p)} className="block w-full p-6 text-left">
                    <div className="flex items-start gap-4">
                      <span
                        className="grid h-13 w-13 shrink-0 place-items-center rounded-2xl transition-transform duration-300 group-hover:scale-110"
                        style={{ background: color.bg, color: color.fg }}
                      >
                        <DomainIcon name={p.icon} size={24} />
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="font-display text-lg font-bold text-ink">{p.title}</h3>
                          <span className="rounded-bubble px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider" style={{ background: color.bg, color: color.fg }}>
                            {p.sub}
                          </span>
                        </div>
                        <p className="mt-1 text-sm text-ink/50">{p.tagline}</p>
                      </div>
                      <ArrowRight
                        size={18}
                        className={cn(
                          'mt-2 shrink-0 text-ink/30 transition-transform duration-300',
                          isOpen && 'rotate-90 text-cyan-snap',
                        )}
                      />
                    </div>

                    <div className="mt-4 flex flex-wrap gap-1.5">
                      {p.stack.map((s) => (
                        <span key={s} className="rounded-bubble bg-ink/5 px-3 py-1 text-[11px] font-semibold text-ink/60">
                          {s}
                        </span>
                      ))}
                    </div>

                    <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                      <SeatCounter remaining={remaining} total={total} duration={dur} />
                      <span className="flex items-center gap-1 text-xs font-medium text-ink/40">
                        {p.durations.join(' · ')} month tracks available
                      </span>
                    </div>
                  </button>

                  {/* expandable */}
                  <div
                    className={cn(
                      'grid transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]',
                      isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0',
                    )}
                  >
                    <div className="overflow-hidden">
                      <div className="border-t border-ink/8 bg-paper/60 p-6">
                        <p className="text-sm leading-relaxed text-ink/60">{p.description}</p>
                        <ul className="mt-4 grid gap-2 sm:grid-cols-2">
                          {p.outcomes.map((o) => (
                            <li key={o} className="flex items-center gap-2 text-sm font-medium text-ink/75">
                              <Check size={15} className="text-mint" />
                              {o}
                            </li>
                          ))}
                        </ul>
                        <div className="mt-6 flex flex-wrap gap-3">
                          <button
                            onClick={() => {
                              push(`Reserving ${p.title} (${dur}-month) — proceed in dashboard`, 'info')
                              openLogin('signup')
                            }}
                            className="rounded-full bg-ink px-6 py-2.5 text-sm font-semibold text-paper transition hover:bg-ink-soft"
                          >
                            Reserve seat →
                          </button>
                          <button
                            onClick={() => navigate('/contact')}
                            className="rounded-full border border-ink/15 px-6 py-2.5 text-sm font-semibold text-ink transition hover:bg-ink/5"
                          >
                            Ask a mentor
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          {filtered.length === 0 && (
            <p className="py-16 text-center text-ink/50">No programmes for this duration yet — try another tab.</p>
          )}
        </div>
      </section>
    </Page>
  )
}