import { useState } from 'react'
import { AlertCircle, BadgeCheck, CalendarCheck, Check } from 'lucide-react'
import { StepShell, STEPS } from './JourneyTracker.jsx'
import { Button } from '../ui/Button.jsx'
import { SeatCounter } from '../ui/SeatCounter.jsx'
import { useApp } from '../../context/AppContext.jsx'
import { useSeats } from '../../context/SeatsContext.jsx'
import { useToast } from '../../context/ToastContext.jsx'
import { getProgramme } from '../../data/programmes.js'
import { cn } from '../../lib/utils.js'

export function BookingStep({ onComplete }) {
  const { candidate, saveBooking } = useApp()
  const { getRemaining, getTotal, bookSeat } = useSeats()
  const { push } = useToast()

  const programme = candidate?.domain ? getProgramme(candidate.domain) : null
  const [duration, setDuration] = useState(null)
  const [confirmed, setConfirmed] = useState(candidate?.booking ? true : false)

  const choose = (d, remaining) => {
    if (remaining <= 0) return push('This batch just filled. Pick another duration.', 'error')
    setDuration(d)
  }

  const book = () => {
    if (!duration) return
    const ok = bookSeat(candidate.domain, duration)
    if (!ok) return push('Seats sold out for that batch — try another duration.', 'error')
    saveBooking(duration)
    setConfirmed(true)
    push(`Seat locked — ${programme.title} · ${duration} month${duration > 1 ? 's' : ''}`, 'success')
  }

  if (!programme && !confirmed) {
    return (
      <StepShell step={4}>
        <p className="rounded-2xl border border-coral/30 bg-coral/8 px-4 py-3 text-sm text-coral">
          Choose a domain in Step 1 before booking.
        </p>
      </StepShell>
    )
  }

  if (confirmed) {
    return (
      <StepShell step={4}>
        <div className="flex flex-col items-center py-4 text-center">
          <span className="grid h-20 w-20 place-items-center rounded-full bg-mint/15 text-mint">
            <BadgeCheck size={38} />
          </span>
          <h3 className="mt-5 font-display text-3xl font-bold text-ink">Seat booked — let’s build</h3>
          <p className="mt-2 max-w-md text-sm text-ink/55">
            {candidate.booking
              ? `${programme.title} · ${candidate.booking.duration} month${candidate.booking.duration > 1 ? 's' : ''}`
              : 'Your workspace is ready.'}{' '}
            Progress to Step 5 for tasks, resources and your certificate claim.
          </p>
          <Button size="lg" variant="primary" className="mt-7" onClick={onComplete}>
            Enter the workspace →
          </Button>
        </div>
      </StepShell>
    )
  }

  return (
    <StepShell step={4}>
      <div className="mb-6 rounded-2xl border border-cyan-snap/25 bg-cyan-snap/8 px-5 py-4">
        <p className="text-sm font-semibold text-ink">
          Track: <span className="text-cyan-snap">{programme.title}</span>
        </p>
        <p className="mt-0.5 text-xs text-ink/50">Live availability is synced to the public landing page in real time.</p>
      </div>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {programme.durations.map((d) => {
          const remaining = getRemaining(candidate.domain, d)
          const total = getTotal(candidate.domain, d)
          const soldOut = remaining <= 0
          const active = duration === d
          return (
            <button
              key={d}
              onClick={() => choose(d, remaining)}
              disabled={soldOut}
              className={cn(
                'relative flex flex-col rounded-2xl border p-5 text-left transition-all duration-300',
                soldOut && 'cursor-not-allowed border-ink/8 opacity-50',
                active && 'border-cyan-snap/60 bg-cyan-snap/8 ring-4 ring-cyan-snap/10',
                !active && !soldOut && 'border-ink/10 hover:-translate-y-0.5 hover:border-cyan-snap/40',
              )}
            >
              {soldOut && (
                <span className="absolute right-3 top-3 rounded-bubble bg-coral/10 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-coral">
                  Filled
                </span>
              )}
              <p className="font-display text-3xl font-extrabold text-ink">
                {d}<span className="ml-1 text-sm font-bold text-ink/40">month{d > 1 ? 's' : ''}</span>
              </p>
              <div className="mt-4">
                <SeatCounter remaining={remaining} total={total} duration={d} compact />
              </div>
              {!soldOut && (
                <span className="mt-auto pt-4 text-xs font-semibold text-cyan-snap">
                  {active ? '✓ Selected' : 'Select this batch'}
                </span>
              )}
            </button>
          )
        })}
      </div>

      <div className="mt-8 flex flex-col gap-3 border-t border-ink/8 pt-6 sm:flex-row sm:items-center sm:justify-between">
        <p className="flex items-center gap-2 text-xs text-ink/45">
          <AlertCircle size={14} className="text-coral" />
          Seats are first-come. Booking decrements the live counter on the home page.
        </p>
        <Button size="lg" variant="neon" onClick={book} disabled={!duration}>
          <CalendarCheck size={17} />
          Lock my seat
        </Button>
      </div>
    </StepShell>
  )
}