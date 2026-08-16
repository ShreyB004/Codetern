import { Boxes, CheckCircle2, GitBranch, GitMerge, GitPullRequest, Trophy } from 'lucide-react'
import { useRevealScope } from '../../hooks/useReveal.js'
import { useTheme } from '../../context/ThemeContext.jsx'
import { useParallax } from '../../hooks/useParallax.js'
import { FloatingCard } from '../ui/FloatingCard.jsx'
import { BeamsBackground } from '../ui/backgrounds/BeamsBackground.jsx'
import { ScrollReveal } from '../ui/effects/ScrollReveal.jsx'

const CHECKPOINTS = [
  { icon: CheckCircle2, text: 'Sprint grader reviews code, not attendance' },
  { icon: GitPullRequest, text: 'Open-source style PR flow with mentors' },
  { icon: Trophy, text: 'Production bar: CI, deploy, observability' },
  { icon: Boxes, text: 'Ship to production — verifiable, shareable work' },
]

const CODE = [
  { line: '// spaces/web/src/lib/presence.ts', color: 'text-white/35 italic' },
  { line: 'export async function syncPresence(spaceId: string) {', color: 'text-violet-deep' },
  { line: '  const room = io.connect(`/spaces/${spaceId}`);', color: 'text-paper/80' },
  { line: '', color: '' },
  { line: '  room.on("cursor:move", ({ userId, point }) => {', color: 'text-mint' },
  { line: '    cursors.set(userId, point);', color: 'text-cyan-snap' },
  { line: '    board.render(point);', color: 'text-cyan-snap' },
  { line: '  });', color: 'text-mint' },
  { line: '', color: '' },
  { line: '  return room; // reviewer-approved', color: 'text-paper/80', caret: true },
  { line: '  presence.flush(evicted);', color: 'text-white/25 italic', hint: '⇥' },
]

