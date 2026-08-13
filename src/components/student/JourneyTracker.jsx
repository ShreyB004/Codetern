import { BrainCircuit, CalendarCheck, Check, KeyRound, Rocket, UserCheck, Video } from 'lucide-react'
import { cn } from '../../lib/utils.js'
import { useApp } from '../../context/AppContext.jsx'
import { DOMAIN_COLORS } from '../../data/programmes.js'
import { DomainIcon } from '../ui/Icon.jsx'

// Journey order 2026: book → profile/resume → live workspace → final assessment → final interview
export const STEPS = [
  { key: 1, title: 'Book your seat', subtitle: 'Pick a track, batch & apply', icon: CalendarCheck },
  { key: 2, title: 'Profile & Resume', subtitle: 'Your identity, resume & track', icon: UserCheck },
  { key: 3, title: 'Live Workspace', subtitle: 'Ship real tasks, earn a certificate', icon: Rocket },
  { key: 4, title: 'Final Assessment', subtitle: 'Timed baseline screening', icon: BrainCircuit },
  { key: 5, title: 'Final Interview', subtitle: 'AI-scored mock interview', icon: Video },
]

export function JourneyTracker({ active, onJump }) {
  const { candidate } = useApp()
  const completedSteps = candidate?.step || 1

  return (
    <div className="relative">
      {/* connecting line */}
      <div className="absolute left-0 right-0 top-7 hidden h-0.5 bg-ink/8 lg:block dark:bg-paper/10">
        <div
          className="h-full origin-left transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]"
          style={{ width: `${((Math.max(completedSteps, active || 1) - 1) / 4) * 100}%`, background: 'linear-gradient(90deg,#22d3ee,#b4ff39)' }}
        />
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-5 lg:gap-4">
        {STEPS.map((s, i) => {
          const Icon = s.icon
          const number = i + 1
          const done = completedSteps > number || (candidate?.cert && number <= completedSteps)
          const isActive = active === number
          const locked = number > completedSteps && !isActive

          return (
            <button
              key={s.key}
              onClick={() => onJump?.(s.key)}
              disabled={locked && !isActive}
              className={cn(
                'group relative flex flex-col items-center gap-2.5 rounded-2xl border bg-white px-3 pb-4 pt-6 text-center shadow-card transition-all duration-400 dark:bg-ink-soft dark:shadow-none',
                isActive && 'border-cyan-snap/50 ring-4 ring-cyan-snap/10',
                done && !isActive && 'border-mint/40 hover:-translate-y-0.5',
                locked && 'cursor-not-allowed opacity-55',
                !done && !locked && !isActive && 'border-ink/10 hover:-translate-y-0.5 hover:shadow-float dark:border-paper/10',
              )}
            >
              {locked ? (
                <span className="grid h-14 w-14 place-items-center rounded-2xl bg-ink/5 text-ink/30 dark:bg-paper/5 dark:text-paper/25">
                  <KeyRound size={22} />
                </span>
              ) : (
                <span
                  className={cn(
                    'relative grid h-14 w-14 place-items-center rounded-2xl transition-all duration-500',
                    done ? 'bg-mint/15 text-mint' : isActive ? 'bg-ink text-neon dark:bg-paper dark:text-ink' : 'bg-cyan-snap/10 text-cyan-snap',
                  )}
                >
                  <Icon size={22} />
                  {done && (
                    <span className="absolute -right-1.5 -top-1.5 grid h-5 w-5 place-items-center rounded-full bg-mint text-xs font-black text-ink">✓</span>
                  )}
                </span>
              )}
              <span className="flex flex-col">
                <span className={cn('text-[10px] font-bold uppercase tracking-widest', done ? 'text-mint' : isActive ? 'text-cyan-snap' : 'text-ink/40 dark:text-paper/40')}>
                  Step {number}
                </span>
                <span className={cn('mt-0.5 text-sm font-bold leading-tight', locked ? 'text-ink/40 dark:text-paper/40' : 'text-ink dark:text-paper')}>{s.title}</span>
                <span className="mt-0.5 hidden text-[11px] text-ink/40 lg:block dark:text-paper/40">{s.subtitle}</span>
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}

// Vertical stepper — used as the dashboard's journey rail.
export function JourneyRail({ active, onJump, className }) {
  const { candidate } = useApp()
  const completedSteps = candidate?.step || 1

  return (
    <div className={cn('flex flex-col gap-2', className)}>
      {STEPS.map((s, i) => {
        const Icon = s.icon
        const number = i + 1
        const done = completedSteps > number || (candidate?.cert && number <= completedSteps)
        const isActive = active === number
        const locked = number > completedSteps && !isActive

        return (
          <button
            key={s.key}
            onClick={() => onJump?.(s.key)}
            disabled={locked && !isActive}
            className={cn(
              'group relative flex items-center gap-3.5 rounded-2xl border px-4 py-3.5 text-left transition-all duration-300',
              isActive
                ? 'border-cyan-snap/50 bg-cyan-snap/8 ring-4 ring-cyan-snap/10'
                : done
                  ? 'border-mint/30 bg-mint/5 hover:-translate-y-0.5'
                  : locked
                    ? 'cursor-not-allowed border-ink/8 opacity-55 dark:border-paper/10'
                    : 'border-ink/10 hover:-translate-y-0.5 hover:border-cyan-snap/30 dark:border-paper/10',
              !done && !locked && !isActive && 'bg-white dark:bg-ink-soft',
              (isActive || (done && !isActive)) && 'bg-white dark:bg-ink-soft',
            )}
          >
            <span
              className={cn(
                'grid h-10 w-10 shrink-0 place-items-center rounded-xl transition-all duration-300',
                done ? 'bg-mint text-ink' : isActive ? 'bg-ink text-neon dark:bg-paper dark:text-ink' : 'bg-ink/5 text-ink/35 dark:bg-paper/5 dark:text-paper/30',
              )}
            >
              {locked ? <KeyRound size={17} /> : done ? <Check size={17} strokeWidth={3} /> : <Icon size={17} />}
            </span>
            <span className="min-w-0">
              <span className={cn('block text-[10px] font-bold uppercase tracking-widest', isActive ? 'text-cyan-snap' : done ? 'text-mint' : 'text-ink/40 dark:text-paper/40')}>
                Step {number}
              </span>
              <span className={cn('block truncate text-sm font-bold', isActive || done ? 'text-ink dark:text-paper' : 'text-ink/60 dark:text-paper/60')}>
                {s.title}
              </span>
            </span>
          </button>
        )
      })}
    </div>
  )
}

export function StepShell({ step, onBack, children }) {
  const meta = STEPS.find((s) => s.key === step)
  const Icon = meta.icon
  return (
    <div data-enter className="rounded-panel border border-ink/8 bg-white p-6 shadow-card dark:border-paper/10 dark:bg-ink-soft dark:shadow-none sm:p-8 lg:p-10">
      <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-start gap-4">
          <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-ink text-neon dark:bg-paper dark:text-ink">
            <Icon size={22} />
          </span>
          <div>
            <p className="text-[11px] font-bold uppercase tracking-widest text-cyan-snap">Step {meta.key} / 5</p>
            <h2 className="font-display text-2xl font-bold text-ink dark:text-paper">{meta.title}</h2>
            <p className="text-sm text-ink/50 dark:text-paper/50">{meta.subtitle}</p>
          </div>
        </div>
        {onBack && (
          <button onClick={onBack} className="rounded-full border border-ink/12 px-4 py-2 text-xs font-semibold text-ink/60 transition hover:bg-ink/5 dark:border-paper/15 dark:text-paper/60 dark:hover:bg-paper/5">
            ← Back
          </button>
        )}
      </div>
      {children}
    </div>
  )
}

export function DomainPicker({ value, onChange, compact = false }) {
  const { programmes } = useApp()
  return (
    <div>
      <p className="mb-3 text-sm font-semibold text-ink dark:text-paper">Choose your track domain</p>
      <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
        {programmes.map((p) => {
          const color = DOMAIN_COLORS[p.color]
          const selected = value === p.id
          return (
            <button
              key={p.id}
              type="button"
              onClick={() => onChange(p.id)}
              className={cn(
                'group relative flex items-center gap-3 overflow-hidden rounded-2xl border px-4 py-3.5 text-left transition-all duration-300',
                selected
                  ? 'border-cyan-snap/60 bg-cyan-snap/8 ring-4 ring-cyan-snap/10'
                  : 'border-ink/10 hover:-translate-y-0.5 hover:border-ink/25 dark:border-paper/10 dark:hover:border-paper/30',
              )}
            >
              <span
                className="grid h-10 w-10 shrink-0 place-items-center rounded-xl transition-transform duration-300 group-hover:scale-110"
                style={{ background: color.bg, color: color.fg }}
              >
                <DomainIcon name={p.icon} size={18} />
              </span>
              <span className="min-w-0">
                <span className={cn('block truncate text-sm font-semibold', selected ? 'text-ink dark:text-paper' : 'text-ink/75 dark:text-paper/75')}>
                  {p.title}
                </span>
                <span className="block text-[11px] text-ink/45 dark:text-paper/45">{p.sub}</span>
              </span>
              {selected && (
                <span className="absolute right-3 top-3 grid h-5 w-5 place-items-center rounded-full bg-cyan-snap text-[10px] font-black text-ink">
                  <Check size={12} strokeWidth={3.5} />
                </span>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}