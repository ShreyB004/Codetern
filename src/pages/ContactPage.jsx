import { useRef, useState } from 'react'
import { ArrowRight, CheckCircle2, ChevronDown, Clock, Mail, MapPin, MessageCircle, Phone } from 'lucide-react'
import { Page } from '../components/layout/Page.jsx'
import { useRevealScope } from '../hooks/useReveal.js'
import { useToast } from '../context/ToastContext.jsx'
import { Button } from '../components/ui/Button.jsx'
import { cn } from '../lib/utils.js'

const FIELDS = [
  { key: 'name', label: 'Full name', placeholder: 'Aarav Mehta', type: 'text' },
  { key: 'email', label: 'Work email', placeholder: 'you@company.com', type: 'email' },
  { key: 'subject', label: 'Topic', placeholder: 'Partnership / Mentorship / Programme', type: 'text' },
]

const CHANNELS = [
  { icon: Mail, title: 'Email us', value: 'hello@codetern.dev', hint: 'Replies within 24h', tone: 'text-cyan-snap bg-cyan-snap/10' },
  { icon: MessageCircle, title: 'Mentor office hours', value: 'Mon–Fri · 6–9 PM IST', hint: 'Live 1:1 calls', tone: 'text-mint bg-mint/10' },
  { icon: Phone, title: 'Calls', value: 'Book via dashboard', hint: 'Seat-holders only', tone: 'text-violet-deep bg-violet-deep/10' },
  { icon: MapPin, title: 'Bangalore HQ', value: 'Innovation Campus, Koramangala', hint: 'Visits by invite', tone: 'text-coral bg-coral/10' },
]

const FAQS = [
  {
    q: 'Is the internship certificate actually verifiable?',
    a: 'Yes. Every certificate carries a unique ID (CDT-2026-XXXX) that employers can check instantly on our public Certification page.',
  },
  {
    q: 'What does the ₹50 referral reward apply to?',
    a: 'When a friend signs up through your link and locks their seat, ₹50 lands in your wallet — usable toward your internship fee or withdrawn at programme end.',
  },
  {
    q: 'Can I switch my domain track after booking?',
    a: 'Yes — you can refine your domain in the profile step after booking. Your seat stays reserved for 48 hours while you decide.',
  },
  {
    q: 'How do the final assessment and interview work?',
    a: 'The assessment is a timed, domain-specific question bank curated by our admin team. Passing unlocks an AI-scored mock interview with a saved scorecard.',
  },
]

function FloatInput({ label, placeholder, value, onChange, type = 'text', textarea = false }) {
  const ref = useRef(null)
  const labelRef = useRef(null)

  const focusIn = () => {
    ref.current?.classList.add('border-cyan-snap/60', 'ring-4', 'ring-cyan-snap/10')
    labelRef.current?.classList.add('!text-cyan-snap')
  }
  const focusOut = () => {
    ref.current?.classList.remove('border-cyan-snap/60', 'ring-4', 'ring-cyan-snap/10')
    if (!value) labelRef.current?.classList.remove('!text-cyan-snap')
  }

  return (
    <label className="relative block">
      <span
        ref={labelRef}
        className={cn(
          'pointer-events-none absolute left-4 text-sm text-ink/40 transition-all duration-300 dark:text-paper/40',
          value ? '-top-2.5 bg-paper px-2 text-xs font-semibold text-ink/60 dark:bg-ink-soft dark:text-paper/60' : 'top-3.5',
        )}
      >
        {label}
      </span>
      {textarea ? (
        <textarea
          ref={ref}
          value={value}
          onChange={onChange}
          onFocus={focusIn}
          onBlur={focusOut}
          rows={5}
          placeholder={placeholder}
          className="w-full resize-none rounded-2xl border border-ink/12 bg-white px-4 pb-3 pt-6 text-sm text-ink outline-none transition placeholder:text-ink/25 focus:outline-none dark:border-paper/15 dark:bg-ink-soft dark:text-paper dark:placeholder:text-paper/25"
        />
      ) : (
        <input
          ref={ref}
          type={type}
          value={value}
          onChange={onChange}
          onFocus={focusIn}
          onBlur={focusOut}
          placeholder={placeholder}
          className="w-full rounded-2xl border border-ink/12 bg-white px-4 pb-3 pt-6 text-sm text-ink outline-none transition placeholder:text-ink/25 focus:outline-none dark:border-paper/15 dark:bg-ink-soft dark:text-paper dark:placeholder:text-paper/25"
        />
      )}
    </label>
  )
}

