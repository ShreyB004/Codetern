import { BadgeCheck, BriefcaseBusiness, Clock4, Factory, Headset, Users2 } from 'lucide-react'
import { useRevealScope } from '../../hooks/useReveal.js'
import { BeamsBackground } from '../ui/backgrounds/BeamsBackground.jsx'
import { ScrollReveal } from '../ui/effects/ScrollReveal.jsx'
import { useTheme } from '../../context/ThemeContext.jsx'

const FEATURES = [
  {
    icon: Factory,
    title: 'Industrial Training',
    desc: 'Hands-on exposure to industry tools & corporate workflows.',
    accent: 'text-cyan-deep bg-cyan-deep/10 dark:text-cyan-snap dark:bg-cyan-snap/10',
    ring: 'group-hover:border-cyan-snap/40',
  },
  {
    icon: Users2,
    title: 'Expert Mentors',
    desc: 'Guidance from professionals working in top tech companies — 1-to-1.',
    accent: 'text-violet-ink bg-violet-ink/10 dark:text-violet-deep dark:bg-violet-deep/10',
    ring: 'group-hover:border-violet-deep/40',
  },
  {
    icon: BriefcaseBusiness,
    title: 'Interview Readiness',
    desc: 'AI mock interviews and scorecards turn every shipped feature into an answer you can defend.',
    accent: 'text-mint-deep bg-mint-deep/10 dark:text-mint dark:bg-mint/10',
    ring: 'group-hover:border-mint/40',
  },
  {
    icon: Clock4,
    title: 'Flexible Hours',
    desc: 'Self-paced learning that fits your college schedule perfectly.',
    accent: 'text-coral-deep bg-coral-deep/10 dark:text-coral dark:bg-coral/10',
    ring: 'group-hover:border-coral/40',
  },
  {
    icon: Headset,
    title: '24/7 Support',
    desc: 'Round-the-clock assistance to keep your learning uninterrupted — including college documentation.',
    accent: 'text-neon-deep bg-neon-deep/10 dark:text-neon dark:bg-neon/10',
    ring: 'group-hover:border-neon/40',
  },
  {
    icon: BadgeCheck,
    title: 'College Valid',
    desc: 'Curriculum compliant with university internship requirements.',
    accent: 'text-cyan-deep bg-cyan-deep/10 dark:text-cyan-snap dark:bg-cyan-snap/10',
    ring: 'group-hover:border-cyan-snap/40',
  },
]

export function IndustrialTraining() {
  const scope = useRevealScope()
  const { isDark } = useTheme()

  return (
    <section ref={scope} className="cdt-lively relative overflow-hidden bg-paper py-24 text-ink dark:bg-ink dark:text-paper">
      <BeamsBackground className="opacity-30" />
      <div className="cdt-drift cdt-drift-slow pointer-events-none absolute left-1/2 top-0 h-72 w-[680px] -translate-x-1/2 rounded-full bg-violet-deep/10 blur-[130px]" />

      <div className="relative mx-auto max-w-7xl px-5 lg:px-8">
        {/* header */}
        <div className="mx-auto mb-14 max-w-2xl text-center" data-reveal>
          <span className="mb-4 inline-block rounded-bubble border border-neon-deep/40 bg-neon-deep/10 px-3.5 py-1.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-neon-deep dark:border-neon/40 dark:bg-neon/10 dark:text-neon">
            Industrial training that counts
          </span>
          <ScrollReveal
            as="h2"
            className="font-display text-3xl font-bold tracking-tight sm:text-5xl"
            colors={isDark ? ['transparent', 'transparent', 'transparent', 'transparent', '#38ffb0', '#22d3ee', 'transparent', '#7c5cff'] : ['transparent', 'transparent', 'transparent', 'transparent', '#047857', '#0e7490', 'transparent', '#5b21b6']}
          >
            Everything a real internship should be.
          </ScrollReveal>
          <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-ink/60 dark:text-paper/60">
            College credits want documentation. Careers want evidence. Codetern internships deliver both — the
            structure of a corporate stint with the output of a production team.
          </p>
        </div>

        {/* feature grid */}
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map(({ icon: Icon, title, desc, accent, ring }, i) => (
            <div
              key={title}
              data-reveal
              style={{ transitionDelay: `${(i % 3) * 70}ms` }}
              className={`group relative overflow-hidden rounded-panel border border-ink/8 bg-white p-6 shadow-card transition-all duration-500 hover:-translate-y-1.5 hover:shadow-float dark:border-paper/10 dark:bg-ink-soft ${ring}`}
            >
              <span className="pointer-events-none absolute -right-6 -top-6 font-display text-7xl font-extrabold text-ink/5 transition-colors duration-500 group-hover:text-ink/10 dark:text-paper/5 dark:group-hover:text-paper/10">
                {String(i + 1).padStart(2, '0')}
              </span>
              <span className={`grid h-12 w-12 place-items-center rounded-2xl transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-6 ${accent}`}>
                <Icon size={22} />
              </span>
              <h3 className="mt-5 font-display text-lg font-bold">{title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-ink/60 dark:text-paper/55">{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}