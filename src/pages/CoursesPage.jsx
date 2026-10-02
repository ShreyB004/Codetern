import { Link } from 'react-router-dom'
import { ArrowRight, GitPullRequest, Users, Hammer } from 'lucide-react'
import { Page } from '../components/layout/Page.jsx'
import { Pill } from '../components/ui/Pill.jsx'
import { Reveal } from '../components/ui/Reveal.jsx'
import { COURSES } from '../data/courses.js'
import { useSite } from '../hooks/useSite.js'

export default function CoursesPage() {
  const site = useSite('courses')
  return (
    <Page>
      <section className="mx-auto max-w-6xl px-5 pb-24 pt-28 lg:px-8">
        <div className="max-w-2xl">
          <Pill tone="neon" dot pulse>{site.badge}</Pill>
          <h1 className="mt-4 font-display text-5xl font-extrabold tracking-tight">{site.title}</h1>
          <p className="mt-3 text-[15px] opacity-60">{site.sub}</p>
        </div>
        <div className="mt-8 grid gap-4 md:grid-cols-2">
          {COURSES.map((c, i) => (
            <Reveal key={c.id} delay={(i % 2) * 80}>
            <article className="group h-full rounded-[1.75rem] border border-ink/10 bg-white p-6 shadow-card transition-all duration-300 hover:-translate-y-1 hover:shadow-float dark:border-paper/10 dark:bg-ink-soft dark:shadow-none">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-wider opacity-50">{c.level}</p>
                  <h2 className="mt-1 font-display text-2xl font-extrabold">{c.title}</h2>
                  <p className="text-sm opacity-60">{c.sub}</p>
                </div>
                <span className="shrink-0 rounded-2xl px-3 py-2 text-xs font-bold text-ink" style={{ background: c.color }}>{c.weeks} wks</span>
              </div>
              <p className="mt-3 text-sm opacity-70">{c.tagline}</p>
              <ul className="mt-3 space-y-1.5">
                {c.outcomes.map((o) => <li key={o} className="flex gap-2 text-[13px] opacity-70"><Hammer size={13} className="mt-0.5 shrink-0" />{o}</li>)}
              </ul>
              <div className="mt-3 grid gap-2 rounded-2xl bg-paper p-3 text-[13px] dark:bg-ink">
                <p className="flex gap-2"><GitPullRequest size={14} className="mt-0.5 shrink-0" /><span><b>Build:</b> {c.build}</span></p>
                <p className="flex gap-2"><Users size={14} className="mt-0.5 shrink-0" /><span><b>Team sim:</b> {c.teamSim}</span></p>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                <Link to={`/join?course=${c.id}`} className="rounded-full bg-ink px-4 py-2 text-sm font-bold text-white transition hover:-translate-y-0.5 dark:bg-paper dark:text-ink">Join this course</Link>
                <Link to={`/learn/${c.id}`} className="rounded-full border border-ink/15 px-4 py-2 text-sm font-bold transition hover:-translate-y-0.5 dark:border-paper/15">View syllabus <ArrowRight size={13} className="ml-1 inline" /></Link>
              </div>
            </article>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 pb-24 lg:px-8">
        <Reveal>
          <h2 className="font-display text-2xl font-extrabold tracking-tight">Compare at a glance</h2>
        </Reveal>
        <Reveal delay={80}>
        <div className="mt-4 overflow-x-auto rounded-3xl border border-ink/10 bg-white dark:border-paper/10 dark:bg-ink-soft">
          <table className="w-full min-w-[680px] text-left text-sm">
            <thead>
              <tr className="border-b border-dashed border-ink/15 opacity-50 dark:border-paper/15">
                {['Track', 'Length', 'You build', 'Review', 'Team sim'].map((h) => <th key={h} className="px-5 py-3.5 font-bold">{h}</th>)}
              </tr>
            </thead>
            <tbody>
              {COURSES.map((c) => (
                <tr key={c.id} className="border-b border-ink/5 transition last:border-0 hover:bg-paper/70 dark:border-paper/5 dark:hover:bg-ink">
                  <td className="px-5 py-3.5 font-bold">{c.title}<span className="block text-[11px] font-normal opacity-50">{c.sub}</span></td>
                  <td className="px-5 py-3.5">{c.weeks} weeks</td>
                  <td className="px-5 py-3.5 text-[13px] opacity-70">{c.build}</td>
                  <td className="px-5 py-3.5 text-[13px] opacity-70">PR review · 24h</td>
                  <td className="px-5 py-3.5 text-[13px] opacity-70">{c.teamSim}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        </Reveal>
      </section>
    </Page>
  )
}
