import { BadgeCheck, BriefcaseBusiness, Code2, GitPullRequest, Mic2, Sparkles } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useRevealScope } from '../../hooks/useReveal.js'
import { useTheme } from '../../context/ThemeContext.jsx'
import { ScrollReveal } from '../ui/effects/ScrollReveal.jsx'
import { BeamsBackground } from '../ui/backgrounds/BeamsBackground.jsx'
import { cn } from '../../lib/utils.js'

/**
 * Outcome bento — replaces the old "5 steps" carousel. Same journey information
 * would repeat the milestones, so this section sells what interns WALK AWAY
 * WITH: portfolio, reviews, credentials, evidence and an interview-ready story.
 */

function MetricChip({ value, label, className }) {
  return (
    <span className={cn('inline-flex items-baseline gap-1 rounded-bubble px-3 py-1 text-xs font-bold', className)}>
      <span className="font-display text-base font-extrabold">{value}</span>
      <span className="font-medium opacity-75">{label}</span>
    </span>
  )
}

export function StepsCarousel() {
  const scope = useRevealScope()
  const { isDark } = useTheme()
  const navigate = useNavigate()

  return (
    <section ref={scope} className="cdt-lively relative overflow-hidden bg-paper py-24 dark:bg-ink">
      <BeamsBackground className="opacity-35" />
      <div className="cdt-drift pointer-events-none absolute right-[-8%] top-24 h-80 w-80 rounded-full bg-cyan-snap/10 blur-[120px]" />
      <div className="cdt-drift cdt-drift-slow cdt-drift-delayed pointer-events-none absolute bottom-10 left-[-6%] h-72 w-72 rounded-full bg-violet-deep/10 blur-[120px]" />

      <div className="relative mx-auto max-w-7xl px-5 lg:px-8">
        {/* header */}
        <div className="mb-14 flex flex-col items-start justify-between gap-6 lg:flex-row lg:items-end">
          <div className="max-w-2xl" data-reveal>
            <span className="mb-4 inline-block rounded-bubble border border-violet-ink/30 bg-violet-ink/10 px-3.5 py-1.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-violet-ink dark:border-violet-deep/30 dark:bg-violet-deep/10 dark:text-violet-deep">
              Outcomes, not modules
            </span>
            <ScrollReveal
              as="h2"
              className="font-display text-3xl font-bold leading-tight tracking-tight sm:text-5xl"
              colors={isDark ? ['transparent', 'transparent', 'transparent', 'transparent', '#22d3ee', '#38ffb0', '#7c5cff'] : ['transparent', 'transparent', 'transparent', 'transparent', '#0e7490', '#047857', '#5b21b6']}
            >
              What you walk away with.
            </ScrollReveal>
            <p className="mt-4 max-w-xl text-sm leading-relaxed text-ink/60 dark:text-paper/60">
              Courses give you a syllabus. Internships give you evidence. Every Codetern batch is engineered so the
              moment you finish, you can open the work and win the argument.
            </p>
          </div>
        </div>

        {/* bento grid */}
        <div className="grid gap-4 md:grid-cols-6">
          {/* big card 1 — portfolio */}
          <div
            data-reveal
            className="group relative overflow-hidden rounded-panel border border-ink/8 bg-white p-6 shadow-card transition-all duration-500 hover:-translate-y-1 hover:shadow-float md:col-span-3 dark:border-paper/10 dark:bg-ink-soft"
          >
            <div className="pointer-events-none absolute -right-14 -top-14 h-40 w-40 rounded-full bg-cyan-snap/12 blur-3xl transition-opacity duration-500 opacity-0 group-hover:opacity-100" />
            <div className="flex items-start justify-between">
              <span className="grid h-11 w-11 place-items-center rounded-2xl bg-cyan-deep/12 text-cyan-deep dark:bg-cyan-snap/15 dark:text-cyan-snap">
                <Code2 size={20} />
              </span>
              <MetricChip value="2–3" label="live builds" className="bg-cyan-deep/10 text-cyan-deep dark:bg-cyan-snap/10 dark:text-cyan-snap" />
            </div>
            <h3 className="mt-5 font-display text-xl font-bold">A portfolio you can defend</h3>
            <p className="mt-2 text-sm leading-relaxed text-ink/60 dark:text-paper/55">
              Production-shaped projects deployed on your own repos — auth, realtime, payments, scale. Every repo ships
              with CI green and a live URL an interviewer can open mid-call.
            </p>
            {/* repo mock */}
            <div className="mt-5 rounded-2xl border border-ink/10 bg-ink/[0.03] p-4 font-mono text-xs dark:border-white/10 dark:bg-white/[0.03]">
              <div className="flex items-center justify-between text-ink/60 dark:text-paper/60">
                <span>github.com/you/realtime-board</span>
                <span className="flex items-center gap-1 text-mint-deep dark:text-mint">
                  <span className="h-1.5 w-1.5 rounded-full bg-mint-deep dark:bg-mint" /> CI passing
                </span>
              </div>
              <div className="mt-2.5 space-y-1 text-ink/50 dark:text-paper/50">
                <p>✓ 46 tests · deployed 12m ago</p>
                <p className="text-cyan-deep dark:text-cyan-snap">→ live at realtime-board.app</p>
              </div>
            </div>
          </div>

          {/* big card 2 — mentor reviews */}
          <div
            data-reveal
            style={{ transitionDelay: '90ms' }}
            className="group relative overflow-hidden rounded-panel border border-ink/8 bg-white p-6 shadow-card transition-all duration-500 hover:-translate-y-1 hover:shadow-float md:col-span-3 dark:border-paper/10 dark:bg-ink-soft"
          >
            <div className="pointer-events-none absolute -left-14 -top-14 h-40 w-40 rounded-full bg-violet-deep/12 blur-3xl transition-opacity duration-500 opacity-0 group-hover:opacity-100" />
            <div className="flex items-start justify-between">
              <span className="grid h-11 w-11 place-items-center rounded-2xl bg-violet-ink/12 text-violet-ink dark:bg-violet-deep/15 dark:text-violet-deep">
                <GitPullRequest size={20} />
              </span>
              <MetricChip value="24h" label="PR feedback" className="bg-violet-ink/10 text-violet-ink dark:bg-violet-deep/10 dark:text-violet-deep" />
            </div>
            <h3 className="mt-5 font-display text-xl font-bold">Reviews that feel like a real team</h3>
            <p className="mt-2 text-sm leading-relaxed text-ink/60 dark:text-paper/55">
              Every sprint ships through an open-source style PR flow — mentors comment on your diff, approve the merge
              and hold the production bar. Weekly 1:1s keep you unblocked.
            </p>
            {/* PR thread mock */}
            <div className="mt-5 space-y-2 rounded-2xl border border-ink/10 bg-ink/[0.03] p-4 text-xs dark:border-white/10 dark:bg-white/[0.03]">
              <div className="flex items-center justify-between">
                <span className="font-mono text-ink/60 dark:text-paper/60">#142 · feat: presence diffing</span>
                <span className="text-mint-deep dark:text-mint">Approved ✓</span>
              </div>
              <div className="flex gap-2 text-ink/55 dark:text-paper/55">
                <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-gradient-to-br from-cyan-snap to-violet-deep text-[8px] font-black text-white">M</span>
                <span>“Nice — emit diffs, not snapshots. Ship it.” · 2h ago</span>
              </div>
            </div>
          </div>

          {/* small card — credentials */}
          <div
            data-reveal
            style={{ transitionDelay: '60ms' }}
            className="group relative overflow-hidden rounded-panel border border-ink/8 bg-white p-5 shadow-card transition-all duration-500 hover:-translate-y-1 hover:shadow-float md:col-span-2 dark:border-paper/10 dark:bg-ink-soft"
          >
            <div className="pointer-events-none absolute -right-10 -top-10 h-24 w-24 rounded-full bg-neon/10 blur-2xl" />
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-neon-deep/12 text-neon-deep dark:bg-neon/15 dark:text-neon">
              <BadgeCheck size={18} />
            </span>
            <h3 className="mt-4 font-display text-base font-bold">Credentials that check out</h3>
            <p className="mt-1.5 text-xs leading-relaxed text-ink/60 dark:text-paper/55">
              Certificate with a unique ID plus a letter of recommendation — both verifiable through our public
              certification page.
            </p>
            <span className="mt-3 inline-block rounded-bubble bg-ink/5 px-2.5 py-1 font-mono text-[10px] font-bold text-ink/50 dark:bg-paper/5 dark:text-paper/50">
              CDT-2026-XXXX · verifiable
            </span>
          </div>

          {/* small card — interview evidence */}
          <div
            data-reveal
            style={{ transitionDelay: '120ms' }}
            className="group relative overflow-hidden rounded-panel border border-ink/8 bg-white p-5 shadow-card transition-all duration-500 hover:-translate-y-1 hover:shadow-float md:col-span-2 dark:border-paper/10 dark:bg-ink-soft"
          >
            <div className="pointer-events-none absolute -right-10 -top-10 h-24 w-24 rounded-full bg-mint/10 blur-2xl" />
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-mint-deep/12 text-mint-deep dark:bg-mint/15 dark:text-mint">
              <Mic2 size={18} />
            </span>
            <h3 className="mt-4 font-display text-base font-bold">Interview evidence on file</h3>
            <p className="mt-1.5 text-xs leading-relaxed text-ink/60 dark:text-paper/55">
              AI-scored mock interviews save a shareable scorecard — communication, technical depth and clarity per
              attempt.
            </p>
            <span className="mt-3 inline-flex items-center gap-1 text-[11px] font-bold text-ink/50 dark:text-paper/50">
              <Sparkles size={11} className="text-neon-deep dark:text-neon" /> Scorecard shared with recruiters
            </span>
          </div>

          {/* small card — interview story */}
          <div
            data-reveal
            style={{ transitionDelay: '180ms' }}
            className="group relative overflow-hidden rounded-panel border border-ink/8 bg-white p-5 shadow-card transition-all duration-500 hover:-translate-y-1 hover:shadow-float md:col-span-2 dark:border-paper/10 dark:bg-ink-soft"
          >
            <div className="pointer-events-none absolute -right-10 -top-10 h-24 w-24 rounded-full bg-coral/10 blur-2xl" />
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-coral-deep/12 text-coral-deep dark:bg-coral/15 dark:text-coral">
              <BriefcaseBusiness size={18} />
            </span>
            <h3 className="mt-4 font-display text-base font-bold">Interview-ready story</h3>
            <p className="mt-1.5 text-xs leading-relaxed text-ink/60 dark:text-paper/55">
              AI mock interviews turn shipped work into answers — every feature you built becomes a story you can tell,
              with receipts.
            </p>
            <span className="mt-3 inline-block rounded-bubble bg-ink/5 px-2.5 py-1 text-[10px] font-bold text-ink/50 dark:bg-paper/5 dark:text-paper/50">
              Built it → explained it
            </span>
          </div>
        </div>
      </div>
    </section>
  )
}