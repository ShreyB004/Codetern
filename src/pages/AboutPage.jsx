import { Award, ClipboardCheck, Compass, FileCheck2, Hammer, Handshake, Layers, UserCheck, Users } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { Page } from '../components/layout/Page.jsx'
import { SectionHeading } from '../components/ui/SectionHeading.jsx'
import { Button } from '../components/ui/Button.jsx'
import { useRevealScope } from '../hooks/useReveal.js'
import { useTheme } from '../context/ThemeContext.jsx'
import { useCountUp } from '../hooks/useCountUp.js'
import { COMPANY_STATS } from '../data/portfolio.js'
import { AuroraBackground } from '../components/ui/backgrounds/AuroraBackground.jsx'
import { ConstellationBackground } from '../components/ui/backgrounds/ConstellationBackground.jsx'
import { ScrollReveal } from '../components/ui/effects/ScrollReveal.jsx'

function StatCount({ value, suffix = '', label }) {
  const { ref, value: v } = useCountUp(value)
  return (
    <div ref={ref}>
      <p className="font-display text-2xl font-extrabold text-neon-deep tabular-nums dark:text-neon">
        {v.toLocaleString('en-IN')}
        {suffix}
      </p>
      <p className="text-[11px] text-ink/55 dark:text-paper/55">{label}</p>
    </div>
  )
}

const PILLARS = [
  {
    icon: Layers,
    title: 'Work > Lectures',
    desc: 'The old model is broken. We grade deliverables, ship outcomes and honest code reviews — not attendance or video completions.',
  },
  {
    icon: Compass,
    title: 'Simulated production',
    desc: 'Sprints, tickets, PRs and incident calls. If it would not survive a senior engineer, it does not ship to your portfolio.',
  },
  {
    icon: UserCheck,
    title: 'Screening = signal',
    desc: 'Baseline quizzes and AI mock interviews are our quality gate — employers trust our certificates because entry is gated.',
  },
  {
    icon: Users,
    title: 'Mentor network',
    desc: 'Working engineers and designers from product companies review your work weekly and unblock you in sync calls.',
  },
  {
    icon: Handshake,
    title: 'Employer-ready',
    desc: 'Every certificate carries a verification ID and performance data. 58 companies already verify Codetern alumni.',
  },
]

