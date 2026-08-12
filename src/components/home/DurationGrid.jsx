import { useNavigate } from 'react-router-dom'
import { ArrowUpRight, Clock3, Rocket, Workflow, Zap } from 'lucide-react'
import { useRevealScope } from '../../hooks/useReveal.js'
import { Button } from '../ui/Button.jsx'
import { TiltCard } from '../ui/TiltCard.jsx'
import { cn } from '../../lib/utils.js'

const DUR = [
  {
    months: 1,
    kicker: 'Sprint',
    title: '1-Month Sprint',
    desc: 'Intense output sprint for one focused skill — design a component system or ship a single polished feature.',
    icon: Zap,
    tag: 'Front-end · UI/UX',
    accent: 'from-cyan-snap to-mint',
    glow: 'rgba(34,211,238,0.14)',
  },
  {
    months: 2,
    kicker: 'Foundations',
    title: '2-Month Foundation',
    desc: 'Core craft with weekly milestones — genuinely master HTML/CSS/JS or the BI & analytics stack end-to-end.',
    icon: Workflow,
    tag: 'Web · BI · Security · Network',
    accent: 'from-violet-deep to-cyan-snap',
    glow: 'rgba(124,92,255,0.16)',
  },
  {
    months: 3,
    kicker: 'Pro Track',
    title: '3-Month Professional',
    desc: 'The flagship. Two live projects, mentor reviews and a portfolio employers verify — MERN, Front-end, DS, ML.',
    icon: Rocket,
    tag: 'Full-Stack · Data · AI · Mobile',
    accent: 'from-neon to-mint',
    glow: 'rgba(180,255,57,0.14)',
  },
  {
    months: 6,
    kicker: 'Apprenticeship',
    title: '6-Month Apprenticeship',
    desc: 'Deep engineering residency — production pipelines, infra and ML serving. Closest thing to a real first role.',
    icon: Clock3,
    tag: 'Backend · AI · Data Eng · DevOps',
    accent: 'from-coral to-violet-deep',
    glow: 'rgba(255,92,122,0.14)',
  },
]

export function DurationGrid() {
  const scope = useRevealScope()
  const navigate = useNavigate()
  const featured = 3

  return (
    <section ref={scope} className="relative overflow-hidden bg-paper py-24">
      <div className="dot-grid pointer-events-none absolute inset-0 opacity-40" />
      <div className="pointer-events-none absolute right-[-6%] top-10 h-72 w-72 rounded-full bg-cyan-snap/10 blur-[100px]" />

      <div className="relative mx-auto max-w-7xl px-5 lg:px-8">
        <div className="mb-14 flex flex-col items-start justify-between gap-6 lg:flex-row lg:items-end">
          <div data-reveal>
            <span className="mb-4 inline-block rounded-bubble border border-cyan-snap/30 bg-cyan-snap/10 px-3.5 py-1.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-cyan-snap">
              Programme durations
            </span>
            <h2 className="max-w-2xl font-display text-3xl font-bold leading-tight tracking-tight text-ink sm:text-5xl">
              Pick your pace — <span className="text-gradient-snap">1, 2, 3 or 6 months</span> of real work.
            </h2>
          </div>
          <Button variant="ghost" className="group" onClick={() => navigate('/domains')}>
            See all programmes
            <ArrowUpRight size={16} className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </Button>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {DUR.map((d, i) => {
            const Icon = d.icon
            return (
              <div key={d.months} data-reveal style={{ transitionDelay: `${i * 60}ms` }}>
                <TiltCard max={7}>
                  <div
                    className={cn(
                      'relative flex h-full flex-col overflow-hidden rounded-panel border border-ink/8 p-6 shadow-card transition-shadow duration-500 hover:shadow-float',
                      featured === d.months && 'bg-ink text-white',
                      featured !== d.months && 'bg-white',
                    )}
                    style={{ boxShadow: `0 18px 50px -22px ${d.glow}` }}
                  >
                    <div
                      className={`pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-gradient-to-br ${d.accent} opacity-20 blur-2xl`}
                    />
                    <div
                      className={cn(
                        'mb-5 inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br',
                        d.accent,
                        featured === d.months ? 'text-ink' : 'text-ink',
                      )}
                    >
                      <Icon size={20} strokeWidth={2.2} />
                    </div>
                    <p className={cn('text-[11px] font-bold uppercase tracking-[0.18em]', featured === d.months ? 'text-neon' : 'text-cyan-snap')}>
                      {d.kicker}
                    </p>
                    <h3 className={cn('mt-2 font-display text-2xl font-bold', featured === d.months ? 'text-white' : 'text-ink')}>
                      {d.title}
                    </h3>
                    <p className={cn('mt-2.5 flex-1 text-sm leading-relaxed', featured === d.months ? 'text-white/60' : 'text-ink/55')}>
                      {d.desc}
                    </p>
                    <div className="mt-5">
                      <span
                        className={cn(
                          'inline-block rounded-bubble px-3 py-1 text-[11px] font-semibold',
                          featured === d.months ? 'bg-white/10 text-white/80' : 'bg-ink/5 text-ink/60',
                        )}
                      >
                        {d.tag}
                      </span>
                    </div>
                    {featured === d.months && (
                      <div className="absolute right-4 top-4 rounded-bubble bg-neon px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wider text-ink">
                        Most chosen
                      </div>
                    )}
                  </div>
                </TiltCard>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}