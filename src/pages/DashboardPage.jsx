import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Award, BrainCircuit, CalendarCheck, LayoutDashboard, LogOut, Rocket, Video, Wallet, Zap } from 'lucide-react'
import { JourneyRail, STEPS } from '../components/student/JourneyTracker.jsx'
import { ResumeStep } from '../components/student/ResumeStep.jsx'
import { QuizStep } from '../components/student/QuizStep.jsx'
import { InterviewStep } from '../components/student/InterviewStep.jsx'
import { BookingStep } from '../components/student/BookingStep.jsx'
import { WorkspaceStep } from '../components/student/WorkspaceStep.jsx'
import { ReferEarn } from '../components/student/ReferEarn.jsx'
import { GraduatePanel } from '../components/student/GraduatePanel.jsx'
import { ThemeToggle } from '../components/ui/ThemeToggle.jsx'
import { useAuth } from '../context/AppContext.jsx'
import { SkeletonPage } from '../components/ui/Skeleton.jsx'
import { getProgramme, DOMAIN_COLORS } from '../data/programmes.js'
import { cn } from '../lib/utils.js'

export default function DashboardPage() {
  const { user, candidate, logout, isAuthenticated } = useAuth()
  const navigate = useNavigate()

  const [active, setActive] = useState(candidate?.step || 1)

  useEffect(() => {
    if (candidate?.step) setActive((a) => Math.max(a, candidate.step))
  }, [candidate?.step])

  if (!isAuthenticated) return <SkeletonPage />

  const programme = candidate?.domain ? getProgramme(candidate.domain) : null
  const color = programme ? DOMAIN_COLORS[programme.color] : null
  const firstName = user?.name?.split(' ')[0] || 'there'
  const wallet = candidate?.wallet?.balance || 0

  return (
    <div className="min-h-screen bg-paper dark:bg-ink">
      {/* top bar */}
      <header className="sticky top-0 z-40 border-b border-ink/8 bg-paper/80 backdrop-blur-md dark:border-white/10 dark:bg-ink/80">
        <div className="mx-auto flex h-16 max-w-[1400px] items-center justify-between gap-3 px-5 lg:px-8">
          <Link to="/" aria-label="Codetern home" className="focus-ring flex items-center gap-2.5 rounded-xl">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-ink text-cyan-snap dark:bg-paper dark:text-ink">
              <Zap size={18} strokeWidth={2.4} />
            </span>
            <div>
              <p className="font-display text-base font-bold leading-none text-ink dark:text-paper">Code<span className="text-cyan-deep dark:text-cyan-snap">tern</span></p>
              <p className="mt-0.5 text-[10px] font-bold uppercase tracking-[0.2em] text-cyan-deep dark:text-cyan-snap">Internship dashboard</p>
            </div>
          </Link>
          <div className="flex items-center gap-2">
            <span className="hidden items-center gap-1.5 rounded-bubble border border-violet-ink/30 bg-violet-ink/10 px-3.5 py-1.5 text-xs font-bold text-violet-ink sm:flex dark:border-violet-deep/30 dark:bg-violet-deep/10 dark:text-violet-deep">
              <Wallet size={13} /> ₹{wallet} wallet
            </span>
            <ThemeToggle />
            <button
              onClick={logout}
              className="flex items-center gap-2 rounded-full border border-ink/12 px-4 py-2 text-sm font-semibold text-ink/60 transition hover:bg-ink/5 hover:text-ink dark:border-paper/15 dark:text-paper/60 dark:hover:bg-paper/5 dark:hover:text-paper"
            >
              <LogOut size={15} /> Sign out
            </button>
            <button
              onClick={() => navigate('/')}
              className="hidden items-center gap-2 rounded-full bg-ink px-4 py-2 text-sm font-semibold text-paper transition hover:bg-ink-soft dark:bg-paper dark:text-ink dark:hover:bg-paper/85 md:flex"
            >
              <LayoutDashboard size={15} /> Public site
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto grid max-w-[1400px] gap-6 px-5 py-8 lg:grid-cols-[270px_minmax(0,1fr)] lg:px-8">
        {/* ── journey rail ── */}
        <aside className="lg:sticky lg:top-24 lg:self-start" data-enter>
          <div className="rounded-panel border border-ink/8 bg-white p-5 shadow-card dark:border-paper/10 dark:bg-ink-soft dark:shadow-none">
            <p className="mb-4 text-[11px] font-bold uppercase tracking-[0.2em] text-ink/40 dark:text-paper/40">Your journey</p>
            <JourneyRail active={active} onJump={setActive} />
            <div className="mt-5 border-t border-ink/8 pt-4 dark:border-paper/10">
              <p className="text-xs font-semibold text-ink/50 dark:text-paper/50">
                {candidate?.cert && candidate?.lor
                  ? 'Graduate 🎓 LOR issued — ready for another internship'
                  : candidate?.cert
                    ? 'Certificate issued — LOR unlocks in 24h 🎉'
                    : `Next: ${STEPS.find((s) => s.key === Math.min(candidate?.step || 1, 5))?.title}`}
              </p>
            </div>
          </div>
        </aside>

        {/* ── main column ── */}
        <div className="min-w-0 space-y-6">
          {/* header */}
          <div className="flex flex-wrap items-center justify-between gap-4" data-enter>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-cyan-deep dark:text-cyan-snap">Candidate analytics</p>
              <h1 className="mt-1 font-display text-3xl font-bold tracking-tight text-ink dark:text-paper sm:text-4xl">
                Welcome back, {firstName}
              </h1>
            </div>
            {programme && (
              <span className="flex items-center gap-2 rounded-bubble px-4 py-2 text-xs font-bold" style={{ background: color.bg, color: 'var(--color-ink)' }}>
                <Rocket size={13} /> {programme.title}
              </span>
            )}
          </div>

          <AnalyticsGrid />

          {/* active step */}
          <div className="mt-2">
            <ActiveStep active={active} onAdvance={() => setActive((a) => Math.min(a + 1, 5))} />
          </div>

          {/* graduate lounge: certificate + LOR + next internship */}
          {candidate?.cert && (
            <div>
              <GraduatePanel />
            </div>
          )}

          {/* referral */}
          <div>
            <div className="mb-4 flex items-center gap-2" data-enter>
              <span className="grid h-8 w-8 place-items-center rounded-xl bg-violet-ink/10 text-violet-ink dark:bg-violet-deep/10 dark:text-violet-deep">
                <Wallet size={15} />
              </span>
              <h2 className="font-display text-xl font-bold text-ink dark:text-paper">Refer & earn cash</h2>
            </div>
            <ReferEarn />
          </div>
        </div>
      </div>
    </div>
  )
}

