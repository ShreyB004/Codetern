import { Boxes, CheckCircle2, GitPullRequest, Trophy } from 'lucide-react'
import { useRevealScope } from '../../hooks/useReveal.js'
import { useParallax } from '../../hooks/useParallax.js'
import { FloatingCard } from '../ui/FloatingCard.jsx'
import { Pill } from '../ui/Pill.jsx'
import { BeamsBackground } from '../ui/backgrounds/BeamsBackground.jsx'

const CHECKPOINTS = [
  { icon: CheckCircle2, text: 'Sprint grader reviews code, not attendance' },
  { icon: GitPullRequest, text: 'Open-source style PR flow with mentors' },
  { icon: Trophy, text: 'Merit badges unlock final certification' },
  { icon: Boxes, text: 'Ship to production — verifiable, shareable work' },
]

export function RealWorkSection() {
  const scope = useRevealScope()
  const parallax = useParallax(0.06)

  return (
    <section ref={scope} className="relative overflow-hidden bg-ink text-white">
      {/* curved graphic band */}
      <svg className="absolute inset-x-0 top-0 w-full" viewBox="0 0 1440 120" preserveAspectRatio="none" aria-hidden>
        <path className="fill-ink" d="M0,80 C320,20 720,120 1440,40 L1440,0 L0,0 Z" />
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
            <span className="mb-4 inline-flex items-center gap-2 rounded-bubble border border-neon/40 bg-neon/10 px-3.5 py-1.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-neon">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-neon" />
              Not a classroom — a real work setup
            </span>
            <h2 className="font-display text-3xl font-bold leading-tight tracking-tight sm:text-5xl">
              You won’t watch lectures. <span className="text-gradient-snap">You will ship stuff.</span>
            </h2>
            <p className="mt-5 max-w-lg text-base leading-relaxed text-white/60">
              Every Codetern track is a simulated production environment: sprint deliverables, code reviews, live
              incident calls and honest grading on the work you produce — not on seat time.
            </p>
          </div>

          <ul className="mt-8 space-y-3.5" data-reveal>
            {CHECKPOINTS.map(({ icon: Icon, text }) => (
              <li key={text} className="flex items-center gap-3 text-sm text-white/70">
                <span className="grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-cyan-snap/12 text-cyan-snap">
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
            <div className="rounded-2xl border border-white/12 bg-ink-soft px-3.5 py-2.5 shadow-float">
              <div className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-coral" />
                <span className="h-2.5 w-2.5 rounded-full bg-neon" />
                <span className="h-2.5 w-2.5 rounded-full bg-mint" />
                <span className="ml-3 text-[10px] font-medium text-white/55">feature/realtime-presence.tsx</span>
              </div>
            </div>
          </FloatingCard>

          <div className="relative rounded-panel border border-white/10 bg-ink-soft p-6 shadow-float lg:p-8">
            <div className="mb-4 flex items-center justify-between">
              <Pill tone="mint" dot>Sprint 3 · In review</Pill>
              <span className="text-xs text-white/55">merged 4.6k lines</span>
            </div>
            <div className="space-y-2 font-mono text-[13px] leading-relaxed">
              {[
                ['const room = io.room(task.spaceId)', 'text-cyan-snap'],
                ['socket.on("cursor:move", ({ id, point }) => {', 'text-mint'],
                ['  presence.set(id, point);', 'text-violet-deep'],
                ['  board.updateCursor(id, point);', 'text-violet-deep'],
                ['', ''],
                ['badge.claim("code-review-passed")', 'text-neon'],
              ].map(([line, color], i) => (
                <p key={i} className={line ? `font-semibold ${color}` : ''}>
                  {line || <span className="select-none">{'\u00A0'}</span>}
                </p>
              ))}
            </div>
            <div className="mt-6 h-2 w-full rounded-full bg-white/8">
              <div className="h-full w-3/4 rounded-full bg-gradient-to-r from-cyan-snap to-neon" />
            </div>
            <div className="mt-3 flex justify-between text-[11px] text-white/55">
              <span>task progress</span>
              <span>12 of 16 tasks · 3 badges</span>
            </div>
          </div>

          <FloatingCard className="bottom-[-8%] right-[4%]" amplitude={16} duration={5} delay={0.7}>
            <div className="flex items-center gap-3 rounded-2xl border border-neon/30 bg-ink-soft px-4 py-3 shadow-float">
              <span className="grid h-9 w-9 place-items-center rounded-xl bg-neon text-ink">
                <Trophy size={16} />
              </span>
              <div>
                <p className="text-xs font-bold text-white">verifiable work</p>
                <p className="text-[10px] text-white/55">linked on your resume</p>
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