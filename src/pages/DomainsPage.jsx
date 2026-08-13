import { useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { ArrowRight, Check, ChevronDown, Filter, Search, Sparkles } from 'lucide-react'
import { Page } from '../components/layout/Page.jsx'
import { SectionHeading } from '../components/ui/SectionHeading.jsx'
import { SeatCounter } from '../components/ui/SeatCounter.jsx'
import { SeatGauge } from '../components/ui/SeatGauge.jsx'
import { DomainIcon } from '../components/ui/Icon.jsx'
import { useApp } from '../context/AppContext.jsx'
import { useSeats } from '../context/SeatsContext.jsx'
import { useLoginModal } from '../components/ui/LoginModal.jsx'
import { useToast } from '../context/ToastContext.jsx'
import { DURATIONS, DOMAIN_COLORS } from '../data/programmes.js'
import { useRevealScope } from '../hooks/useReveal.js'
import { cn } from '../lib/utils.js'
import { AuroraBackground } from '../components/ui/backgrounds/AuroraBackground.jsx'

const ALL = 'ALL'

export default function DomainsPage() {
  const scope = useRevealScope()
  const { programmes, isAuthenticated } = useApp()
  const { getRemaining, getTotal } = useSeats()
  const [params] = useSearchParams()
  const openLogin = useLoginModal()
  const { push } = useToast()
  const navigate = useNavigate()

  const preselect = params.get('d')
  const [duration, setDuration] = useState(ALL)
  const [q, setQ] = useState('')
  const [expanded, setExpanded] = useState(preselect || null)

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase()
    return programmes.filter((p) => {
      if (duration !== ALL && !p.durations.includes(duration)) return false
      if (!term) return true
      return [p.title, p.sub, p.tagline, ...p.stack].join(' ').toLowerCase().includes(term)
    })
  }, [duration, q, programmes])

  const resign = (p) => {
    setExpanded(expanded === p.id ? null : p.id)
    navigate(`/domains?d=${p.id}`, { replace: true })
  }

  const apply = (p, dur) => {
    const d = dur || (p.durations.includes(3) ? 3 : p.durations[0])
    push(`Applying for ${p.title} (${d}-month)…`, 'info')
    if (isAuthenticated) {
      navigate(`/dashboard?d=${p.id}`)
    } else {
      openLogin('signup')
    }
  }

  return (
    <Page className="overflow-hidden">
      {/* ── hero ── */}
      <section className="relative overflow-hidden bg-ink py-20 text-white">
        <div className="grid-lines absolute inset-0 opacity-20" />
        <AuroraBackground className="opacity-40" />
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

          {/* search + duration tabs */}
          <div data-enter className="mx-auto mt-10 max-w-2xl">
            <div className="relative mb-4">
              <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-white/35">
                <Search size={16} />
              </span>
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search tracks — React, Python, Figma, security…"
                className="w-full rounded-full border border-white/15 bg-white/5 py-3.5 pl-11 pr-4 text-sm text-white outline-none transition placeholder:text-white/30 focus:border-cyan-snap/60 focus:bg-white/10"
              />
            </div>
            <div className="flex flex-wrap items-center justify-center gap-2">
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
        </div>
      </section>

      {/* ── track grid ── */}
      <section ref={scope} className="bg-paper py-20 dark:bg-ink">
        <div className="mx-auto max-w-7xl px-5 lg:px-8">
          <SectionHeading
            eyebrow={`${filtered.length} programme${filtered.length === 1 ? '' : 's'} · live seats`}
            title={q ? `Results for “${q}”` : duration === ALL ? 'All career tracks' : `${duration}-month career tracks`}
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
                    'group relative overflow-hidden rounded-panel border bg-white shadow-card transition-all duration-500 dark:bg-ink-soft dark:shadow-none',
                    isOpen ? 'border-cyan-snap/40 shadow-float' : 'border-ink/8 hover:-translate-y-1 hover:shadow-float dark:border-paper/10',
                  )}
                >
                  {/* gradient header band */}
                  <div className="relative h-20 overflow-hidden" style={{ background: `linear-gradient(120deg, ${color.bg}, transparent 70%)` }}>
                    <div className="absolute inset-0 opacity-20" style={{ background: `radial-gradient(circle at 80% 20%, ${color.fg}, transparent 60%)` }} />
                    <span
                      className="absolute -bottom-6 left-5 grid h-16 w-16 place-items-center rounded-2xl shadow-float transition-transform duration-500 group-hover:scale-110 group-hover:-rotate-6"
                      style={{ background: color.fg, color: '#0b0e1a' }}
                    >
                      <DomainIcon name={p.icon} size={28} />
                    </span>
                    <span className="absolute right-4 top-4 rounded-bubble px-3 py-1 text-[10px] font-bold uppercase tracking-wider" style={{ background: color.bg, color: color.fg }}>
                      {p.sub}
                    </span>
                  </div>

                  <button onClick={() => resign(p)} className="block w-full p-6 pt-7 text-left">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <h3 className="font-display text-lg font-bold text-ink dark:text-paper">{p.title}</h3>
                        <p className="mt-1 text-sm text-ink/50 dark:text-paper/50">{p.tagline}</p>
                      </div>
                      <ArrowRight
                        size={18}
                        className={cn(
                          'mt-1 shrink-0 text-ink/30 transition-transform duration-300 dark:text-paper/30',
                          isOpen && 'rotate-90 text-cyan-snap',
                        )}
                      />
                    </div>

                    <div className="mt-4 flex flex-wrap gap-1.5">
                      {p.stack.map((s) => (
                        <span key={s} className="rounded-bubble bg-ink/5 px-3 py-1 text-[11px] font-semibold text-ink/60 dark:bg-paper/5 dark:text-paper/60">
                          {s}
                        </span>
                      ))}
                    </div>

                    <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                      <SeatCounter remaining={remaining} total={total} duration={dur} />
                      <span className="flex items-center gap-1 text-xs font-medium text-ink/40 dark:text-paper/40">
                        {p.durations.join(' · ')} month tracks
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
                      <div className="border-t border-ink/8 bg-paper/60 p-6 dark:border-paper/10 dark:bg-ink">
                        <p className="text-sm leading-relaxed text-ink/60 dark:text-paper/60">{p.description}</p>
                        <ul className="mt-4 grid gap-2 sm:grid-cols-2">
                          {p.outcomes.map((o) => (
                            <li key={o} className="flex items-center gap-2 text-sm font-medium text-ink/75 dark:text-paper/75">
                              <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-mint/15 text-mint">
                                <Check size={12} strokeWidth={3} />
                              </span>
                              {o}
                            </li>
                          ))}
                        </ul>
                        <div className="mt-6 flex flex-wrap items-center gap-6">
                          <div className="flex items-center gap-4">
                            <SeatGauge remaining={remaining} total={total} size={88} />
                            <div>
                              <p className="text-sm font-bold text-ink dark:text-paper">{remaining} of {total} seats live</p>
                              <p className="mt-0.5 text-xs text-ink/50 dark:text-paper/50">syncs with the public counter in real time</p>
                            </div>
                          </div>
                          <div className="ml-auto flex flex-wrap items-center gap-3">
                            <button
                              onClick={() => apply(p, dur)}
                              className="flex items-center gap-2 rounded-full bg-ink px-6 py-2.5 text-sm font-semibold text-paper transition hover:bg-ink-soft dark:bg-paper dark:text-ink dark:hover:bg-paper/85"
                            >
                              <Sparkles size={14} className="text-neon" /> Apply now
                            </button>
                            <button
                              onClick={() => navigate('/contact')}
                              className="rounded-full border border-ink/15 px-6 py-2.5 text-sm font-semibold text-ink transition hover:bg-ink/5 dark:border-paper/20 dark:text-paper dark:hover:bg-paper/5"
                            >
                              Ask a mentor
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* subtle expand hint */}
                  <div className="pointer-events-none absolute bottom-0 left-0 right-0 flex items-center justify-center gap-1 bg-gradient-to-t from-ink/5 to-transparent pb-1.5 pt-4 text-[10px] font-bold uppercase tracking-widest text-ink/30 opacity-0 transition-opacity duration-300 group-hover:opacity-100 dark:text-paper/30">
                    <ChevronDown size={12} className={cn('transition-transform', isOpen && 'rotate-180')} /> {isOpen ? 'Collapse' : 'Expand'}
                  </div>
                </div>
              )
            })}
          </div>

          {filtered.length === 0 && (
            <p className="py-16 text-center text-ink/50 dark:text-paper/50">No programmes match — try another filter.</p>
          )}
        </div>
      </section>
    </Page>
  )
}