import { useEffect, useState } from 'react'
import { ArrowRight, BadgeCheck, CalendarCheck, GraduationCap, Mail, Phone, ShieldCheck, Sparkles, User as UserIcon } from 'lucide-react'
import { useSearchParams } from 'react-router-dom'
import { StepShell, DomainPicker } from './JourneyTracker.jsx'
import { Button } from '../ui/Button.jsx'
import { SeatCounter } from '../ui/SeatCounter.jsx'
import { DomainIcon } from '../ui/Icon.jsx'
import { useApp } from '../../context/AppContext.jsx'
import { useSeats } from '../../context/SeatsContext.jsx'
import { useToast } from '../../context/ToastContext.jsx'
import { getProgramme, DOMAIN_COLORS } from '../../data/programmes.js'
import { cn } from '../../lib/utils.js'

const PERKS = ['Live seat counter', 'Free retake if needed', 'Refer & earn ₹50 cash']

export function BookingStep({ onComplete }) {
  const { candidate, saveBooking } = useApp()
  const { getRemaining, getTotal, bookSeat } = useSeats()
  const { push } = useToast()
  const [params] = useSearchParams()
  const preselect = params.get('d')

  const programme = candidate?.domain ? getProgramme(candidate.domain) : null
  const [domain, setDomain] = useState(programme?.id || preselect || '')
  const [duration, setDuration] = useState(null)
  const [form, setForm] = useState({
    name: candidate?.name || '',
    email: candidate?.email || '',
    phone: '',
    college: '',
    start: '',
  })
  const [confirmed, setConfirmed] = useState(candidate?.booking ? true : false)

  useEffect(() => {
    if (preselect && !programme) {
      setDuration(null)
    }
  }, [preselect, programme])

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))
  const detailsValid = form.name.trim() && form.email.trim() && form.phone.trim().length >= 7

  const choose = (d, remaining) => {
    if (remaining <= 0) return push('This batch just filled. Pick another duration.', 'error')
    setDuration(d)
  }

  const book = () => {
    if (!domain) return push('Choose your domain track first', 'error')
    if (!duration) return push('Pick a batch duration', 'error')
    if (!detailsValid) return push('Add your name, email and phone to lock the seat', 'error')
    const ok = bookSeat(domain, duration)
    if (!ok) return push('Seats sold out for that batch — try another duration.', 'error')
    const p = getProgramme(domain)
    saveBooking(domain, duration, { name: form.name.trim(), email: form.email.trim(), phone: form.phone.trim(), college: form.college.trim(), start: form.start })
    setConfirmed(true)
    push(`Seat locked — ${p?.title} · ${duration} month${duration > 1 ? 's' : ''}`, 'success')
  }

  if (confirmed) {
    const p = getProgramme(domain)
    const color = p ? DOMAIN_COLORS[p.color] : null
    return (
      <StepShell step={1}>
        <div className="flex flex-col items-center py-4 text-center">
          <span className="relative">
            <span className="grid h-24 w-24 place-items-center rounded-full bg-mint/15 text-mint">
              <BadgeCheck size={44} />
            </span>
            <span className="absolute -right-1 -top-1 grid h-8 w-8 place-items-center rounded-full bg-neon text-ink">
              <Sparkles size={15} />
            </span>
          </span>
          <h3 className="mt-6 font-display text-3xl font-bold text-ink dark:text-paper">Seat locked — let's build</h3>
          <p className="mt-2 max-w-md text-sm text-ink/55 dark:text-paper/55">
            Your seat in the <span className="font-bold text-ink dark:text-paper">{p?.title}</span> ·{' '}
            {candidate.booking?.duration || duration}-month batch is confirmed. Next: complete your profile & resume to unlock the live workspace.
          </p>

          <div className="mt-7 grid w-full max-w-lg gap-3 rounded-2xl border border-mint/30 bg-mint/8 p-5 text-left">
            {[
              ['Batch', `${candidate.booking?.duration || duration}-month · ${p?.title}`],
              ['Seat holder', form.name || candidate.name],
              ['Contact', form.email || candidate.email],
              ['Job starts', `${form.start || 'Immediate'}${form.college ? ` · ${form.college}` : ''}`],
            ].map(([k, v]) => (
              <div key={k} className="flex items-center justify-between gap-3 text-sm">
                <span className="text-ink/45 dark:text-paper/45">{k}</span>
                <span className="font-bold text-ink dark:text-paper">{v}</span>
              </div>
            ))}
          </div>

          <Button size="lg" variant="primary" className="mt-8" onClick={onComplete}>
            Continue to profile & resume <ArrowRight size={17} />
          </Button>
        </div>
      </StepShell>
    )
  }

  return (
    <StepShell step={1} onBack={() => {}}>
      {/* ── domain track ── */}
      <DomainPicker value={domain} onChange={(id) => { setDomain(id); setDuration(null) }} />

      {/* ── duration ── */}
      {domain && (
        <div className="mt-8" data-enter>
          <p className="mb-1 flex items-center gap-2 text-sm font-semibold text-ink dark:text-paper">
            <CalendarCheck size={15} className="text-cyan-snap" /> Pick your batch duration
          </p>
          <p className="mb-3 text-xs text-ink/45 dark:text-paper/45">Live availability syncs with the public landing page in real time.</p>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {getProgramme(domain).durations.map((d) => {
              const remaining = getRemaining(domain, d)
              const total = getTotal(domain, d)
              const soldOut = remaining <= 0
              const active = duration === d
              return (
                <button
                  key={d}
                  onClick={() => choose(d, remaining)}
                  disabled={soldOut}
                  className={cn(
                    'relative flex flex-col overflow-hidden rounded-2xl border p-5 text-left transition-all duration-300',
                    soldOut && 'cursor-not-allowed border-ink/8 opacity-50 dark:border-paper/10',
                    active && 'border-cyan-snap/60 bg-cyan-snap/8 ring-4 ring-cyan-snap/10',
                    !active && !soldOut && 'border-ink/10 bg-white hover:-translate-y-1 hover:border-cyan-snap/40 hover:shadow-float dark:border-paper/10 dark:bg-ink-soft',
                  )}
                >
                  {soldOut && (
                    <span className="absolute right-3 top-3 rounded-bubble bg-coral/10 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-coral">
                      Filled
                    </span>
                  )}
                  <p className="font-display text-3xl font-extrabold text-ink dark:text-paper">
                    {d}<span className="ml-1 text-sm font-bold text-ink/40 dark:text-paper/40">month{d > 1 ? 's' : ''}</span>
                  </p>
                  <div className="mt-4">
                    <SeatCounter remaining={remaining} total={total} duration={d} compact />
                  </div>
                  {!soldOut && (
                    <span className={cn('mt-auto pt-4 text-xs font-semibold', active ? 'text-cyan-snap' : 'text-ink/40 dark:text-paper/40')}>
                      {active ? '✓ Selected' : 'Select this batch'}
                    </span>
                  )}
                </button>
              )
            })}
          </div>
        </div>
      )}

      {/* ── application form ── */}
      {domain && duration && (
        <div className="mt-8 rounded-2xl border border-ink/10 bg-paper/60 p-5 sm:p-6 dark:border-paper/10 dark:bg-ink" data-enter>
          <p className="mb-4 flex items-center gap-2 text-sm font-semibold text-ink dark:text-paper">
            <UserIcon size={15} className="text-violet-deep" /> Applicant details
          </p>
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField icon={<UserIcon size={14} />} label="Full name" value={form.name} onChange={set('name')} placeholder="Aarav Mehta" />
            <FormField icon={<Mail size={14} />} type="email" label="Email" value={form.email} onChange={set('email')} placeholder="you@email.com" />
            <FormField icon={<Phone size={14} />} label="WhatsApp / phone" value={form.phone} onChange={set('phone')} placeholder="+91 98XXXXXXXX" />
            <FormField icon={<GraduationCap size={14} />} label="College / current stage" value={form.college} onChange={set('college')} placeholder="College, final year / fresher" optional />
            <label className="block sm:col-span-2">
              <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-ink/50 dark:text-paper/50">
                Availability <span className="font-normal normal-case text-ink/30 dark:text-paper/30">(optional)</span>
              </span>
              <select value={form.start} onChange={set('start')} className="cdt-input w-full rounded-xl px-4 py-3 text-sm outline-none focus:border-cyan-snap/60">
                <option value="">I can start immediately</option>
                {['Next month', 'In 2 months', 'After exams', 'Part-time alongside classes'].map((o) => (
                  <option key={o} value={o}>{o}</option>
                ))}
              </select>
            </label>
          </div>
        </div>
      )}

      {/* ── footer action ── */}
      <div className="mt-8 flex flex-col gap-3 border-t border-ink/8 pt-6 sm:flex-row sm:items-center sm:justify-between dark:border-paper/10">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5">
          {PERKS.map((t) => (
            <span key={t} className="flex items-center gap-1.5 text-xs font-medium text-ink/45 dark:text-paper/45">
              <ShieldCheck size={13} className="text-mint" /> {t}
            </span>
          ))}
        </div>
        <Button size="lg" variant={domain && duration && detailsValid ? 'neon' : 'primary'} onClick={book} disabled={!domain || !duration}>
          <CalendarCheck size={17} />
          {!domain ? 'Pick a track first' : !duration ? 'Pick a batch' : 'Lock my seat'}
        </Button>
      </div>

      {domain && (
        <div className="mt-6 flex items-center gap-3 rounded-2xl border border-cyan-snap/25 bg-cyan-snap/8 px-5 py-4">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl" style={(() => { const c = DOMAIN_COLORS[getProgramme(domain).color]; return { background: c.bg, color: c.fg } })()}>
            <DomainIcon name={getProgramme(domain).icon} size={18} />
          </span>
          <div>
            <p className="text-sm font-semibold text-ink dark:text-paper">
              Track: <span className="text-cyan-snap">{getProgramme(domain).title}</span>
            </p>
            <p className="mt-0.5 text-xs text-ink/50 dark:text-paper/50">You can refine your domain in the profile step — seat stays reserved for 48h.</p>
          </div>
        </div>
      )}
    </StepShell>
  )
}

function FormField({ icon, label, optional = false, ...props }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-ink/50 dark:text-paper/50">
        {label} {optional && <span className="font-normal normal-case text-ink/30 dark:text-paper/30">(optional)</span>}
      </span>
      <div className="relative">
        <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-ink/35 dark:text-paper/35">{icon}</span>
        <input
          {...props}
          className="cdt-input w-full rounded-xl py-3 pl-10 pr-4 text-sm outline-none focus:border-cyan-snap/60"
        />
      </div>
    </label>
  )
}