export default function ContactPage() {
  const scope = useRevealScope()
  const { push } = useToast()
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' })
  const [sent, setSent] = useState(false)
  const [faq, setFaq] = useState(0)

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))

  const submit = (e) => {
    e.preventDefault()
    setSent(true)
    push('Message sent — a mentor will reply within 24 hours', 'success')
  }

  return (
    <Page className="overflow-hidden">
      {/* ── hero ── */}
      <section className="relative overflow-hidden bg-ink py-20 text-white">
        <div className="grid-lines absolute inset-0 opacity-20" />
        <div className="pointer-events-none absolute -left-20 top-[-30%] h-80 w-80 rounded-full bg-cyan-snap/20 blur-[110px]" />
        <div className="pointer-events-none absolute bottom-[-30%] right-[-10%] h-80 w-80 rounded-full bg-violet-deep/25 blur-[110px]" />
        <div className="relative mx-auto max-w-4xl px-5 text-center lg:px-8">
          <span data-enter className="mb-5 inline-block rounded-bubble border border-neon/40 bg-neon/10 px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-neon">
            Contact
          </span>
          <h1 data-enter className="font-display text-4xl font-extrabold leading-tight tracking-tight sm:text-6xl">
            Talk to a <span className="text-gradient-snap">mentor.</span>
          </h1>
          <p data-enter className="mx-auto mt-5 max-w-2xl text-base text-white/60">
            Questions about a track, partnerships with your company, or your application — we answer within a day.
          </p>
        </div>
      </section>

      {/* ── channels + form ── */}
      <section ref={scope} className="bg-paper py-20 dark:bg-ink">
        <div className="mx-auto grid max-w-6xl gap-10 px-5 lg:grid-cols-[1fr_1.1fr] lg:px-8">
          <div className="flex flex-col gap-5" data-reveal>
            {CHANNELS.map(({ icon: Icon, title, value, hint, tone }) => (
              <div key={title} className="group flex items-start gap-4 rounded-panel border border-ink/8 bg-white p-5 shadow-card transition-all duration-300 hover:-translate-y-0.5 hover:shadow-float dark:border-paper/10 dark:bg-ink-soft dark:shadow-none">
                <span className={cn('grid h-11 w-11 shrink-0 place-items-center rounded-2xl transition-transform duration-300 group-hover:scale-110', tone)}>
                  <Icon size={20} />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-display text-sm font-bold text-ink dark:text-paper">{title}</p>
                    <span className="rounded-bubble bg-ink/5 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-ink/40 dark:bg-paper/5 dark:text-paper/40">{hint}</span>
                  </div>
                  <p className="mt-0.5 text-sm text-ink/55 dark:text-paper/55">{value}</p>
                </div>
              </div>
            ))}

            {/* office hours */}
            <div className="flex items-start gap-4 rounded-panel border border-neon/25 bg-neon/8 p-5">
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-neon/15 text-neon">
                <Clock size={20} />
              </span>
              <div>
                <p className="font-display text-sm font-bold text-ink dark:text-paper">Avg. first reply</p>
                <p className="mt-0.5 text-sm text-ink/55 dark:text-paper/55">Under 6 hours on weekdays — fastest for seat-holders who booked via the dashboard.</p>
              </div>
            </div>
          </div>

          {/* form */}
          <div data-reveal>
            {sent ? (
              <div className="flex h-full min-h-[380px] flex-col items-center justify-center rounded-panel border border-mint/40 bg-mint/8 p-10 text-center dark:border-mint/25" data-enter-scale>
                <CheckCircle2 size={44} className="text-mint" />
                <h3 className="mt-4 font-display text-2xl font-bold text-ink dark:text-paper">Message received</h3>
                <p className="mt-2 max-w-sm text-sm text-ink/55 dark:text-paper/55">
                  Thanks {form.name.split(' ')[0]} — we’ve queued your message for the next mentor office-hours batch.
                </p>
                <Button variant="ghost" className="mt-6" onClick={() => { setSent(false); setForm({ name: '', email: '', subject: '', message: '' }) }}>
                  Send another message
                </Button>
              </div>
            ) : (
              <form onSubmit={submit} className="rounded-panel border border-ink/8 bg-white p-6 shadow-card sm:p-8 dark:border-paper/10 dark:bg-ink-soft dark:shadow-none" data-enter>
                <h3 className="font-display text-xl font-bold text-ink dark:text-paper">Send a message</h3>
                <p className="mt-1 text-sm text-ink/50 dark:text-paper/50">Floating labels, zero friction.</p>
                <div className="mt-6 grid gap-5">
                  {FIELDS.map((f) => (
                    <FloatInput key={f.key} label={f.label} placeholder={f.placeholder} type={f.type} value={form[f.key]} onChange={set(f.key)} />
                  ))}
                  <FloatInput textarea label="What's on your mind?" placeholder="Tell us about your goals, timeline or partnership..." value={form.message} onChange={set('message')} />
                </div>
                <Button type="submit" size="lg" className="mt-7 w-full sm:w-auto">
                  Send message
                  <ArrowRight size={16} />
                </Button>
              </form>
            )}
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="bg-paper pb-24 dark:bg-ink">
        <div className="mx-auto max-w-3xl px-5 lg:px-8">
          <div className="mb-8 text-center" data-reveal>
            <span className="mb-4 inline-block rounded-bubble border border-cyan-snap/30 bg-cyan-snap/10 px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-cyan-snap">
              Quick answers
            </span>
            <h2 className="font-display text-3xl font-extrabold tracking-tight text-ink dark:text-paper">Frequently asked</h2>
          </div>
          <div className="grid gap-3">
            {FAQS.map((f, i) => (
              <div
                key={f.q}
                data-reveal
                className={cn(
                  'overflow-hidden rounded-2xl border bg-white transition-all duration-300 dark:bg-ink-soft',
                  faq === i ? 'border-cyan-snap/40 shadow-float' : 'border-ink/8 dark:border-paper/10',
                )}
              >
                <button onClick={() => setFaq(faq === i ? -1 : i)} className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left">
                  <span className="text-sm font-bold text-ink dark:text-paper">{f.q}</span>
                  <ChevronDown size={16} className={cn('shrink-0 text-ink/40 transition-transform duration-300 dark:text-paper/40', faq === i && 'rotate-180 text-cyan-snap')} />
                </button>
                <div className={cn('grid transition-all duration-400 ease-[cubic-bezier(0.16,1,0.3,1)]', faq === i ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0')}>
                  <div className="overflow-hidden">
                    <p className="px-5 pb-5 text-sm leading-relaxed text-ink/55 dark:text-paper/55">{f.a}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </Page>
  )
}