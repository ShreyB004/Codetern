import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowRight, BadgeCheck, Check, FileSignature, GraduationCap, HeartHandshake, Rocket, ShieldCheck, Sparkles, Wallet } from 'lucide-react'
import { Page } from '../components/layout/Page.jsx'
import { Button } from '../components/ui/Button.jsx'
import { DomainIcon } from '../components/ui/Icon.jsx'
import { openRegistration } from '../lib/analytics.js'
import { PROGRAMMES, getProgramme, DOMAIN_COLORS } from '../data/programmes.js'
import { DURATIONS, INCLUDED, batchPrice } from '../data/plans.js'
import { cn } from '../lib/utils.js'
import { AuroraGlow } from '../components/ui/backgrounds/AuroraGlow.jsx'
import { ScrollReveal } from '../components/ui/effects/ScrollReveal.jsx'
import { useTheme } from '../context/ThemeContext.jsx'

export default function PricingPage() {
  const { isDark } = useTheme()
  const navigate = useNavigate()

  const [domain, setDomain] = useState('mern')
  const [months, setMonths] = useState(3)

  const programme = getProgramme(domain)
  const color = DOMAIN_COLORS[programme.color]
  const price = useMemo(() => batchPrice(months), [months])

  const start = () => openRegistration(`pricing-${domain}-${months}m`)

  return (
    <Page className="overflow-hidden">
      <section className="relative overflow-hidden bg-paper py-20 text-ink dark:bg-ink dark:text-paper">
        <div className="grid-lines absolute inset-0 opacity-20" />
        <AuroraGlow className="opacity-60" />
        <div className="relative mx-auto max-w-4xl px-5 text-center lg:px-8">
          <span className="mb-5 inline-block rounded-bubble border border-neon-deep/40 bg-neon-deep/10 px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-neon-deep dark:border-neon/40 dark:bg-neon/10 dark:text-neon">
            One flat price per batch
          </span>
          <ScrollReveal
            as="h1"
            className="font-display text-4xl font-extrabold leading-tight tracking-tight sm:text-6xl"
            colors={isDark ? ['transparent', 'transparent', 'transparent', 'transparent', 'transparent', '#38ffb0', 'transparent', '#22d3ee'] : ['transparent', 'transparent', 'transparent', 'transparent', 'transparent', '#047857', 'transparent', '#0e7490']}
          >
            ₹149 to ₹799. The whole batch.
          </ScrollReveal>
          <p className="mx-auto mt-5 max-w-2xl text-base text-ink/60 dark:text-paper/60">
            No subscriptions. No hidden tiers. The batch length decides the price — every one of the 14 domains
            costs the same and ships the same full package.
          </p>
        </div>
      </section>

      <section className="relative mx-auto -mt-10 max-w-6xl px-5 pb-24 lg:px-8">
        <div className="rounded-panel border border-ink/10 bg-white p-5 shadow-float sm:p-8 dark:border-paper/10 dark:bg-ink-soft dark:shadow-none" data-enter>
          <p className="text-sm font-bold text-ink dark:text-paper">1 · Pick your batch length</p>
          <p className="mb-5 text-xs text-ink/55 dark:text-paper/55">
            Longer batches cost less per month. The struck-through price is the launch marker — you pay the price
            below, today.
          </p>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {DURATIONS.map((d) => {
              const p = batchPrice(d)
              const active = months === d
              return (
                <button
                  key={d}
                  type="button"
                  onClick={() => setMonths(d)}
                  aria-pressed={active}
                  className={cn(
                    'relative flex flex-col rounded-2xl border p-4 text-left transition-all duration-300 hover:-translate-y-1 hover:shadow-card',
                    active
                      ? 'border-neon-deep/60 bg-neon-deep/8 ring-4 ring-neon-deep/10 dark:border-neon/60 dark:bg-neon/8 dark:ring-neon/10'
                      : 'border-ink/10 bg-paper/60 dark:border-paper/10 dark:bg-ink',
                  )}
                >
                  <div className="flex items-baseline justify-between">
                    <p className="font-display text-xl font-extrabold text-ink dark:text-paper">
                      {d}<span className="ml-1 text-xs font-bold text-ink/40 dark:text-paper/40">month{d > 1 ? 's' : ''}</span>
                    </p>
                    {p.saved > 0 && (
                      <span className="rounded-bubble bg-mint-deep/10 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-mint-deep dark:bg-mint/10 dark:text-mint">
                        Save ₹{p.saved}
                      </span>
                    )}
                  </div>
                  <div className="mt-3 flex items-baseline gap-2">
                    <span className="font-display text-3xl font-extrabold tracking-tight text-ink dark:text-paper">
                      ₹{p.total}
                    </span>
                    <span className="text-xs font-semibold text-ink/40 dark:text-paper/40">
                      ₹{Math.round(p.total / d)}/mo
                    </span>
                  </div>
                  <p className="mt-1 text-[10px] font-medium text-ink/45 dark:text-paper/45">one payment · whole batch</p>
                </button>
              )
            })}
          </div>

          <div className="mt-8 border-t border-ink/8 pt-6 dark:border-paper/10">
            <p className="text-sm font-bold text-ink dark:text-paper">2 · Choose your domain</p>
            <p className="mb-4 text-xs text-ink/55 dark:text-paper/55">
              Same price on every track — pick the work you want to be known for.
            </p>
            <div className="flex flex-wrap gap-2">
              {PROGRAMMES.map((p) => {
                const c = DOMAIN_COLORS[p.color]
                const active = domain === p.id
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => {
                      setDomain(p.id)
                      if (!getProgramme(p.id).durations.includes(months)) setMonths(getProgramme(p.id).durations[0])
                    }}
                    aria-pressed={active}
                    className={cn(
                      'focus-ring flex items-center gap-2 rounded-full border px-3.5 py-2 text-xs font-bold transition-all duration-300',
                      active
                        ? 'border-ink bg-ink text-white dark:border-paper dark:bg-paper dark:text-ink'
                        : 'border-ink/12 bg-paper/60 text-ink/65 hover:-translate-y-0.5 hover:border-ink/30 hover:text-ink dark:border-paper/15 dark:bg-ink dark:text-paper/65 dark:hover:border-paper/35 dark:hover:text-paper',
                    )}
                  >
                    <span
                      className="grid h-5 w-5 place-items-center rounded-md"
                      style={active ? { background: c.fg, color: 'var(--color-ink)' } : { background: c.bg, color: isDark ? c.fg : 'var(--color-ink)' }}
                    >
                      <DomainIcon name={p.icon} size={11} />
                    </span>
                    {p.title}
                  </button>
                )
              })}
            </div>
            <p className="mt-3 text-[11px] text-ink/45 dark:text-paper/45">
              {programme.durations.includes(months)
                ? `${programme.title} runs ${programme.durations.join(', ')}-month batches.`
                : `${programme.title} doesn’t offer ${months}-month batches — we picked ${programme.durations[0]} months for you.`}
            </p>
          </div>

          <div className="mt-8 flex flex-col gap-6 rounded-2xl border border-ink/10 bg-paper/60 p-6 lg:flex-row lg:items-center dark:border-paper/10 dark:bg-ink">
            <div className="flex min-w-0 flex-1 items-center gap-4">
              <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl" style={{ background: color.bg, color: 'var(--color-ink)' }}>
                <DomainIcon name={programme.icon} size={20} />
              </span>
              <div className="min-w-0">
                <p className="truncate text-sm font-bold text-ink dark:text-paper">{programme.title} · {months}-month batch</p>
                <p className="text-[11px] text-ink/50 dark:text-paper/50">
                  launch marker <span className="line-through">₹{price.original}</span> → save ₹{price.saved} today
                </p>
              </div>
              <div className="ml-auto shrink-0 text-right">
                <p className="text-[10px] font-bold uppercase tracking-widest text-ink/45 dark:text-paper/45">You pay</p>
                <p className="font-display text-3xl font-extrabold italic tracking-tight text-ink dark:text-paper">₹{price.total}</p>
              </div>
            </div>
            <Button size="lg" variant="neon" className="w-full lg:w-auto" onClick={start}>
              <Rocket size={16} /> Book this batch <ArrowRight size={15} />
            </Button>
          </div>

          <div className="mt-5 flex flex-wrap items-center justify-center gap-2 text-[11px] text-ink/55 dark:text-paper/55">
            {[
              { icon: ShieldCheck, label: 'Refundable within 7 days' },
              { icon: BadgeCheck, label: 'Free retake included' },
              { icon: FileSignature, label: 'College internship documentation' },
              { icon: Wallet, label: 'Refer a friend — earn ₹50' },
            ].map(({ icon: Icon, label }) => (
              <span key={label} className="flex items-center gap-1.5">
                <Icon size={12} className="text-mint-deep dark:text-mint" /> {label}
              </span>
            ))}
          </div>

          <div className="mt-8 border-t border-ink/8 pt-6 dark:border-paper/10">
            <p className="mb-4 text-sm font-bold text-ink dark:text-paper">The same full package on every track</p>
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

        <div data-enter className="mx-auto mt-14 max-w-3xl">
          <h2 className="text-center font-display text-2xl font-bold text-ink dark:text-paper">
            Questions people ask before booking
          </h2>
          <div className="mt-6 grid gap-3">
            {[
              ['Is the price per month?', 'No — one payment per whole batch. ₹149 for 1 month, ₹299 for 2, ₹429 for 3, ₹799 for 6. No subscription anywhere.'],
              ['Do I need experience or connections to join?', 'No. Entry is a baseline quiz plus an AI mock interview — no referrals, no prior portfolio, no network required. The work itself builds your proof.'],
              ['What if I fail the assessment?', 'You get one free retake on every batch, and mentors tell you exactly what to strengthen between attempts.'],
              ['What does the struck-through price mean?', 'It is the batch launch marker. You always pay the fixed price shown — the difference is simply today’s saving.'],
              ['How does a mentor review work?', 'You submit evidence of each deliverable (screenshots + live link) and a mentor approves it or sends you back with specific changes — like a real code review.'],
              ['Can I do another internship after this one?', 'Yes — once your LOR is issued, start a fresh batch on any domain. Every internship earns its own certificate and each one adds to your portfolio.'],
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

        <div data-enter className="cdt-lively relative mt-16 overflow-hidden rounded-panel border border-ink/8 bg-mist p-10 text-center text-ink shadow-float dark:border-paper/10 dark:bg-ink dark:text-paper">
          <div className="cdt-drift pointer-events-none absolute -left-16 -top-16 h-48 w-48 rounded-full bg-cyan-deep/15 blur-3xl dark:bg-cyan-snap/20" />
          <div className="cdt-drift cdt-drift-delayed pointer-events-none absolute -bottom-16 -right-16 h-48 w-48 rounded-full bg-neon-deep/15 blur-3xl dark:bg-neon/20" />
          <GraduationCap size={30} className="mx-auto text-neon-deep dark:text-neon" />
          <h2 className="mt-4 font-display text-3xl font-bold">Your first real project is a booking away</h2>
          <p className="mx-auto mt-2 max-w-xl text-sm text-ink/55 dark:text-paper/55">
            Lock a {months}-month {programme.title} batch for ₹{price.total} and start shipping today. Full refund
            within 7 days if it isn&apos;t for you.
          </p>
          <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
            <Button size="lg" variant="neon" onClick={start}>
              <HeartHandshake size={17} /> Book the {programme.title} batch
            </Button>
            <Button size="lg" variant="ghost" onClick={() => navigate('/domains')}>
              Browse all domains <ArrowRight size={16} />
            </Button>
          </div>
          <p className="mt-5 text-[11px] text-ink/40 dark:text-paper/40">
            Striped as &ldquo;betting &amp; gambling&rdquo; on some UPI receipts — your bank story, not ours.
          </p>
        </div>
      </section>
    </Page>
  )
}