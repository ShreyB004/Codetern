import { useNavigate, Link } from 'react-router-dom'
import { ArrowRight, Check, Minus } from 'lucide-react'
import { Page } from '../components/layout/Page.jsx'
import { Pill } from '../components/ui/Pill.jsx'
import { Reveal } from '../components/ui/Reveal.jsx'
import { PLANS } from '../data/courses.js'
import { useSite } from '../hooks/useSite.js'
import { cn } from '../lib/utils.js'

export default function PricingPage() {
  const navigate = useNavigate()
  const site = useSite('pricing')
  return (
    <Page className="overflow-hidden">
      <section className="relative bg-white pt-28 dark:bg-ink">
        <div className="mx-auto max-w-6xl px-5 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <Pill tone="mint" dot pulse>{site.badge}</Pill>
            <h1 className="mt-4 font-display text-5xl font-extrabold tracking-tight" style={{ fontFamily: 'Georgia, serif' }}>
              {site.title}
            </h1>
            <p className="mx-auto mt-3 max-w-xl text-[15px] opacity-60">{site.sub}</p>
          </div>

          <div className="relative mt-10 border-t border-ink/10 dark:border-paper/10">
            <span className="absolute -top-2 left-1/3 bg-white px-1 opacity-40 dark:bg-ink">+</span>
            <span className="absolute -top-2 left-2/3 bg-white px-1 opacity-40 dark:bg-ink">+</span>
            <div className="grid md:grid-cols-3">
              {PLANS.map((p, i) => (
                <Reveal key={p.id} delay={i * 90}>
                <div className={cn('relative h-full px-8 py-10 transition hover:bg-paper/60 dark:hover:bg-ink-soft/60', i < 2 && 'md:border-r md:border-ink/10 md:dark:border-paper/10')}>
                  <span className="inline-block rounded-xl bg-gradient-to-b from-cyan-100 to-rose-100 px-3 py-1 text-xs font-bold text-ink shadow-card dark:from-white/10 dark:to-white/5 dark:text-paper">{p.name}</span>
                  {p.popular && <span className="ml-2 rounded-full bg-ink px-2 py-0.5 text-[10px] font-bold uppercase text-white dark:bg-paper dark:text-ink">Most joined</span>}
                  <p className="mt-1 text-xs opacity-50">{p.sub}</p>
                  <p className="mt-4 font-display text-5xl font-extrabold" style={{ fontFamily: 'Georgia, serif' }}>
                    ₹{p.price.toLocaleString()} <span className="align-middle font-sans text-sm font-semibold opacity-50">/ full plan</span>
                  </p>
                  <p className="mt-1 text-sm line-through opacity-40">₹{p.originalPrice.toLocaleString()}</p>
                  <p className="mt-2 text-[13px] opacity-60">{p.duration} · {p.seats} seats max · {p.badge}</p>
                  <button
                    onClick={() => navigate(`/join?plan=${p.id}`)}
                    className={cn('mt-5 w-full rounded-2xl py-3 text-sm font-bold transition hover:-translate-y-0.5', p.popular ? 'bg-ink text-white shadow-float dark:bg-paper dark:text-ink' : 'bg-ink/5 hover:bg-ink/10 dark:bg-paper/10')}
                  >
                    {p.cta} <ArrowRight size={14} className="ml-1 inline" />
                  </button>
                  <ul className="mt-6 space-y-2.5">
                    {p.features.map((f) => (
                      <li key={f} className="flex items-start gap-2 text-[13px] opacity-70"><Check size={14} className="mt-0.5 shrink-0" /> {f}</li>
                    ))}
                    {p.missing.map((f) => (
                      <li key={f} className="flex items-start gap-2 text-[13px] opacity-35 line-through"><Minus size={14} className="mt-0.5 shrink-0" /> {f}</li>
                    ))}
                  </ul>
                </div>
                </Reveal>
              ))}
            </div>
            <div className="border-b border-ink/10 dark:border-paper/10" />
          </div>

          <div className="mx-auto mt-12 grid max-w-4xl gap-2.5 text-left sm:grid-cols-3">
            {[
              ['1 · Join in minutes', 'Short form, then the Google Form. No payment taken yet.'],
              ['2 · Get approved', 'A mentor reviews your application, usually within a day.'],
              ['3 · Pay & unlock', 'Pay once your seat is confirmed — LMS opens on next login.'],
            ].map(([t, d], i) => (
              <Reveal key={t} delay={i * 80}>
                <div className="h-full rounded-3xl border border-ink/10 bg-white p-5 transition hover:-translate-y-1 hover:shadow-card dark:border-paper/10 dark:bg-ink-soft dark:hover:shadow-none">
                  <p className="font-display font-bold">{t}</p>
                  <p className="mt-1 text-[13px] opacity-60">{d}</p>
                </div>
              </Reveal>
            ))}
          </div>
          <p className="mx-auto max-w-xl pb-20 pt-8 text-center text-sm opacity-60">
            {site.foot} ·
            <Link to="/courses" className="ml-1 font-bold underline">Browse courses</Link>
          </p>
        </div>
      </section>
    </Page>
  )
}
