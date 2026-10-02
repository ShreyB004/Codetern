import { Link } from 'react-router-dom'
import { ArrowRight, FlaskConical, ScanSearch, Ship, UsersRound, XCircle, Check, X } from 'lucide-react'
import { Page } from '../components/layout/Page.jsx'
import { Pill } from '../components/ui/Pill.jsx'
import { Reveal } from '../components/ui/Reveal.jsx'
import { COURSES } from '../data/courses.js'
import { useSite } from '../hooks/useSite.js'

const LOOP = [
  { icon: FlaskConical, n: '01', t: 'Dissect, then rebuild', d: 'You take a real system apart to see how it breathes — then reconstruct it from zero, making every design decision yourself.' },
  { icon: ScanSearch, t: 'Defend it in review', n: '02', d: 'Your code goes to GitHub where mentors interrogate it: naming, failure modes, cost, edge cases. Vague answers get sent back.' },
  { icon: Ship, t: 'Release it for real', n: '03', d: 'Docs, monitoring, rollback plan. A live URL with your name on the deploy — the only definition of done we accept.' },
  { icon: UsersRound, t: 'Do it inside a crew', n: '04', d: 'Pods of 4–5 run sprints and standups and cut one shared release. Solo speed is a tutorial skill; shipping together is the job.' },
]

const REFUSALS = [
  { t: 'No toy projects', d: 'If it could be a weekend tutorial, it has no place in the syllabus.' },
  { t: 'No auto-pass', d: 'Submitting is not finishing. Unreviewed work earns nothing here.' },
  { t: 'No attendance paper', d: 'Showing up on a call is not a skill. Shipped diffs are the only record.' },
  { t: 'No recorded-only learning', d: 'Videos don’t argue back. Mentors do — live, every weekend.' },
]

const FIT = {
  yes: ['You’d rather understand than memorize', 'You can give up 6–8 hours every weekend', 'You want your GitHub to speak before you do'],
  no: ['You want a certificate for your wall', 'You need everything pre-solved and spoon-fed', 'Weekends are non-negotiable off-time'],
}

