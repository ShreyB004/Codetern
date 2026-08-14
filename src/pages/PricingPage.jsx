import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowRight, BadgeCheck, Check, FileSignature, GraduationCap, HeartHandshake, Rocket, ShieldCheck, Sparkles, Wallet } from 'lucide-react'
import { Page } from '../components/layout/Page.jsx'
import { Button } from '../components/ui/Button.jsx'
import { DomainIcon } from '../components/ui/Icon.jsx'
import { useApp } from '../context/AppContext.jsx'
import { useLoginModal } from '../components/ui/LoginModal.jsx'
import { PROGRAMMES, getProgramme, DOMAIN_COLORS } from '../data/programmes.js'
import { DURATIONS, INCLUDED, batchPrice } from '../data/plans.js'
import { cn } from '../lib/utils.js'
import { AuroraGlow } from '../components/ui/backgrounds/AuroraGlow.jsx'
import { ScrollReveal } from '../components/ui/effects/ScrollReveal.jsx'
import { useTheme } from '../context/ThemeContext.jsx'

export default function PricingPage() {
  const { isAuthenticated } = useApp()
  const { isDark } = useTheme()
  const navigate = useNavigate()
  const openLogin = useLoginModal()

  const [domain, setDomain] = useState('mern')
  const [months, setMonths] = useState(3)

  const programme = getProgramme(domain)
  const color = DOMAIN_COLORS[programme.color]
  const price = useMemo(() => batchPrice(months), [months])

  const start = () => {
    if (isAuthenticated) {
      navigate(`/dashboard?d=${domain}&dur=${months}`)
    } else {
      openLogin('signup')
    }
  }

  return (
    <Page className="overflow-hidden">
      {/* ── hero ── */}
      <section className="relative overflow-hidden bg-paper py-20 text-ink dark:bg-ink dark:text-paper">
        <div className="grid-lines absolute inset-0 opacity-20" />
        <AuroraGlow className="opacity-60" />
        <div className="relative mx-auto max-w-4xl px-5 text-center lg:px-8">
          <span className="mb-5 inline-block rounded-bubble border border-neon-deep/40 bg-neon-deep/10 px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-neon-deep dark:border-neon/40 dark:bg-neon/10 dark:text-neon">
            One flat batch price
          </span>
          <ScrollReveal
            as="h1"
            className="font-display text-4xl font-extrabold leading-tight tracking-tight sm:text-6xl"
            colors={isDark ? ['transparent', 'transparent', 'transparent', 'transparent', 'transparent', '#38ffb0', 'transparent', '#22d3ee', '#7c5cff'] : ['transparent', 'transparent', 'transparent', 'transparent', 'transparent', '#047857', 'transparent', '#0e7490', '#5b21b6']}
          >
            Pick a domain, pick a batch length. That&apos;s the price.
          </ScrollReveal>
          <p className="mx-auto mt-5 max-w-2xl text-base text-ink/60 dark:text-white/60">
            No per-month subscriptions, no hidden tiers. One fixed fee covers the whole batch —
            longer batches simply cost less per month. Pick 1, 2, 3 or 6 months.
          </p>
        </div>
      </section>

      {/* ── domain picker ── */}
      <section className="relative mx-auto -mt-12 max-w-6xl px-5 pb-24 lg:px-8">
        <div className="rounded-panel border border-ink/10 bg-white p-5 shadow-float sm:p-7 dark:border-paper/10 dark:bg-ink-soft dark:shadow-none" data-enter>
          <p className="mb-1 text-sm font-bold text-ink dark:text-paper">1 · Choose your domain</p>
          <p className="mb-5 text-xs text-ink/55 dark:text-paper/55">Each track has its own mentor, stack and live-project load — the batch price stays flat across all of them.</p>

          <div className="relative">
            <div className="cdt-scroll-slim grid max-h-[340px] grid-cols-1 gap-2.5 overflow-y-auto pr-2 sm:grid-cols-2">
              {PROGRAMMES.map((p, i) => {
                const c = DOMAIN_COLORS[p.color]
                const active = domain === p.id
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => { setDomain(p.id); if (!getProgramme(p.id).durations.includes(months)) setMonths(getProgramme(p.id).durations[0]) }}
                    aria-pressed={active}
                    style={{ transitionDelay: `${Math.min(i, 12) * 18}ms` }}
                    className={cn(
                      'group relative flex items-center gap-3 rounded-2xl border px-3.5 py-3 text-left transition-all duration-300',
                      active
                        ? 'border-ink bg-ink text-white dark:border-paper dark:bg-paper dark:text-ink'
                        : 'border-ink/10 bg-paper/60 hover:-translate-y-0.5 hover:border-ink/30 hover:shadow-card dark:border-paper/10 dark:bg-ink dark:hover:border-paper/30',
                    )}
                  >
                    <span
                      className="grid h-10 w-10 shrink-0 place-items-center rounded-xl transition-all duration-300 group-hover:scale-110"
                      style={active ? { background: c.fg, color: 'var(--color-ink)' } : { background: c.bg, color: isDark ? c.fg : 'var(--color-ink)' }}
                    >
                      <DomainIcon name={p.icon} size={17} />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className={cn('block truncate text-[13px] font-bold leading-tight transition-colors duration-300', active ? 'text-white dark:text-ink' : 'text-ink dark:text-paper')}>
                        {p.title}
                      </span>
                      <span className={cn('mt-0.5 block truncate text-[10px] font-medium transition-colors duration-300', active ? 'text-white/60 dark:text-ink/60' : 'text-ink/45 dark:text-paper/45')}>
                        {p.sub}
                      </span>
                    </span>
                    <span className="mx-1 hidden shrink-0 flex-col items-end gap-1 sm:flex">
                      {p.durations.map((d) => (
                        <span key={d} className={cn('rounded-bubble px-1.5 py-px text-[9px] font-bold transition-colors duration-300', active ? 'bg-white/10 text-white/80 dark:bg-ink/10 dark:text-ink/80' : 'bg-ink/5 text-ink/50 dark:bg-paper/5 dark:text-paper/50')}>
                          {d}mo
                        </span>
                      ))}
                    </span>
                    {active && (
                      <span className="absolute -right-1.5 -top-1.5 grid h-5 w-5 place-items-center rounded-full bg-neon text-ink shadow-card animate-in">
                        <Check size={11} strokeWidth={3} />
                      </span>
                    )}
                  </button>
                )
              })}
            </div>
            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-10 rounded-b-2xl bg-gradient-to-t from-white to-transparent dark:from-ink-soft" />
          </div>

          {/* ── duration picker + price panel ── */}
          <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_360px]">
            <div>
              <p className="mb-1 text-sm font-bold text-ink dark:text-paper">2 · Pick your batch length</p>
              <p className="mb-5 text-xs text-ink/55 dark:text-paper/55">
                One fixed price for the entire batch — not a monthly charge. The struck-through price is the launch marker; you pay the price below.
              </p>
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                {DURATIONS.map((d) => {
                  const available = programme.durations.includes(d)
                  const p = batchPrice(d)
                  const active = months === d
                  return (
                    <button
                      key={d}
                      type="button"
                      disabled={!available}
                      onClick={() => setMonths(d)}
                      aria-pressed={active}
                      className={cn(
                        'relative flex flex-col rounded-2xl border p-4 text-left transition-all duration-300',
                        available && 'hover:-translate-y-1 hover:shadow-card',
                        active
                          ? 'border-neon-deep/60 bg-neon-deep/8 ring-4 ring-neon-deep/10 dark:border-neon/60 dark:bg-neon/8 dark:ring-neon/10'
                          : available
                            ? 'border-ink/10 bg-paper/60 dark:border-paper/10 dark:bg-ink'
                            : 'cursor-not-allowed border-ink/5 opacity-40 dark:border-paper/5',
                      )}
                    >
                      {!available && (
                        <span className="absolute right-2.5 top-2.5 text-[9px] font-bold uppercase tracking-wider text-ink/35 dark:text-paper/35">
                          n/a
                        </span>
                      )}
                      <p className="font-display text-2xl font-extrabold text-ink dark:text-paper">
                        {d}<span className="ml-1 text-xs font-bold text-ink/40 dark:text-paper/40">month{d > 1 ? 's' : ''}</span>
                      </p>
                      <div className="mt-2 flex flex-wrap items-baseline gap-x-2 gap-y-1">
                        <span className={cn('text-sm font-bold line-through decoration-[1.5px]', active ? 'text-neon-deep/45 dark:text-neon/45' : 'text-ink/35 dark:text-paper/35')}>
                          ₹{p.original}
                        </span>
                        <span className="font-display text-2xl font-extrabold tracking-tight text-ink dark:text-paper">₹{p.total}</span>
                      </div>
                      <p className="mt-0.5 text-[10px] font-semibold text-ink/45 dark:text-paper/45">whole batch</p>
                      {p.saved > 0 && available && (
                        <span className="mt-2 self-start rounded-bubble bg-mint-deep/10 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-mint-deep dark:bg-mint/10 dark:text-mint">
                          Save ₹{p.saved}
                        </span>
                      )}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* ── summary ── */}
            <div className="self-start rounded-2xl border border-ink/10 bg-paper/60 p-5 dark:border-paper/10 dark:bg-ink">
              <div className="flex items-center gap-3">
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl" style={{ background: color.bg, color: 'var(--color-ink)' }}>
                  <DomainIcon name={programme.icon} size={18} />
                </span>
                <div className="min-w-0">
                  <p className="truncate text-sm font-bold text-ink dark:text-paper">{programme.title}</p>
                  <p className="text-[11px] text-ink/50 dark:text-paper/50">{programme.sub} · {months}-month batch</p>
                </div>
              </div>

              <div className="mt-5 grid gap-2.5 text-sm">
                <div className="flex justify-between gap-3">
                  <span className="text-ink/55 dark:text-paper/55">Launch marker (struck off)</span>
                  <span className="font-semibold line-through text-ink/45 dark:text-paper/45">₹{price.original}</span>
                </div>
                <div className="flex justify-between gap-3">
                  <span className="text-ink/55 dark:text-paper/55">You save today</span>
                  <span className="font-semibold text-mint-deep dark:text-mint">−₹{price.saved}</span>
                </div>
                <div className="flex items-end justify-between border-t border-ink/8 pt-3 dark:border-paper/10">
                  <span className="text-xs font-bold uppercase tracking-widest text-ink/45 dark:text-paper/45">You pay</span>
                  <span className="font-display text-3xl font-extrabold text-ink dark:text-paper">₹{price.total}</span>
                </div>
              </div>

              <Button size="lg" variant="neon" className="mt-5 w-full" onClick={start}>
                <Rocket size={16} /> Book this batch
              </Button>
              <p className="mt-3 text-center text-[11px] text-ink/40 dark:text-paper/40">
                Refundable within 7 days · free retake included
              </p>
            </div>
          </div>

          {/* ── what's included ── */}
          <div className="mt-8 border-t border-ink/8 pt-6 dark:border-paper/10">
            <p className="mb-4 text-sm font-bold text-ink dark:text-paper">Every {programme.title} batch includes</p>
            <ul className="grid gap-2.5 sm:grid-cols-2">
              {INCLUDED.map((f) => (
                <li key={f} className="flex items-start gap-2.5 text-sm text-ink/75 dark:text-paper/75">
                  <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-mint-deep/15 text-mint-deep dark:bg-mint/15 dark:text-mint">
                    <Check size={11} strokeWidth={3} />
                  </span>
                  {f}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* ── duration discount strip ── */}
        <div data-enter className="mt-10 grid gap-3 sm:grid-cols-3">
          {[
            { Icon: Wallet, title: 'Pay once per batch', sub: 'No monthly billing — 1-month is ₹149, 2-month ₹299, 3-month ₹429, 6-month ₹799.' },
            { Icon: BadgeCheck, title: 'Certificate after the interview', sub: 'Employer-verifiable certificate with a unique ID — issued once you clear the final interview.' },
            { Icon: FileSignature, title: 'LOR unlocks in 24 hours', sub: 'A signed letter of recommendation unlocks a day after your certificate is issued.' },
          ].map(({ Icon, title, sub }, i) => (
            <div key={title} className="flex items-start gap-3 rounded-2xl border border-ink/10 bg-white p-4 dark:border-paper/10 dark:bg-ink-soft" style={{ transitionDelay: `${i * 80}ms` }}>
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-cyan-deep/10 text-cyan-deep dark:bg-cyan-snap/10 dark:text-cyan-snap">
                <Icon size={16} />
              </span>
              <div>
                <p className="text-sm font-bold text-ink dark:text-paper">{title}</p>
                <p className="mt-0.5 text-xs text-ink/55 dark:text-paper/55">{sub}</p>
              </div>
            </div>
          ))}
        </div>

        {/* ── FAQ ── */}
        <div data-enter className="mx-auto mt-14 max-w-3xl">
          <h2 className="text-center font-display text-2xl font-bold text-ink dark:text-paper">Common questions</h2>
          <div className="mt-6 grid gap-3">
            {[
              ['Is the price per month or for the whole batch?', 'Per whole batch. ₹149 is the full fee for a 1-month batch, ₹299 for 2 months and so on — there is no monthly subscription.'],
              ['Why is the struck-through price higher?', 'It is the launch marker of the batch. You always pay the fixed fee shown — the difference is simply what you save today.'],
              ['Is there a free retake if I fail the assessment?', 'Yes — you can retake the final assessment once for free on every batch.'],
              ['What does a mentor review mean?', 'An admin mentor reviews every live-project submission (screenshots + link) on every track and approves or requests changes.'],
              ['How do referral rewards work?', 'Every friend who pays for a seat using your link credits ₹50 to your internship wallet, which you can apply at checkout.'],
              ['Can I join another internship after finishing?', 'Yes — once your LOR is issued, you can start a fresh internship on any track. Every internship earns its own certificate.'],
            ].map(([q, a]) => (
              <div key={q} className="rounded-2xl border border-ink/10 bg-white p-4 dark:border-paper/10 dark:bg-ink-soft">
                <p className="flex items-center gap-2 text-sm font-bold text-ink dark:text-paper">
                  <Sparkles size={14} className="shrink-0 text-neon-deep dark:text-neon" /> {q}
                </p>
                <p className="mt-1.5 text-xs leading-relaxed text-ink/55 dark:text-paper/55">{a}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── CTA ── */}
        <div data-enter className="relative mt-16 overflow-hidden rounded-panel border border-ink/8 bg-mist p-10 text-center text-ink shadow-float dark:border-paper/10 dark:bg-ink dark:text-paper">
          <div className="pointer-events-none absolute -left-16 -top-16 h-48 w-48 rounded-full bg-cyan-deep/15 blur-3xl dark:bg-cyan-snap/20" />
          <div className="pointer-events-none absolute -bottom-16 -right-16 h-48 w-48 rounded-full bg-neon-deep/15 blur-3xl dark:bg-neon/20" />
          <GraduationCap size={30} className="mx-auto text-neon-deep dark:text-neon" />
          <h2 className="mt-4 font-display text-3xl font-bold">Your first real project is a booking away</h2>
          <p className="mx-auto mt-2 max-w-xl text-sm text-ink/55 dark:text-paper/55">
            Pick a domain, lock a {months}-month batch for ₹{price.total} and start shipping today. Full refund within 7 days if you&apos;re not satisfied.
          </p>
          <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
            <Button size="lg" variant="neon" onClick={start}>
              <HeartHandshake size={17} /> Book the {programme.title} batch
            </Button>
            <Button size="lg" variant="ghost" onClick={() => navigate('/domains')}>
              Browse all domains <ArrowRight size={16} />
            </Button>
          </div>
          <p className="mt-5 flex items-center justify-center gap-1.5 text-[11px] text-ink/40 dark:text-paper/40">
            <ShieldCheck size={12} /> 100% simulated checkout on this demo · no real charges
          </p>
        </div>
      </section>
    </Page>
  )
}