// ── analytics row: KPIs + progress ring + activity ────────
function AnalyticsGrid() {
  const { candidate } = useAuth()

  const journeyPct = Math.round(((candidate?.step || 1) - 1) / 4 * 100)
  const quizPct = candidate?.quizScore ?? null
  const tasks = candidate?.workspace?.tasks
  const taskPct = tasks?.length ? Math.round((tasks.filter((t) => t.done).length / tasks.length) * 100) : null
  const interviewPct = candidate?.interviewScore ?? null

  // deterministic pseudo-random activity for the demo week
  const week = useMemo(() => {
    if (!candidate) return []
    let seed = candidate.id.split('').reduce((a, ch) => a + ch.charCodeAt(0), 7)
    const rand = () => { seed = (seed * 9301 + 49297) % 233280; return seed / 233280 }
    return ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((d, i) => {
      const base = Math.max(15, Math.min(95, Math.round(((candidate.step - 1) * 18) + i * 6 + rand() * 30)))
      return { d, base }
    })
  }, [candidate])

  const kpis = [
    { label: 'Journey progress', value: journeyPct, suffix: '%', icon: CalendarCheck, tint: 'text-cyan-deep bg-cyan-deep/10 dark:text-cyan-snap dark:bg-cyan-snap/10' },
    { label: 'Assessment score', value: quizPct, suffix: quizPct !== null ? '%' : '', icon: BrainCircuit, tint: 'text-neon-deep bg-neon-deep/10 dark:text-neon dark:bg-neon/10', empty: quizPct === null },
    { label: 'Workspace tasks', value: taskPct, suffix: taskPct !== null ? '%' : '', icon: Rocket, tint: 'text-mint-deep bg-mint-deep/10 dark:text-mint dark:bg-mint/10', empty: taskPct === null },
    { label: 'Interview score', value: interviewPct, suffix: interviewPct !== null ? '%' : '', icon: Video, tint: 'text-violet-ink bg-violet-ink/10 dark:text-violet-deep dark:bg-violet-deep/10', empty: interviewPct === null },
  ]

  return (
    <div className="grid gap-4 lg:grid-cols-[240px_minmax(0,1fr)]" data-enter>
      {/* progress ring */}
      <div className="flex flex-col items-center justify-center gap-3 rounded-panel border border-ink/8 bg-white p-6 shadow-card dark:border-paper/10 dark:bg-ink-soft dark:shadow-none">
        <ProgressRing value={journeyPct} size={150} stroke={12} />
        <div className="text-center">
          <p className="font-display text-lg font-bold text-ink dark:text-paper">{journeyPct}% complete</p>
          <p className="text-[11px] font-semibold uppercase tracking-wider text-ink/40 dark:text-paper/40">{candidate?.cert ? 'Graduate 🎓' : `${candidate?.step || 1}/5 milestones`}</p>
        </div>
      </div>

      {/* KPI cards + activity */}
      <div className="grid gap-4">
        <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
          {kpis.map((k) => {
            const Icon = k.icon
            return (
              <div key={k.label} className="rounded-2xl border border-ink/8 bg-white p-4 shadow-card dark:border-paper/10 dark:bg-ink-soft dark:shadow-none">
                <span className={cn('grid h-9 w-9 place-items-center rounded-xl', k.tint)}>
                  <Icon size={16} />
                </span>
                <p className={cn('mt-3 font-display text-2xl font-extrabold text-ink dark:text-paper')}>
                  {k.empty ? '—' : `${k.value}${k.suffix}`}
                </p>
                <p className="text-[11px] font-semibold uppercase tracking-wider text-ink/40 dark:text-paper/40">{k.label}</p>
              </div>
            )
          })}
        </div>

        {/* weekly activity */}
        <div className="rounded-2xl border border-ink/8 bg-white p-5 shadow-card dark:border-paper/10 dark:bg-ink-soft dark:shadow-none">
          <div className="mb-4 flex items-center justify-between">
            <p className="text-sm font-bold text-ink dark:text-paper">Weekly activity</p>
            <span className="rounded-bubble bg-cyan-deep/10 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-cyan-deep dark:bg-cyan-snap/10 dark:text-cyan-snap">Effort score</span>
          </div>
          <div className="flex h-24 items-end justify-between gap-2">
            {week.map((w, i) => (
              <div key={w.d} className="flex flex-1 flex-col items-center gap-1.5">
                <div className="flex h-20 w-full items-end">
                  <div
                    className={cn(
                      'w-full rounded-t-lg transition-all duration-700',
                      i === 6 ? 'bg-gradient-to-t from-cyan-snap to-mint' : 'bg-gradient-to-t from-cyan-snap/70 to-cyan-snap/25',
                    )}
                    style={{ height: `${w.base}%` }}
                  />
                </div>
                <span className="text-[10px] font-bold uppercase text-ink/60 dark:text-paper/40">{w.d}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function ProgressRing({ value, size = 150, stroke = 12 }) {
  const r = (size - stroke) / 2
  const c = 2 * Math.PI * r
  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="currentColor" strokeWidth={stroke} className="text-ink/8 dark:text-paper/10" />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="url(#ring-grad)"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c - (value / 100) * c}
          className="transition-all duration-1000 ease-[cubic-bezier(0.16,1,0.3,1)]"
        />
        <defs>
          <linearGradient id="ring-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#22d3ee" />
            <stop offset="60%" stopColor="#b4ff39" />
            <stop offset="100%" stopColor="#38ffb0" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute inset-0 grid place-items-center">
        <div className="text-center">
          <p className="font-display text-3xl font-extrabold text-ink dark:text-paper">{value}%</p>
          <Award size={18} className="mx-auto mt-1 text-cyan-deep dark:text-cyan-snap" />
        </div>
      </div>
    </div>
  )
}

export function ActiveStep({ active, onAdvance }) {
  switch (active) {
    case 1:
      return <BookingStep onComplete={onAdvance} />
    case 2:
      return <ResumeStep onComplete={onAdvance} />
    case 3:
      return <WorkspaceStep />
    case 4:
      return <QuizStep onComplete={onAdvance} />
    case 5:
      return <InterviewStep onComplete={onAdvance} />
    default:
      return <BookingStep onComplete={onAdvance} />
  }
}