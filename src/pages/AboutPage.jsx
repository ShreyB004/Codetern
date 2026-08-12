import { Compass, Handshake, Layers, UserCheck, Users } from 'lucide-react'
import { Page } from '../components/layout/Page.jsx'
import { SectionHeading } from '../components/ui/SectionHeading.jsx'
import { useRevealScope } from '../hooks/useReveal.js'
import { COMPANY_STATS } from '../data/portfolio.js'

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
  const scope = useRevealScope()

  return (
    <Page className="overflow-hidden">
      {/* hero */}
      <section className="relative overflow-hidden bg-ink py-24 text-white">
        <div className="grid-lines absolute inset-0 opacity-20" />
        <div className="pointer-events-none absolute -right-24 top-[-20%] h-80 w-80 rounded-full bg-cyan-snap/20 blur-[110px]" />
        <div className="pointer-events-none absolute -left-20 bottom-[-30%] h-80 w-80 rounded-full bg-violet-deep/25 blur-[110px]" />
        <div className="relative mx-auto max-w-4xl px-5 text-center lg:px-8">
          <span data-enter className="mb-5 inline-block rounded-bubble border border-neon/40 bg-neon/10 px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-neon">
            About Codetern
          </span>
          <h1 data-enter className="font-display text-4xl font-extrabold leading-tight tracking-tight sm:text-6xl">
            A bootcamp that behaves like <span className="text-gradient-snap">a real job.</span>
          </h1>
          <p data-enter className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-white/60 sm:text-lg">
            Codetern was built after we watched thousands of “completed” internships never lead anywhere. No real
            code, no review, no proof. We inverted the model: entry is earned, work is graded, and the output is
            verifiable — so a hiring manager sees your ability, not your certificate’s logo.
          </p>
        </div>
      </section>

      {/* pillars */}
      <section ref={scope} className="bg-paper py-24">
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
                  className="group rounded-panel border border-ink/8 bg-white p-7 shadow-card transition-all duration-500 hover:-translate-y-1.5 hover:shadow-float"
                  style={{ transitionDelay: `${(i % 3) * 60}ms` }}
                >
                  <span className="mb-5 grid h-12 w-12 place-items-center rounded-2xl bg-cyan-snap/10 text-cyan-snap transition group-hover:bg-ink group-hover:text-neon">
                    <Icon size={22} />
                  </span>
                  <h3 className="font-display text-lg font-bold text-ink">{p.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-ink/55">{p.desc}</p>
                </div>
              )
            })}
            {/* stats tile */}
            <div
              data-reveal
              className="flex flex-col justify-center gap-5 rounded-panel bg-ink p-7 text-white shadow-float"
            >
              <h3 className="font-display text-lg font-bold">Proof over promises</h3>
              <div className="grid grid-cols-2 gap-4">
                {COMPANY_STATS.map((s) => (
                  <div key={s.label}>
                    <p className="font-display text-2xl font-extrabold text-neon tabular-nums">
                      {s.value.toLocaleString('en-IN')}
                      {s.suffix || ''}
                    </p>
                    <p className="text-[11px] text-white/45">{s.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* mentor network */}
      <section ref={scope} className="relative overflow-hidden bg-ink py-24 text-white">
        <div className="mx-auto grid max-w-7xl items-center gap-12 px-5 lg:grid-cols-2 lg:px-8">
          <div data-reveal>
            <span className="mb-4 inline-block rounded-bubble border border-cyan-snap/30 bg-cyan-snap/10 px-3.5 py-1.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-cyan-snap">
              The mentor network
            </span>
            <h2 className="font-display text-3xl font-bold leading-tight tracking-tight sm:text-5xl">
              Reviewed by people who <span className="text-gradient-snap">hire for these roles.</span>
            </h2>
            <p className="mt-5 max-w-lg text-base leading-relaxed text-white/60">
              Your work isn’t graded by test scripts alone. Every sprint ends with a structured review — architecture,
              code quality, communication — from engineers and designers working in the industry today.
            </p>
            <ul className="mt-7 space-y-3.5">
              {['Weekly 1:1 sprint reviews', 'Asynchronous PR feedback within 24h', 'Mock interviews with real hiring rubrics'].map(
                (t) => (
                  <li key={t} className="flex items-center gap-3 text-sm text-white/75">
                    <span className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-neon/15 text-neon">
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
                    <span className="grid h-9 w-9 place-items-center rounded-full bg-gradient-to-br from-cyan-snap to-violet-deep text-xs font-bold text-ink">
                      {role.split(' ')[0][0]}
                    </span>
                    <p className="text-sm font-semibold text-white">{handle}</p>
                  </div>
                  <p className="mt-2 text-xs text-white/40">{role}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </Page>
  )
}