export default function AboutPage() {
  const pillarsScope = useRevealScope()
  const mentorScope = useRevealScope()
  const { isDark } = useTheme()
  const navigate = useNavigate()

  return (
    <Page className="overflow-hidden">
      {/* hero */}
      <section className="relative overflow-hidden bg-paper py-24 text-ink dark:bg-ink dark:text-paper">
        <div className="grid-lines absolute inset-0 opacity-20" />
        <AuroraBackground />
        <div className="relative mx-auto max-w-4xl px-5 text-center lg:px-8">
          <span data-enter className="mb-5 inline-block rounded-bubble border border-neon-deep/40 bg-neon-deep/10 px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-neon-deep dark:border-neon/40 dark:bg-neon/10 dark:text-neon">
            About Codetern
          </span>
          <ScrollReveal
            as="h1"
            className="font-display text-4xl font-extrabold leading-tight tracking-tight sm:text-6xl"
            colors={isDark ? ['transparent', 'transparent', 'transparent', 'transparent', 'transparent', '#22d3ee', '#38ffb0', '#7c5cff'] : ['transparent', 'transparent', 'transparent', 'transparent', 'transparent', '#0e7490', '#047857', '#5b21b6']}
          >
            An internship that behaves like a real job.
          </ScrollReveal>
          <p data-enter className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-ink/60 dark:text-paper/60 sm:text-lg">
            Codetern was built after we watched thousands of “completed” internships never lead anywhere. No real
            code, no review, no proof. We inverted the model: entry is earned, work is graded, and the output is
            verifiable — so a hiring manager sees your ability, not your certificate’s logo.
          </p>
        </div>
      </section>

      {/* pillars */}
      <section ref={pillarsScope} className="bg-paper py-24 dark:bg-ink">
        <div className="mx-auto max-w-7xl px-5 lg:px-8">
          <SectionHeading
            eyebrow="Why we exist"
            title="Five principles behind every track"
            align="left"
            className="mb-14"
          />
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {PILLARS.map((p, i) => {
              const Icon = p.icon
              return (
                <div
                  key={p.title}
                  data-reveal
                  className="group rounded-panel border border-ink/8 bg-white dark:border-paper/10 dark:bg-ink-soft p-7 shadow-card transition-all duration-500 hover:-translate-y-1.5 hover:shadow-float"
                  style={{ transitionDelay: `${(i % 3) * 60}ms` }}
                >
                  <span className="mb-5 grid h-12 w-12 place-items-center rounded-2xl bg-cyan-deep/10 text-cyan-deep transition group-hover:bg-ink group-hover:text-neon dark:bg-cyan-snap/10 dark:text-cyan-snap dark:group-hover:text-neon">
                    <Icon size={22} />
                  </span>
                  <h3 className="font-display text-lg font-bold text-ink dark:text-paper">{p.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-ink/60 dark:text-paper/55">{p.desc}</p>
                </div>
              )
            })}
            {/* stats tile */}
            <div
              data-reveal
              className="flex flex-col justify-center gap-5 rounded-panel bg-mist p-7 text-ink shadow-card dark:bg-ink dark:text-paper dark:shadow-float"
            >
              <h3 className="font-display text-lg font-bold">Proof over promises</h3>
              <div className="grid grid-cols-2 gap-4">
                {COMPANY_STATS.map((s) => (
                  <StatCount key={s.label} value={s.value} suffix={s.suffix || ''} label={s.label} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* mentor network */}
      <section ref={mentorScope} className="relative overflow-hidden bg-paper py-24 text-ink dark:bg-ink dark:text-paper">
        <ConstellationBackground count={44} className="opacity-50" />
        <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-5 lg:grid-cols-2 lg:px-8">
          <div data-reveal>
            <span className="mb-4 inline-block rounded-bubble border border-cyan-deep/30 bg-cyan-deep/10 px-3.5 py-1.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-cyan-deep dark:border-cyan-snap/30 dark:bg-cyan-snap/10 dark:text-cyan-snap">
              The mentor network
            </span>
            <h2 className="font-display text-3xl font-bold leading-tight tracking-tight sm:text-5xl">
              Reviewed by people who <span className="text-gradient-deep dark:text-gradient-snap">hire for these roles.</span>
            </h2>
            <p className="mt-5 max-w-lg text-base leading-relaxed text-ink/60 dark:text-paper/60">
              Your work isn’t graded by test scripts alone. Every sprint ends with a structured review — architecture,
              code quality, communication — from engineers and designers working in the industry today.
            </p>
            <ul className="mt-7 space-y-3.5">
              {['Weekly 1:1 sprint reviews', 'Asynchronous PR feedback within 24h', 'Mock interviews with real hiring rubrics'].map(
                (t) => (
                  <li key={t} className="flex items-center gap-3 text-sm text-ink/75 dark:text-paper/75">
                    <span className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-neon-deep/15 text-neon-deep dark:bg-neon/15 dark:text-neon">
                      <Compass size={13} />
                    </span>
                    {t}
                  </li>
                ),
              )}
            </ul>
          </div>
          <div data-reveal>
            <div className="grid grid-cols-2 gap-4">
              {[
                ['FS Engineer · Razorpay', 'Attack the requester', 'bg-ink-soft border-white/10'],
                ['ML Engineer · Fractal', 'The optimizer', 'bg-ink-soft border-white/10'],
                ['Security Eng · Infosys', 'The breaker', 'bg-ink-soft border-neon/30'],
                ['Product Designer · CRED', 'The pixel police', 'bg-ink-soft border-white/10'],
                ['Data Eng · Swiggy', 'The pipeline guard', 'bg-ink-soft border-white/10'],
                ['DevOps Eng · Zoho', 'The deployer', 'bg-ink-soft border-violet-deep/40'],
              ].map(([role, handle, cls], i) => (
                <div key={role} className={`rounded-panel border p-4 ${cls}`} data-reveal style={{ transitionDelay: `${i * 50}ms` }}>
                  <div className="flex items-center gap-3">
                    <span
                      className="grid h-9 w-9 place-items-center rounded-full text-xs font-bold text-white"
                      style={{
                        background:
                          'linear-gradient(rgba(11,14,26,0.45), rgba(11,14,26,0.45)), linear-gradient(135deg, var(--color-cyan-snap), var(--color-violet-deep))',
                      }}
                    >
                      {role.split(' ')[0][0]}
                    </span>
                    <p className="text-sm font-semibold text-white">{handle}</p>
                  </div>
                  <p className="mt-2 text-xs text-white/55">{role}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* education loop */}
      <section className="relative bg-paper py-24 text-ink dark:bg-ink dark:text-paper">
        <div className="mx-auto max-w-7xl px-5 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <span className="mb-4 inline-block rounded-bubble border border-violet-deep/30 bg-violet-deep/10 px-3.5 py-1.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-ink/60 dark:border-violet-snap/30 dark:bg-violet-snap/10 dark:text-paper/60">
              The education loop
            </span>
            <h2 className="font-display text-3xl font-bold leading-tight tracking-tight sm:text-5xl">
              Progress you can <span className="text-gradient-deep dark:text-gradient-snap">hold in your hand.</span>
            </h2>
            <p className="mt-5 text-base leading-relaxed text-ink/60 dark:text-paper/60">
              Degrees grade what you were taught. We grade what you made — a closed loop where every stage produces
              something inspectable.
            </p>
          </div>
          <div className="mt-12 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {[
              { icon: ClipboardCheck, step: '01', title: 'Assess', desc: 'Baseline quiz + AI mock interview gate every batch. Screening is the signal, not a formality.' },
              { icon: Hammer, step: '02', title: 'Build', desc: 'Live briefs, weekly sprints, your own repo from day one. No lectures to sit through.' },
              { icon: FileCheck2, step: '03', title: 'Review', desc: 'Mentors approve evidence or bounce it back with specific changes — like a real code review.' },
              { icon: Award, step: '04', title: 'Prove', desc: 'Certificate with a verification ID, a letter of recommendation, and a living portfolio.' },
            ].map(({ icon: Icon, step, title, desc }, i) => (
              <div
                key={title}
                className="group rounded-panel border border-ink/10 bg-white p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-card dark:border-paper/10 dark:bg-ink-soft"
                data-reveal
                style={{ transitionDelay: `${i * 60}ms` }}
              >
                <div className="flex items-center justify-between">
                  <span className="grid h-10 w-10 place-items-center rounded-xl bg-neon-deep/12 text-neon-deep dark:bg-neon/12 dark:text-neon">
                    <Icon size={18} />
                  </span>
                  <span className="font-display text-lg font-extrabold text-ink/15 transition-colors group-hover:text-neon-deep/40 dark:text-paper/15 dark:group-hover:text-neon/40">
                    {step}
                  </span>
                </div>
                <p className="mt-4 font-display text-lg font-bold">{title}</p>
                <p className="mt-1.5 text-xs leading-relaxed text-ink/60 dark:text-paper/60">{desc}</p>
              </div>
            ))}
          </div>

          <div className="mt-16">
            <p className="text-center text-xs font-bold uppercase tracking-[0.16em] text-ink/45 dark:text-paper/45">
              What one batch looks like
            </p>
            <div className="mt-6 grid gap-3 sm:grid-cols-3 lg:grid-cols-6">
              {[
                ['Day 1', 'Batch opens, briefs land, you pick your track'],
                ['Week 1', 'Kickoff call + first sprint ships'],
                ['Week 2', 'Sprint review #1 + fixes in your own PR'],
                ['Week 3', 'Sprint review #2 + final polish'],
                ['Mid-batch', 'AI mock interview milestone'],
                ['Final week', 'Evidence lock · certificate · LOR'],
              ].map(([when, what], i) => (
                <div key={when} className="relative" data-reveal style={{ transitionDelay: `${i * 50}ms` }}>
                  <div className="flex items-center gap-2">
                    <span className="grid h-5 w-5 place-items-center rounded-full border-2 border-neon-deep/40 bg-white dark:border-neon/40 dark:bg-ink-soft">
                      <span className="h-1.5 w-1.5 rounded-full bg-neon-deep dark:bg-neon" />
                    </span>
                    {i < 5 && <span className="h-px flex-1 bg-ink/15 dark:bg-paper/15" />}
                  </div>
                  <p className="mt-2.5 text-xs font-bold text-neon-deep dark:text-neon">{when}</p>
                  <p className="mt-1 text-[11px] leading-relaxed text-ink/60 dark:text-paper/60">{what}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* students & colleges */}
      <section className="relative overflow-hidden bg-ink py-24 text-paper dark:bg-ink-soft">
        <div className="grid-lines absolute inset-0 opacity-20" />
        <ConstellationBackground count={30} className="opacity-40" />
        <div className="relative mx-auto max-w-7xl px-5 lg:px-8">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <div>
              <span className="mb-4 inline-block rounded-bubble border border-white/25 bg-white/10 px-3.5 py-1.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-paper/70">
                Seat-mates &amp; campuses
              </span>
              <h2 className="font-display text-3xl font-bold leading-tight tracking-tight sm:text-5xl">
                One kind of prestige around here: <span className="text-neon">made things.</span>
              </h2>
              <p className="mt-5 max-w-lg text-base leading-relaxed text-paper/65">
                No referrals got anyone in, and no network decides who ships. Students from 40+ campuses run the same
                briefs, get the same reviews, and keep the same folder of proof.
              </p>
              <div className="mt-7 grid grid-cols-3 gap-4">
                {[
                  ['300+', 'interns this year'],
                  ['41', 'campuses'],
                  ['2,300+', 'applications'],
                ].map(([v, l]) => (
                  <div key={l}>
                    <p className="font-display text-2xl font-extrabold text-neon tabular-nums">{v}</p>
                    <p className="text-[11px] text-paper/55">{l}</p>
                  </div>
                ))}
              </div>
              <blockquote className="mt-8 border-l-2 border-neon/60 pl-4 text-sm italic leading-relaxed text-paper/75">
                “Your degree says you were taught. Your portfolio says you shipped. We optimise for the second one.”
                <span className="mt-1.5 block text-xs font-bold not-italic text-paper/50">— batch starter note, Day 1</span>
              </blockquote>
              <div className="mt-8">
                <Button variant="neon" onClick={() => navigate('/programmes')}>
                  Start from Day 1 →
                </Button>
              </div>
            </div>
            <div className="rounded-panel border border-white/10 bg-white/5 p-6 backdrop-blur-sm" data-reveal>
              <p className="mb-4 text-xs font-bold uppercase tracking-[0.16em] text-paper/50">Campuses that shipped briefs</p>
              <div className="flex flex-wrap gap-2">
                {['KJ Somaiya', 'NMIMS', 'VIT', 'SRM', 'Manipal', 'BITS Hyderabad', 'Chandigarh University', 'Symbiosis', 'Thapar', 'LPU', 'IIT Bhilai', 'DTU'].map(
                  (c) => (
                    <span
                      key={c}
                      className="rounded-bubble border border-white/15 bg-white/5 px-3 py-1.5 font-mono text-[11px] text-paper/80"
                    >
                      {c}
                    </span>
                  ),
                )}
              </div>
              <div className="mt-6 grid gap-3 border-t border-white/10 pt-5">
                {[
                  'Evidence in, evidence reviewed — no viva theatrics',
                  'Same 14 domains, same price, same standards on every campus',
                  'Internship documentation your college actually accepts',
                ].map((t) => (
                  <p key={t} className="flex items-start gap-2.5 text-xs text-paper/70">
                    <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-neon/15 font-bold text-neon">✓</span>
                    {t}
                  </p>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    </Page>
  )
}