export function RealWorkSection() {
  const scope = useRevealScope()
  const { isDark } = useTheme()
  const parallax = useParallax(0.06)

  return (
    <section ref={scope} className="cdt-lively relative overflow-hidden bg-paper text-ink dark:bg-ink dark:text-paper">
      {/* curved graphic band */}
      <svg className="absolute inset-x-0 top-0 w-full" viewBox="0 0 1440 120" preserveAspectRatio="none" aria-hidden>
        <path className="fill-paper dark:fill-ink" d="M0,80 C320,20 720,120 1440,40 L1440,0 L0,0 Z" />
      </svg>
      <BeamsBackground className="opacity-40" />

      <div className="relative mx-auto grid max-w-7xl items-center gap-14 px-5 pb-28 pt-6 lg:grid-cols-2 lg:px-8">
        {/* decorative curve highlight */}
        <div ref={parallax} className="pointer-events-none absolute right-[8%] top-24 hidden select-none lg:block" aria-hidden>
          <svg width="420" height="300" viewBox="0 0 420 300" fill="none" className="opacity-30">
            <path
              d="M10,250 C120,60 260,30 410,90"
              stroke="url(#grad)"
              strokeWidth="3"
              strokeDasharray="10 14"
              strokeLinecap="round"
            />
            <path d="M370,70 L422,86 L392,122 Z" fill="var(--color-cyan-snap)" />
            <defs>
              <linearGradient id="grad" x1="0" y1="250" x2="410" y2="90">
                <stop stopColor="var(--color-cyan-snap)" />
                <stop offset="1" stopColor="var(--color-neon)" />
              </linearGradient>
            </defs>
          </svg>
        </div>

        {/* copy */}
        <div>
          <div data-reveal>
            <span className="mb-4 inline-flex items-center gap-2 rounded-bubble border border-neon-deep/40 bg-neon-deep/10 px-3.5 py-1.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-neon-deep dark:border-neon/40 dark:bg-neon/10 dark:text-neon">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-neon-deep dark:bg-neon" />
              How we make you job-ready
            </span>
            <ScrollReveal
              as="h2"
              className="font-display text-3xl font-bold leading-tight tracking-tight sm:text-5xl"
              colors={isDark ? ['transparent', 'transparent', 'transparent', 'transparent', '#22d3ee', '#38ffb0', '#7c5cff', '#b4ff39'] : ['transparent', 'transparent', 'transparent', 'transparent', '#0e7490', '#047857', '#5b21b6', '#4d7c0f']}
            >
              No tutorials. No to-do lists. Real production work.
            </ScrollReveal>
            <p className="mt-5 max-w-lg text-base leading-relaxed text-ink/60 dark:text-paper/60">
              Every Codetern internship runs on production-shaped problems — auth, payments, realtime, scale and
              observability, the same specs your first employer will hand you. Mentors review your work like a senior
              engineer would, sprint by sprint, until it genuinely ships. And as AI raises the bar on judgment, we
              train you to direct the tools, debug what they produce, and own what goes to production.
            </p>
          </div>

          <ul className="mt-8 space-y-3.5" data-reveal>
            {CHECKPOINTS.map(({ icon: Icon, text }) => (
              <li key={text} className="flex items-center gap-3 text-sm text-ink/70 dark:text-paper/70">
                <span className="grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-cyan-deep/12 text-cyan-deep dark:bg-cyan-snap/12 dark:text-cyan-snap">
                  <Icon size={15} />
                </span>
                {text}
              </li>
            ))}
          </ul>
        </div>

        {/* floating IDE mock */}
        <div className="relative" data-reveal>
          <FloatingCard className="left-[-4%] -top-6 z-10" amplitude={12} duration={4}>
            <div className="flex items-center gap-2 rounded-2xl border border-white/12 bg-ink-soft px-3.5 py-2.5 shadow-float">
              <span className="h-2 w-2 rounded-full bg-coral" />
              <span className="text-[10px] font-medium text-white/55">feature/realtime-presence.tsx</span>
              <span className="ml-1 rounded-bubble border border-mint/30 bg-mint/10 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-mint">
                PR #214
              </span>
            </div>
          </FloatingCard>

          <div className="relative overflow-hidden rounded-panel border border-white/10 bg-ink-soft shadow-float">
            {/* window chrome */}
            <div className="flex items-center gap-3 border-b border-white/8 bg-white/[0.03] px-4 py-3">
              <div className="flex gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-coral" />
                <span className="h-2.5 w-2.5 rounded-full bg-neon" />
                <span className="h-2.5 w-2.5 rounded-full bg-mint" />
              </div>
              <div className="flex min-w-0 items-center overflow-hidden">
                <span className="flex items-center gap-1.5 rounded-lg bg-white/8 px-3 py-1 font-mono text-[10px] font-semibold text-white/70">
                  <span className="h-1.5 w-1.5 rounded-full bg-mint" /> presence.ts
                </span>
                <span className="px-3 py-1 font-mono text-[10px] text-white/35">board.tsx</span>
              </div>
              <span className="ml-auto hidden rounded-lg bg-ink/40 px-2.5 py-1 font-mono text-[10px] text-white/40 sm:block">
                ⌘S
              </span>
            </div>

            {/* editor */}
            <div className="px-5 py-4 font-mono text-[13px] leading-[1.75]">
              {CODE.map(({ line, color, caret, hint }, i) => (
                <p key={i} className="flex gap-4">
                  <span className="w-5 shrink-0 select-none text-right text-[11px] text-white/20">{i + 1}</span>
                  {line ? (
                    <span className={color || ''}>
                      {line}
                      {caret && <span className="ml-0.5 inline-block h-3.5 w-[7px] translate-y-0.5 animate-pulse bg-white/70" />}
                      {hint && (
                        <span className="ml-2 rounded border border-white/20 bg-white/[0.06] px-1.5 py-0.5 align-middle text-[10px] text-white/50">
                          {hint} Tab
                        </span>
                      )}
                    </span>
                  ) : (
                    <span className="select-none">{'\u00A0'}</span>
                  )}
                </p>
              ))}
            </div>

            {/* diff footer */}
            <div className="flex items-center justify-between border-y border-white/8 bg-white/[0.03] px-5 py-3 text-[11px]">
              <span className="flex items-center gap-2.5 font-mono text-white/45">
                <span className="font-bold text-mint">+128</span>
                <span className="font-bold text-coral">−18</span>
                <span className="text-white/35">· 3 files changed</span>
              </span>
              <span className="flex items-center gap-2.5">
                <span className="flex items-center gap-1 font-semibold text-mint">
                  <CheckCircle2 size={11} /> CI passed
                </span>
                <span
                  className="grid h-5 w-5 place-items-center rounded-full bg-white/10 text-[9px] font-bold text-white/70"
                  title="reviewed by A.K. — LGTM"
                >
                  AK
                </span>
              </span>
            </div>

            {/* status bar */}
            <div className="flex items-center gap-4 bg-white/[0.03] px-5 py-2.5 font-mono text-[10px] text-white/40">
              <span className="flex items-center gap-1.5">
                <GitBranch size={11} /> feature/realtime-presence *
              </span>
              <span className="hidden items-center gap-1 sm:flex">ESLint ✓</span>
              <span className="hidden sm:inline">build 1m</span>
              <span className="ml-auto">TypeScript · React</span>
            </div>
          </div>

          <FloatingCard className="bottom-[-8%] right-[4%]" amplitude={16} duration={5} delay={0.7}>
            <div className="flex items-center gap-3 rounded-2xl border border-neon/30 bg-ink-soft px-4 py-3 shadow-float">
              <span className="grid h-9 w-9 place-items-center rounded-xl bg-neon text-ink">
                <GitMerge size={16} />
              </span>
              <div>
                <p className="text-xs font-bold text-white">merge approved</p>
                <p className="text-[10px] text-white/55">LGTM — linked on your resume</p>
              </div>
            </div>
          </FloatingCard>
        </div>
      </div>

      {/* curved graphic bottom */}
      <svg className="absolute inset-x-0 bottom-0 w-full rotate-180" viewBox="0 0 1440 90" preserveAspectRatio="none" aria-hidden>
        <path className="fill-paper dark:fill-ink" d="M0,70 C360,10 720,80 1440,30 L1440,0 L0,0 Z" />
      </svg>
    </section>
  )
}