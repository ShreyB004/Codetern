import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Ban, MessageSquareQuote, MousePointerClick, CalendarCheck, MessagesSquare, PackageCheck, GitPullRequest } from 'lucide-react'
import { Page } from '../components/layout/Page.jsx'
import { JoinForm } from '../components/home/JoinForm.jsx'
import { Modal } from '../components/ui/Modal.jsx'
import { Pill, FloatPill } from '../components/ui/Pill.jsx'
import { Divider } from '../components/ui/Divider.jsx'
import { Button } from '../components/ui/Button.jsx'
import { Reveal } from '../components/ui/Reveal.jsx'
import { getCourse } from '../data/courses.js'
import { useSite } from '../hooks/useSite.js'

const WEEK = [
  { icon: CalendarCheck, d: 'Sat–Sun', t: 'Live build rooms on Meet', s: 'Code alongside mentors, ask anything' },
  { icon: MessagesSquare, d: 'Weekdays', t: 'Async reviews + messages', s: 'PR feedback lands within 24 hours' },
  { icon: PackageCheck, d: 'Friday', t: 'Demo + ship it', s: 'Show the pod what you deployed' },
]

const STATS = [
  ['4', 'focused courses'],
  ['24h', 'review turnaround'],
  ['5', 'shipped builds per course'],
  ['4–5', 'students per team pod'],
]

// A taste of mentorship: hover any line to see the review note.
const DIFF = [
  { code: 'const cache = new Map()', note: null },
  { code: 'async function getUser(id) {', note: null },
  { code: '  if (cache.has(id)) return cache.get(id)', note: 'Good instinct — but this cache never expires. What happens after a profile update?' },
  { code: '  const res = await fetch(`/api/users/${id}`)', note: null },
  { code: '  const user = await res.json()', note: 'No status check — a 500 becomes a silent undefined downstream. Handle it.' },
  { code: '  cache.set(id, user); return user', note: null },
  { code: '}', note: 'Solid shape. Add a TTL + error path and this is shippable.' },
]

function ReviewDemo() {
  return (
    <div className="overflow-hidden rounded-[2rem] border border-ink/10 bg-ink text-white shadow-float dark:border-paper/10 dark:bg-ink-soft">
      <div className="flex flex-wrap items-center gap-2 border-b border-white/10 px-5 py-3.5">
        <span className="flex gap-1.5" aria-hidden>
          <i className="h-2.5 w-2.5 rounded-full bg-rose-400" />
          <i className="h-2.5 w-2.5 rounded-full bg-amber-300" />
          <i className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
        </span>
        <p className="font-mono text-xs text-white/60">pull-request #12 · retriever.js</p>
        <span className="ml-auto hidden items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-[11px] font-bold text-white/70 sm:flex">
          <MousePointerClick size={12} /> Hover the highlighted lines
        </span>
      </div>
      <div className="grid gap-px p-3 font-mono text-[13px] leading-relaxed">
        {DIFF.map((l, i) => (
          <div
            key={i}
            tabIndex={l.note ? 0 : undefined}
            className={l.note
              ? 'group relative cursor-default rounded-xl px-3 py-1.5 outline-none transition hover:bg-neon/10 focus-visible:bg-neon/10'
              : 'px-3 py-1.5 text-white/75'}
          >
            <p className="flex gap-3">
              <span className="w-6 shrink-0 select-none text-right text-white/25">{i + 1}</span>
              <span className={l.note ? 'text-neon underline decoration-dotted decoration-neon/50 underline-offset-4' : ''}>{l.code}</span>
            </p>
            {l.note && (
              <span className={`pointer-events-none absolute left-9 z-20 w-72 max-w-[calc(100%-2rem)] opacity-0 transition-all duration-200 group-hover:opacity-100 group-focus-visible:opacity-100 ${i >= DIFF.length - 2 ? 'bottom-full -translate-y-1 group-hover:translate-y-0 group-focus-visible:translate-y-0' : 'top-full translate-y-1 group-hover:translate-y-0 group-focus-visible:translate-y-0'}`}>
                <span className="flex items-start gap-1.5 rounded-xl border border-neon/30 bg-ink px-3 py-2 font-sans text-xs leading-relaxed text-neon shadow-float">
                  <MessageSquareQuote size={13} className="mt-0.5 shrink-0" /> {l.note}
                </span>
              </span>
            )}
          </div>
        ))}
      </div>
      <p className="flex items-center gap-1.5 border-t border-white/10 px-5 py-3 text-xs text-white/50">
        <GitPullRequest size={13} /> This is what every unit ends with — a reviewed, shippable diff.
      </p>
    </div>
  )
}