export default function AboutPage() {
  const site = useSite('about')
  return (
    <Page>
      {/* ── ch 01 · origin ── */}
      <section className="mx-auto max-w-4xl px-5 pb-16 pt-28 lg:px-8">
        <Reveal>
          <Pill tone="coral" dot pulse>{site.badge}</Pill>
          <h1 className="mt-4 font-display text-5xl font-extrabold leading-[1.08] tracking-tight">{site.title}</h1>
          {String(site.story || '').split(/\n\n+/).map((para, i) => (
            <p key={i} className="mt-5 max-w-2xl text-[15px] leading-relaxed opacity-60">{para}</p>
          ))}
        </Reveal>
        <Reveal delay={100}>
          <blockquote className="mt-8 border-l-4 border-neon pl-5 font-display text-2xl font-bold leading-snug tracking-tight">
            “Anyone can follow a tutorial alone. Professionals ship together — so that’s the exam.”
          </blockquote>
        </Reveal>
      </section>

      {/* ── ch 02 · the method ── */}
      <section className="mx-auto max-w-6xl px-5 py-16 lg:px-8">
        <Reveal className="max-w-2xl">
          <p className="text-[11px] font-extrabold uppercase tracking-[0.2em] opacity-40">Chapter 02 — The method</p>
          <h2 className="mt-2 font-display text-3xl font-extrabold tracking-tight sm:text-4xl">Four moves, repeated until they’re instinct.</h2>
        </Reveal>
        <div className="mt-8 grid gap-4 md:grid-cols-2">
          {LOOP.map((c, i) => (
            <Reveal key={c.t} delay={(i % 2) * 80}>
              <div className="group relative h-full overflow-hidden rounded-[2rem] border border-ink/10 bg-white p-7 shadow-card transition-all duration-300 hover:-translate-y-1.5 hover:shadow-float dark:border-paper/10 dark:bg-ink-soft dark:shadow-none">
                <span className="pointer-events-none absolute -right-2 -top-4 font-display text-[6rem] font-extrabold leading-none opacity-[0.07] transition group-hover:opacity-[0.12]">{c.n}</span>
                <span className="grid h-12 w-12 place-items-center rounded-2xl bg-ink text-neon transition group-hover:rotate-6 group-hover:scale-110 dark:bg-paper dark:text-ink"><c.icon size={22} /></span>
                <h3 className="mt-4 font-display text-xl font-bold">{c.t}</h3>
                <p className="mt-2 max-w-md text-sm leading-relaxed opacity-60">{c.d}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ── ch 03 · refusals ── */}
      <section className="mx-auto max-w-6xl px-5 py-16 lg:px-8">
        <div className="grid gap-8 overflow-hidden rounded-[2.5rem] bg-ink p-8 text-white sm:p-12 lg:grid-cols-[1fr_1.4fr] dark:bg-ink-soft">
          <Reveal>
            <p className="text-[11px] font-extrabold uppercase tracking-[0.2em] text-white/40">Chapter 03 — Lines we won’t cross</p>
            <h2 className="mt-2 font-display text-3xl font-extrabold tracking-tight sm:text-4xl">A syllabus is what you leave out.</h2>
            <p className="mt-3 max-w-sm text-sm leading-relaxed text-white/60">Most courses pad hours with comforting filler. We cut it, on purpose, and put the hours where careers are actually made.</p>
            <Link to="/courses" className="group mt-6 inline-flex items-center gap-1.5 rounded-full bg-white px-5 py-2.5 text-sm font-bold text-ink transition hover:-translate-y-0.5">
              See what survived the cut <ArrowRight size={14} className="transition group-hover:translate-x-0.5" />
            </Link>
          </Reveal>
          <div className="grid gap-3 sm:grid-cols-2">
            {REFUSALS.map((r, i) => (
              <Reveal key={r.t} delay={i * 60}>
                <div className="h-full rounded-3xl border border-white/10 bg-white/5 p-5 transition hover:border-rose-400/30 hover:bg-white/10">
                  <XCircle size={19} className="text-rose-400" />
                  <h3 className="mt-2.5 font-display font-bold">{r.t}</h3>
                  <p className="mt-1 text-[13px] leading-relaxed text-white/55">{r.d}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── ch 04 · fit filter ── */}
      <section className="mx-auto max-w-6xl px-5 py-16 lg:px-8">
        <Reveal className="max-w-2xl">
          <p className="text-[11px] font-extrabold uppercase tracking-[0.2em] opacity-40">Chapter 04 — Honest filter</p>
          <h2 className="mt-2 font-display text-3xl font-extrabold tracking-tight sm:text-4xl">Not everyone should join. Good.</h2>
        </Reveal>
        <div className="mt-8 grid gap-4 md:grid-cols-2">
          <Reveal>
            <div className="h-full rounded-[2rem] border border-emerald-500/25 bg-emerald-500/8 p-7 dark:bg-emerald-400/8">
              <h3 className="font-display text-xl font-bold text-emerald-800 dark:text-emerald-300">You’ll thrive if…</h3>
              <ul className="mt-4 space-y-3">
                {FIT.yes.map((f) => (
                  <li key={f} className="flex items-start gap-2.5 text-sm font-semibold">
                    <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-emerald-500 text-white"><Check size={12} /></span>{f}
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>
          <Reveal delay={90}>
            <div className="h-full rounded-[2rem] border border-ink/10 bg-white p-7 shadow-card dark:border-paper/10 dark:bg-ink-soft dark:shadow-none">
              <h3 className="font-display text-xl font-bold opacity-80">Save your money if…</h3>
              <ul className="mt-4 space-y-3">
                {FIT.no.map((f) => (
                  <li key={f} className="flex items-start gap-2.5 text-sm opacity-70">
                    <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-ink/10 dark:bg-paper/15"><X size={12} /></span>{f}
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── courses + close ── */}
      <section className="mx-auto max-w-6xl px-5 pb-24 lg:px-8">
        <Reveal className="flex flex-wrap items-end justify-between gap-3">
          <h2 className="font-display text-3xl font-extrabold tracking-tight">Four ways in.</h2>
          <Link to="/courses" className="group text-sm font-bold underline">Full comparison <ArrowRight size={13} className="inline transition group-hover:translate-x-0.5" /></Link>
        </Reveal>
        <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {COURSES.map((c, i) => (
            <Reveal key={c.id} delay={i * 60}>
              <Link to={`/join?course=${c.id}`} className="group block h-full rounded-3xl p-5 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-float" style={{ background: c.color }}>
                <p className="text-[11px] font-bold uppercase tracking-wider text-ink/50">{c.level}</p>
                <h3 className="mt-1 font-display text-xl font-extrabold text-ink">{c.title}</h3>
                <p className="mt-1 text-[13px] text-ink/60">{c.sub}</p>
                <p className="mt-3 inline-flex items-center gap-1 text-[13px] font-bold text-ink">Join <ArrowRight size={13} className="transition group-hover:translate-x-0.5" /></p>
              </Link>
            </Reveal>
          ))}
        </div>
      </section>
    </Page>
  )
}
