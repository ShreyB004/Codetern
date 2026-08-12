import { BrainCircuit, CalendarCheck, KeyRound, Rocket, UserCheck, Video } from 'lucide-react'
import { cn } from '../../lib/utils.js'
import { useApp } from '../../context/AppContext.jsx'
import { DOMAIN_COLORS } from '../../data/programmes.js'

export const STEPS = [
  { key: 1, title: 'Profile & Resume', subtitle: 'Set your identity and pick a domain', icon: UserCheck },
  { key: 2, title: 'Screening Quiz', subtitle: 'Prove your baseline skills', icon: BrainCircuit },
  { key: 3, title: 'AI Mock Interview', subtitle: 'Simulated camera milestone', icon: Video },
  { key: 4, title: 'Booking & Seat', subtitle: 'Choose duration, lock your seat', icon: CalendarCheck },
  { key: 5, title: 'Live Workspace', subtitle: 'Tasks, reviews & certificate', icon: Rocket },
]

export function JourneyTracker({ active, onJump }) {
  const { candidate } = useApp()
  const completedSteps = candidate ? candidate.step : 1

  return (
    <div className="relative">
      {/* connecting line */}
      <div className="absolute left-0 right-0 top-7 hidden h-0.5 bg-ink/8 lg:block">
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
                'group relative flex flex-col items-center gap-2.5 rounded-2xl border bg-white px-3 pb-4 pt-6 text-center shadow-card transition-all duration-400',
                isActive && 'border-cyan-snap/50 ring-4 ring-cyan-snap/10',
                done && !isActive && 'border-mint/40 hover:-translate-y-0.5',
                locked && 'cursor-not-allowed opacity-55',
                !done && !locked && !isActive && 'border-ink/10 hover:-translate-y-0.5 hover:shadow-float',
              )}
            >
              {locked ? (
                <span className="grid h-14 w-14 place-items-center rounded-2xl bg-ink/5 text-ink/30">
                  <KeyRound size={22} />
                </span>
              ) : (
                <span
                  className={cn(
                    'relative grid h-14 w-14 place-items-center rounded-2xl transition-all duration-500',
                    done ? 'bg-mint/15 text-mint' : isActive ? 'bg-ink text-neon' : 'bg-cyan-snap/10 text-cyan-snap',
                  )}
                >
                  <Icon size={22} />
                  {done && (
                    <span className="absolute -right-1.5 -top-1.5 grid h-5 w-5 place-items-center rounded-full bg-mint text-xs font-black text-ink">✓</span>
                  )}
                </span>
              )}
              <span className="flex flex-col">
                <span className={cn('text-[10px] font-bold uppercase tracking-widest', done ? 'text-mint' : isActive ? 'text-cyan-snap' : 'text-ink/40')}>
                  Step {number}
                </span>
                <span className={cn('mt-0.5 text-sm font-bold leading-tight', locked ? 'text-ink/40' : 'text-ink')}>{s.title}</span>
                <span className="mt-0.5 hidden text-[11px] text-ink/40 lg:block">{s.subtitle}</span>
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}

export function StepShell({ step, onBack, children }) {
  const meta = STEPS.find((s) => s.key === step)
  const Icon = meta.icon
  return (
    <div data-enter className="rounded-panel border border-ink/8 bg-white p-6 shadow-card sm:p-8 lg:p-10">
      <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-start gap-4">
          <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-ink text-neon">
            <Icon size={22} />
          </span>
          <div>
            <p className="text-[11px] font-bold uppercase tracking-widest text-cyan-snap">Step {meta.key} / 5</p>
            <h2 className="font-display text-2xl font-bold text-ink">{meta.title}</h2>
            <p className="text-sm text-ink/50">{meta.subtitle}</p>
          </div>
        </div>
        {onBack && (
          <button onClick={onBack} className="rounded-full border border-ink/12 px-4 py-2 text-xs font-semibold text-ink/60 transition hover:bg-ink/5">
            ← Back
          </button>
        )}
      </div>
      {children}
    </div>
  )
}

export function DomainPicker({ value, onChange }) {
  const { programmes } = useApp()
  return (
    <div>
      <p className="mb-3 text-sm font-semibold text-ink">Choose your track domain</p>
      <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
        {programmes.map((p) => {
          const color = DOMAIN_COLORS[p.color]
          return (
            <button
              key={p.id}
              type="button"
              onClick={() => onChange(p.id)}
              className={cn(
                'flex items-center gap-3 rounded-2xl border px-4 py-3 text-left transition-all duration-300',
                value === p.id ? 'border-cyan-snap/60 bg-cyan-snap/8 ring-4 ring-cyan-snap/10' : 'border-ink/10 hover:border-ink/25',
              )}
            >
              <span
                className="grid h-9 w-9 shrink-0 place-items-center rounded-xl text-xs font-bold"
                style={{ background: color.bg, color: color.fg }}
              >
                {p.title[0]}
              </span>
              <span className="min-w-0">
                <span className={cn('block truncate text-sm font-semibold', value === p.id ? 'text-ink' : 'text-ink/75')}>
                  {p.title}
                </span>
                <span className="block text-[11px] text-ink/45">{p.sub}</span>
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}