export default function HomePage() {
  const [joinOpen, setJoinOpen] = useState(false)
  const site = useSite('home')
  const cta = useSite('cta')

  return (
    <Page>
      {/* ── hero ── */}
      <section className="relative overflow-hidden bg-paper pb-16 pt-28 dark:bg-ink">
        <div className="dot-grid pointer-events-none absolute inset-0 opacity-50" />
        <div className="cdt-blob pointer-events-none absolute -left-24 top-10 h-72 w-72 rounded-full bg-cyan-snap/15 blur-[100px] dark:bg-cyan-snap/10" />
        <div className="cdt-blob pointer-events-none absolute -right-24 top-40 h-72 w-72 rounded-full bg-neon/20 blur-[100px] dark:bg-neon/10" style={{ animationDelay: '-8s' }} />
        <div className="cdt-drift pointer-events-none absolute left-1/2 top-64 h-40 w-40 rounded-full bg-violet-deep/10 blur-[90px] dark:bg-violet-deep/20" />
        <FloatPill className="left-[6%] top-36" tone="neon" delay="-3s">Reviews in 24h</FloatPill>
        <FloatPill className="right-[7%] top-48" tone="cyan" delay="-7s">Deploy Fridays</FloatPill>
        <FloatPill className="left-[15%] top-24" tone="violet" delay="-11s">Team pods of 4–5</FloatPill>

        <div className="relative mx-auto max-w-6xl px-5 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <Pill tone="soft" dot pulse><Ban size={12} /> {site.badge}</Pill>
            <h1 className="mt-5 font-display text-5xl font-extrabold leading-[1.05] tracking-tight sm:text-6xl">
              {site.titleA} <span className="text-neon-deep dark:text-neon">{site.titleB}</span>
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-[15px] leading-relaxed opacity-60">{site.subtitle}</p>
            <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
              <Button size="lg" onClick={() => setJoinOpen(true)} className="shadow-float hover:-translate-y-1">
                Apply in 2 minutes <ArrowRight size={16} />
              </Button>
              <Link to="/courses">
                <Button size="lg" variant="ghost" className="hover:-translate-y-1">Explore the 4 courses</Button>
              </Link>
            </div>
            <p className="mt-4 text-xs font-semibold uppercase tracking-[0.14em] opacity-40">Weekend batches · Mentor-reviewed · Ship live</p>
          </div>

          {site.showStats && (
            <Reveal className="mx-auto mt-10 grid max-w-3xl grid-cols-2 gap-2.5 sm:grid-cols-4">
              {(site.stats?.items || STATS).map(([v, l]) => (
                <div key={l} className="rounded-2xl border border-ink/10 bg-white/80 px-4 py-3.5 text-center backdrop-blur transition hover:-translate-y-1 hover:shadow-card dark:border-paper/10 dark:bg-ink-soft/80">
                  <p className="font-display text-3xl font-extrabold">{v}</p>
                  <p className="text-[11px] font-bold uppercase tracking-wider opacity-50">{l}</p>
                </div>
              ))}
            </Reveal>
          )}
        </div>
      </section>

      {/* ── interactive taste of mentorship (home-only) ── */}
      <section className="cv-auto mx-auto max-w-6xl px-5 pb-10 lg:px-8">
        <div className="grid items-center gap-6 lg:grid-cols-[1fr_1.2fr]">
          <Reveal>
            <Pill tone="neon">A 30-second sample</Pill>
            <h2 className="mt-3 font-display text-3xl font-extrabold tracking-tight sm:text-4xl">This is what “reviewed” actually looks like.</h2>
            <p className="mt-3 max-w-md text-[15px] leading-relaxed opacity-60">
              No grades, no auto-pass. A mentor reads your diff the way a senior reads a junior’s —
              caching, error paths, edge cases — until it’s genuinely shippable. Try it on the right.
            </p>
            <Button className="mt-5" onClick={() => setJoinOpen(true)}>Get reviews like this <ArrowRight size={15} /></Button>
          </Reveal>
          <Reveal delay={120}>
            <ReviewDemo />
          </Reveal>
        </div>
      </section>

      {/* ── evidence wall: what graduates walk away with (home-only) ── */}
      <section className="cv-auto mx-auto max-w-6xl px-5 py-12 lg:px-8">
        <Reveal className="mx-auto max-w-2xl text-center">
          <Pill tone="mint">Not certificates — artifacts</Pill>
          <h2 className="mt-3 font-display text-3xl font-extrabold tracking-tight sm:text-4xl">Your portfolio stops being screenshots.</h2>
          <p className="mt-2 text-[15px] opacity-60">Every course ends with things a hiring manager can click, run, and read.</p>
        </Reveal>
        <div className="mt-7 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {[
            { t: 'A live URL', d: 'Deployed behind CI with logs, monitoring and a rollback plan.', mono: 'https://your-build.cdt.live ✓ 200' },
            { t: 'A review history', d: 'Merged PRs with mentor threads on naming, tests and perf.', mono: '#12 merged · 34 comments addressed' },
            { t: 'An eval report', d: 'AI builds ship with measured quality, cost and guardrails.', mono: 'accuracy 0.91 · $0.004 / run' },
            { t: 'A benchmark sheet', d: 'Database builds prove throughput, not vibes.', mono: '12.4k reads/s · p99 8ms' },
            { t: 'A published extension', d: 'Web builds land in the Chrome Web Store with a changelog.', mono: 'v1.2.0 · 400+ users' },
            { t: 'A load-test log', d: 'APIs ship with breaking-point numbers attached.', mono: 'sustained 800 rps · 0 errors' },
          ].map((a, i) => (
            <Reveal key={a.t} delay={(i % 3) * 70}>
              <div className="group h-full rounded-3xl border border-ink/10 bg-white p-5 shadow-card transition-all duration-300 hover:-translate-y-1.5 hover:shadow-float dark:border-paper/10 dark:bg-ink-soft dark:shadow-none">
                <h3 className="font-display text-base font-bold transition group-hover:translate-x-0.5">{a.t}</h3>
                <p className="mt-1 text-[13px] leading-relaxed opacity-60">{a.d}</p>
                <p className="mt-3 truncate rounded-xl bg-ink px-3 py-2 font-mono text-[11px] text-neon dark:bg-black">{a.mono}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      <Divider className="py-10" />

      {/* ── week rhythm ── */}
      {site.showWeek && (
        <section className="cv-auto mx-auto max-w-6xl px-5 py-14 lg:px-8">
          <Reveal className="overflow-hidden rounded-[2rem] bg-ink text-white dark:bg-ink-soft">
            <div className="grid gap-px sm:grid-cols-3">
              {(site.week?.rows || WEEK).map((w, i) => (
                <div key={w.t} className="group relative p-6 transition hover:bg-white/5">
                  {i > 0 && <span className="absolute left-0 top-6 hidden h-[calc(100%-3rem)] w-px bg-white/10 sm:block" />}
                  <p className="text-[11px] font-extrabold uppercase tracking-[0.18em] text-neon">{w.d}</p>
                  <h3 className="mt-1.5 flex items-center gap-2 font-display text-lg font-bold transition group-hover:translate-x-1"><w.icon size={17} className="shrink-0 opacity-70" />{w.t}</h3>
                  <p className="mt-1 text-[13px] text-white/55">{w.s}</p>
                </div>
              ))}
            </div>
          </Reveal>
        </section>
      )}

      {/* ── course strip (names + admin blurbs; details live on Courses) ── */}
      {site.showCourses && (
        <section className="cv-auto mx-auto max-w-6xl px-5 py-8 lg:px-8">
          <Reveal className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <Pill tone="cyan">{site.coursesSub}</Pill>
              <h2 className="mt-3 font-display text-3xl font-extrabold tracking-tight">{site.coursesTitle}</h2>
            </div>
            <Link to="/courses" className="group text-sm font-bold underline">Compare all four <ArrowRight size={13} className="inline transition group-hover:translate-x-0.5" /></Link>
          </Reveal>
          <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {(site.featured || []).map((f, i) => {
              const c = getCourse(f.id)
              return (
                <Reveal key={f.id + i} delay={i * 60}>
                  <Link to={`/join?course=${c.id}`} className="group flex h-full flex-col rounded-3xl p-5 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-float" style={{ background: c.color }}>
                    <p className="text-[11px] font-bold uppercase tracking-wider text-ink/50">{c.level}</p>
                    <h3 className="mt-1 font-display text-xl font-extrabold text-ink">{c.title}</h3>
                    <p className="mt-1 text-[13px] text-ink/60">{f.blurb || c.tagline}</p>
                    <span className="mt-4 inline-flex w-fit items-center gap-1 rounded-full bg-ink px-4 py-2 text-xs font-bold text-white transition group-hover:gap-2">
                      Start here <ArrowRight size={13} />
                    </span>
                  </Link>
                </Reveal>
              )
            })}
          </div>
        </section>
      )}

      <Divider className="py-10" />

      {/* ── payment line, no prices ── */}
      <section className="cv-auto mx-auto max-w-6xl px-5 py-8 lg:px-8">
        <Reveal className="flex flex-wrap items-center justify-between gap-4 rounded-[2rem] border border-ink/10 bg-white px-6 py-5 shadow-card sm:px-8 dark:border-paper/10 dark:bg-ink-soft dark:shadow-none">
          <p className="text-sm"><b>One payment, no subscription.</b> <span className="opacity-60">7-day refund · weekend batches · cancel anytime before approval.</span></p>
          <Link to="/pricing" className="group rounded-full bg-ink px-5 py-2.5 text-sm font-bold text-white transition hover:-translate-y-0.5 dark:bg-paper dark:text-ink">
            See plans <ArrowRight size={14} className="ml-1 inline transition group-hover:translate-x-0.5" />
          </Link>
        </Reveal>
      </section>

      {site.showCta && (
        <section className="cv-auto mx-auto max-w-5xl px-5 pb-24 lg:px-8">
          <Reveal className="relative overflow-hidden rounded-[2.5rem] bg-ink p-10 text-center text-white sm:p-14 dark:bg-ink-soft">
            <div className="pointer-events-none absolute -left-16 -top-16 h-56 w-56 rounded-full bg-neon/15 blur-[100px]" />
            <div className="pointer-events-none absolute -bottom-16 -right-16 h-56 w-56 rounded-full bg-cyan-snap/15 blur-[100px]" />
            <h2 className="relative mx-auto max-w-xl font-display text-3xl font-extrabold sm:text-4xl">{cta.title}</h2>
            <p className="relative mx-auto mt-3 max-w-md text-sm leading-relaxed text-white/60">{cta.sub}</p>
            <div className="relative mt-7 flex flex-wrap justify-center gap-3">
              <Button size="lg" variant="neon" onClick={() => setJoinOpen(true)} className="hover:-translate-y-1">Start my application <ArrowRight size={16} /></Button>
              <Link to="/about"><Button size="lg" variant="lightGhost" className="hover:-translate-y-1">Why we teach this way</Button></Link>
            </div>
            <div className="relative mx-auto mt-8 grid max-w-2xl gap-2 text-left sm:grid-cols-3">
              {[
                ['2-minute form', 'No essays, no fees to apply'],
                ['Human review', 'A mentor reads every application'],
                ['7-day refund', 'Leave in week one, pay nothing'],
              ].map(([t, d]) => (
                <div key={t} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                  <p className="text-sm font-bold text-neon">{t}</p>
                  <p className="mt-0.5 text-xs text-white/55">{d}</p>
                </div>
              ))}
            </div>
          </Reveal>
        </section>
      )}

      <Modal open={joinOpen} onClose={() => setJoinOpen(false)} title="Apply — step 1 of 2" size="lg">
        <div className="p-6 sm:p-8">
          <JoinForm compact onDone={() => {}} />
        </div>
      </Modal>
    </Page>
  )
}
