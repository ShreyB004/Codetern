import { ArrowUpRight, BookOpenCheck, FileBadge2, Github, MessagesSquare, NotepadText, TimerReset, Wrench } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useRevealScope } from '../../hooks/useReveal.js'
import { ScrollReveal } from '../ui/effects/ScrollReveal.jsx'
import { useTheme } from '../../context/ThemeContext.jsx'
import { DotGrid } from '../ui/backgrounds/DotGrid.jsx'

const RESOURCES = [
  {
    icon: NotepadText,
    title: 'Project & Sprint Library',
    desc: 'Domain playbooks, task checklists and grading rubrics for every track — your plan for the whole internship.',
  },
  {
    icon: Wrench,
    title: 'Industry Tool Vault',
    desc: 'Postman, MongoDB Atlas, Vercel, GitHub Actions, Figma and more — the exact toolkit teams use every day.',
  },
  {
    icon: TimerReset,
    title: 'Assessments & Scorecards',
    desc: 'Baseline quizzes per domain plus AI mock interviews that save a shareable scorecard to your profile.',
  },
  {
    icon: Github,
    title: 'Open-Source Style PR Flow',
    desc: 'Work in real repos with branches, pull requests and mentor review cycles — like your first team would.',
  },
  {
    icon: MessagesSquare,
    title: 'Mentor Office Hours',
    desc: 'Mon–Fri 1:1 sync calls, async PR feedback within 24 hours, and a community channel when you are stuck.',
  },
  {
    icon: FileBadge2,
    title: 'Verifiable Credentials',
    desc: 'Employer-checkable certificate with a unique ID, plus a letter of recommendation once you ship.',
  },
]

export function ResourceEcosystem() {
  const scope = useRevealScope()
  const { isDark } = useTheme()
  const navigate = useNavigate()

  return (
    <section ref={scope} className="relative overflow-hidden bg-paper py-24 text-ink dark:bg-ink dark:text-paper">
      <DotGrid config={{ colors: ['#7c5cff', '#22d3ee', '#38ffb0'], spacing: 32, dotSize: 2 }} className="opacity-40" />

      <div className="relative mx-auto grid max-w-7xl items-start gap-12 px-5 lg:grid-cols-[0.9fr_1.1fr] lg:px-8">
        {/* sticky intro */}
        <div className="lg:sticky lg:top-24" data-reveal>
          <span className="mb-4 inline-flex items-center gap-2 rounded-bubble border border-cyan-deep/30 bg-cyan-deep/10 px-3.5 py-1.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-cyan-deep dark:border-cyan-snap/30 dark:bg-cyan-snap/10 dark:text-cyan-snap">
            <BookOpenCheck size={13} />
            Resource ecosystem
          </span>
          <ScrollReveal
            as="h2"
            className="font-display text-3xl font-bold leading-tight tracking-tight sm:text-5xl"
            colors={isDark ? ['transparent', 'transparent', 'transparent', 'transparent', '#22d3ee', 'transparent', '#b4ff39', 'transparent'] : ['transparent', 'transparent', 'transparent', 'transparent', '#0e7490', 'transparent', '#4d7c0f', 'transparent']}
          >
            You don&apos;t learn alone. You learn inside an ecosystem.
          </ScrollReveal>
          <p className="mt-5 max-w-md text-base leading-relaxed text-ink/60 dark:text-paper/60">
            Every internship plugs you into the same stack a working team runs on — curated resources, review loops,
            live support and credentials employers can verify. The tools do the teaching; mentors do the judging.
          </p>
          <button
            onClick={() => navigate('/domains')}
            className="group mt-7 inline-flex min-h-11 items-center gap-1.5 rounded-full px-2 py-2 text-sm font-semibold text-ink transition-colors hover:text-neon-deep focus-ring dark:text-paper dark:hover:text-neon"
          >
            Explore the ecosystem
            <ArrowUpRight size={15} className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </button>
        </div>

        {/* resource grid */}
        <div className="grid gap-4 sm:grid-cols-2">
          {RESOURCES.map(({ icon: Icon, title, desc }, i) => (
            <div
              key={title}
              data-reveal
              style={{ transitionDelay: `${(i % 2) * 80}ms` }}
              className="group relative overflow-hidden rounded-panel border border-ink/8 bg-white p-5 shadow-card transition-all duration-500 hover:-translate-y-1 hover:shadow-float dark:border-paper/10 dark:bg-ink-soft"
            >
              <div className="pointer-events-none absolute -right-10 -top-10 h-24 w-24 rounded-full bg-cyan-snap/0 blur-2xl transition-colors duration-500 group-hover:bg-cyan-snap/15" />
              <div className="flex items-center justify-between">
                <span className="grid h-10 w-10 place-items-center rounded-xl bg-ink/5 text-ink/70 transition-colors duration-300 group-hover:bg-neon-deep/15 group-hover:text-neon-deep dark:bg-paper/5 dark:text-paper/70 dark:group-hover:text-neon">
                  <Icon size={18} />
                </span>
                <span className="rounded-bubble bg-ink/5 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-ink/50 dark:bg-paper/5 dark:text-paper/50">
                  {String(i + 1).padStart(2, '0')}
                </span>
              </div>
              <h3 className="mt-4 font-display text-base font-bold">{title}</h3>
              <p className="mt-1.5 text-xs leading-relaxed text-ink/60 dark:text-paper/55">{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}