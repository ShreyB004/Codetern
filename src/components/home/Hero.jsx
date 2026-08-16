import { ArrowRight, PlayCircle, Sparkles, Timer, Trophy, Users } from 'lucide-react'
import { Button } from '../ui/Button.jsx'
import { Pill } from '../ui/Pill.jsx'
import { FloatingCard } from '../ui/FloatingCard.jsx'
import { useLoginModal } from '../ui/LoginModal.jsx'
import { useAuth } from '../../context/AppContext.jsx'
import { useRevealScope } from '../../hooks/useReveal.js'
import { useNavigate } from 'react-router-dom'
import { DotGrid } from '../ui/backgrounds/DotGrid.jsx'

const HERO_DOTS = { colors: ['#22d3ee', '#38ffb0', '#7c5cff'], spacing: 28, dotSize: 2.5 }

export function Hero() {
  const scope = useRevealScope()
  const openLogin = useLoginModal()
  const { isAuthenticated } = useAuth()
  const navigate = useNavigate()

  const go = () => (isAuthenticated ? navigate('/dashboard') : openLogin('signup'))

  return (
    <section ref={scope} className="relative overflow-hidden bg-paper text-ink dark:bg-ink dark:text-paper">
      {/* backdrop */}
      <div className="grid-lines absolute inset-0 opacity-25" />
      <div className="absolute inset-0">
        <DotGrid config={HERO_DOTS} className="opacity-60" />
      </div>
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-paper to-transparent dark:from-ink" />

      <div className="relative mx-auto grid max-w-7xl items-center gap-14 px-5 pb-24 pt-16 lg:grid-cols-[1.1fr_1fr] lg:px-8 lg:pt-24">
        {/* copy */}
        <div data-reveal>
          <div className="mb-6 flex flex-wrap gap-2.5">
            <Pill tone="neon" dot>Applications open</Pill>
            <Pill tone="dark">14 internship domains</Pill>
            <Pill tone="dark">Mentor-led sprints</Pill>
          </div>

          <h1 className="font-display text-balance text-[2.7rem] font-extrabold leading-[1.02] tracking-tight sm:text-6xl lg:text-7xl">
            Do an internship
            <br />
            <span className="text-gradient-deep dark:text-gradient-snap">with real stakes,</span>
            <br />
            before your first job.
          </h1>

          <p className="mt-6 max-w-xl text-base leading-relaxed text-ink/65 dark:text-paper/60 sm:text-lg">
            Codetern recreates a real engineering internship — production-shaped projects in engineering, data and
            design, senior-style code reviews every week, and deployed work recruiters can actually verify. You
            graduate with lines in your portfolio, not credits on a transcript.
          </p>

          <div className="mt-9 flex flex-wrap items-center gap-4">
            <Button size="lg" variant="neon" onClick={go}>
              Start your internship
              <ArrowRight size={17} />
            </Button>
            <Button size="lg" variant="ghost" magnetic={false} onClick={() => navigate('/domains')}>
              <PlayCircle size={17} />
              See the projects you&apos;ll ship
            </Button>
          </div>

          <div className="mt-10 flex flex-wrap gap-x-8 gap-y-3">
            {[
              { icon: Users, label: '1,240+ interns trained' },
              { icon: Trophy, label: '86% placed' },
              { icon: Timer, label: '1–6 month tracks' },
            ].map(({ icon: Icon, label }) => (
              <div key={label} className="flex items-center gap-2 text-sm text-ink/55 dark:text-paper/55">
                <Icon size={15} className="text-cyan-deep dark:text-cyan-snap" />
                {label}
              </div>
            ))}
          </div>
        </div>

        {/* floating card cluster */}
        <div className="relative hidden h-[520px] lg:block" data-enter-scale>
          {/* base panel */}
          <div className="absolute left-1/2 top-1/2 w-[380px] -translate-x-1/2 -translate-y-1/2 rounded-panel border border-ink/10 bg-ink/[0.04] p-6 shadow-float backdrop-blur-sm dark:border-white/10 dark:bg-white/[0.04]">
            <div className="flex items-center gap-3">
              <span className="grid h-11 w-11 place-items-center rounded-2xl bg-cyan-deep/12 text-cyan-deep dark:bg-cyan-snap/15 dark:text-cyan-snap">
                <Sparkles size={20} />
              </span>
              <div>
                <p className="text-sm font-bold">Internship engine</p>
                <p className="text-xs text-ink/55 dark:text-paper/55">mentor-guided production sprints</p>
              </div>
            </div>
            <div className="mt-5 space-y-2.5">
              {[
                ['Mentor code review', 'PR approved ✓'],
                ['Production handoff', 'Live + CI green ✓'],
                ['Portfolio evidence', 'Linked on your resume ✓'],
              ].map(([k, v]) => (
                <div key={k} className="flex items-center justify-between rounded-xl border border-ink/8 bg-ink/[0.04] px-3.5 py-2.5 dark:border-white/8 dark:bg-white/[0.04]">
                  <span className="text-xs text-ink/65 dark:text-paper/65">{k}</span>
                  <span className="text-xs font-bold text-neon-deep dark:text-neon">{v}</span>
                </div>
              ))}
            </div>
          </div>

          {/* floating small cards */}
          <FloatingCard className="left-0 top-16" amplitude={14} duration={4}>
            <div className="w-56 rounded-2xl border border-ink/10 bg-ink/[0.05] p-4 shadow-float backdrop-blur-md dark:border-white/10 dark:bg-white/[0.05]">
              <p className="text-[11px] font-bold uppercase tracking-widest text-ink/55 dark:text-paper/55">MERN · 3-month internship</p>
              <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-ink/8 dark:bg-white/10">
                <div className="h-full w-2/3 rounded-full bg-gradient-to-r from-cyan-deep to-neon-deep dark:from-cyan-snap dark:to-neon" />
              </div>
              <p className="mt-2 text-[11px] text-ink/55 dark:text-paper/55">Sprint 4 of 6 · in mentor review</p>
            </div>
          </FloatingCard>

          <FloatingCard className="right-[-4%] top-40" amplitude={18} duration={4.6} delay={0.6}>
            <div className="w-52 rounded-2xl border border-neon/30 bg-ink-soft p-4 shadow-float">
              <p className="text-[11px] font-bold uppercase tracking-widest text-neon">Shipped this week</p>
              <p className="mt-2 font-display text-3xl font-extrabold text-white tabular-nums">21</p>
              <p className="text-[11px] text-white/55">production deploys by interns</p>
            </div>
          </FloatingCard>

          <FloatingCard className="bottom-6 left-4" amplitude={10} duration={3.6} delay={0.3}>
            <div className="flex items-center gap-3 rounded-2xl border border-ink/10 bg-ink/[0.05] px-4 py-3 shadow-float backdrop-blur-md dark:border-white/10 dark:bg-white/[0.05]">
              <span className="grid h-9 w-9 place-items-center rounded-xl bg-violet-deep/25 text-violet-deep">
                <Trophy size={16} />
              </span>
              <div>
                <p className="text-xs font-bold text-ink dark:text-paper">Portfolio that proves it</p>
                <p className="text-[10px] text-ink/55 dark:text-paper/55">live projects recruiters can open</p>
              </div>
            </div>
          </FloatingCard>

          {/* decorative orbiting ring */}
          <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full border border-dashed border-cyan-deep/25 dark:border-cyan-snap/30" />
        </div>
      </div>
    </section>
  )
}