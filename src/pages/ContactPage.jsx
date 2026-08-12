import { useRef, useState } from 'react'
import { ArrowRight, CheckCircle2, Mail, MapPin, MessageCircle, Phone } from 'lucide-react'
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
  { icon: Mail, title: 'Email us', value: 'hello@codetern.dev' },
  { icon: MessageCircle, title: 'Mentor office hours', value: 'Mon–Fri · 6–9 PM IST' },
  { icon: Phone, title: 'Calls', value: 'Book via dashboard' },
  { icon: MapPin, title: 'Bangalore HQ', value: 'Innovation Campus, Koramangala' },
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
          'pointer-events-none absolute left-4 text-sm text-ink/40 transition-all duration-300',
          value ? '-top-2.5 bg-paper px-2 text-xs font-semibold text-ink/60' : 'top-3.5',
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
          className="w-full resize-none rounded-2xl border border-ink/12 bg-white px-4 pb-3 pt-6 text-sm text-ink outline-none transition placeholder:text-ink/25 focus:outline-none"
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
          className="w-full rounded-2xl border border-ink/12 bg-white px-4 pb-3 pt-6 text-sm text-ink outline-none transition placeholder:text-ink/25 focus:outline-none"
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

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))

  const submit = (e) => {
    e.preventDefault()
    setSent(true)
    push('Message sent — a mentor will reply within 24 hours', 'success')
  }

  return (
    <Page className="overflow-hidden">
      <section className="relative overflow-hidden bg-ink py-20 text-white">
        <div className="grid-lines absolute inset-0 opacity-20" />
        <div className="pointer-events-none absolute -left-20 top-[-30%] h-80 w-80 rounded-full bg-cyan-snap/20 blur-[110px]" />
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

      <section ref={scope} className="bg-paper py-20">
        <div className="mx-auto grid max-w-6xl gap-10 px-5 lg:grid-cols-[1fr_1.1fr] lg:px-8">
          {/* channels */}
          <div className="flex flex-col gap-5" data-reveal>
            {CHANNELS.map(({ icon: Icon, title, value }) => (
              <div key={title} className="flex items-start gap-4 rounded-panel border border-ink/8 bg-white p-5 shadow-card">
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-cyan-snap/10 text-cyan-snap">
                  <Icon size={20} />
                </span>
                <div>
                  <p className="font-display text-sm font-bold text-ink">{title}</p>
                  <p className="mt-0.5 text-sm text-ink/55">{value}</p>
                </div>
              </div>
            ))}
          </div>

          {/* form */}
          <div data-reveal>
            {sent ? (
              <div className="flex h-full min-h-[380px] flex-col items-center justify-center rounded-panel border border-mint/40 bg-mint/8 p-10 text-center" data-enter-scale>
                <CheckCircle2 size={44} className="text-mint" />
                <h3 className="mt-4 font-display text-2xl font-bold text-ink">Message received</h3>
                <p className="mt-2 max-w-sm text-sm text-ink/55">
                  Thanks {form.name.split(' ')[0]} — we’ve queued your message for the next mentor office-hours batch.
                </p>
                <Button variant="ghost" className="mt-6" onClick={() => { setSent(false); setForm({ name: '', email: '', subject: '', message: '' }) }}>
                  Send another message
                </Button>
              </div>
            ) : (
              <form onSubmit={submit} className="rounded-panel border border-ink/8 bg-white p-6 shadow-card sm:p-8" data-enter>
                <h3 className="font-display text-xl font-bold text-ink">Send a message</h3>
                <p className="mt-1 text-sm text-ink/50">Floating labels, zero friction.</p>
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
    </Page>
  )
}