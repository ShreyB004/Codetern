import { useRef, useState } from 'react'
import { ArrowRight, ChevronDown, Clock, GraduationCap, Handshake, HeartHandshake, Mail, MapPin, MessageCircle, Phone, Send, Sparkles, Wand2 } from 'lucide-react'
import { motion, MotionConfig } from 'motion/react'
import { Page } from '../components/layout/Page.jsx'
import { useRevealScope } from '../hooks/useReveal.js'
import { useToast } from '../context/ToastContext.jsx'
import { Button } from '../components/ui/Button.jsx'
import { cn } from '../lib/utils.js'
import { AuroraBackground } from '../components/ui/backgrounds/AuroraBackground.jsx'

const TOPICS = [
  { id: 'mentorship', label: 'Mentorship', icon: HeartHandshake, tone: 'text-mint-deep dark:text-mint' },
  { id: 'partnership', label: 'Partnership', icon: Handshake, tone: 'text-cyan-deep dark:text-cyan-snap' },
  { id: 'programme', label: 'Programme', icon: GraduationCap, tone: 'text-violet-ink dark:text-violet-deep' },
  { id: 'feedback', label: 'Feedback', icon: MessageCircle, tone: 'text-coral-deep dark:text-coral' },
]

const CHANNELS = [
  { icon: MessageCircle, title: 'Mentor office hours', value: 'Mon–Fri · 6–9 PM IST', hint: 'Live 1:1 calls', tone: 'text-mint-deep bg-mint-deep/10 dark:text-mint dark:bg-mint/10' },
  { icon: Phone, title: 'Calls', value: 'Book via dashboard', hint: 'Seat-holders only', tone: 'text-violet-ink bg-violet-ink/10 dark:text-violet-deep dark:bg-violet-deep/10' },
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

/* floating-label field with animated gradient underline (peer-focus) */
function SparkField({ label, placeholder, value, onChange, type = 'text', textarea = false }) {
  const hasValue = !!value
  return (
    <label className="relative block">
      <span
        className={cn(
          'pointer-events-none absolute left-4 z-10 text-sm text-ink/50 transition-all duration-300 dark:text-paper/50',
          hasValue ? '-top-2.5 bg-white px-2 text-xs font-semibold text-ink/60 dark:bg-ink-soft dark:text-paper/60' : 'top-4',
        )}
      >
        {label}
      </span>
      {textarea ? (
        <textarea
          value={value}
          onChange={onChange}
          rows={5}
          placeholder={placeholder}
          className="peer w-full resize-none rounded-2xl border border-ink/12 bg-white px-4 pb-3 pt-7 text-sm text-ink outline-none transition placeholder:text-ink/45 focus:border-cyan-snap/50 focus:outline-none dark:border-paper/15 dark:bg-ink-soft dark:text-paper dark:placeholder:text-paper/45"
        />
      ) : (
        <input
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className="peer w-full rounded-2xl border border-ink/12 bg-white px-4 pb-3 pt-7 text-sm text-ink outline-none transition placeholder:text-ink/45 focus:border-cyan-snap/50 focus:outline-none dark:border-paper/15 dark:bg-ink-soft dark:text-paper dark:placeholder:text-paper/45"
        />
      )}
      <span className="cdt-underline" aria-hidden />
    </label>
  )
}

/* animated check drawn with SVG path strokes */
function AnimatedCheck() {
  return (
    <div className="relative mx-auto grid h-24 w-24 place-items-center">
      <motion.span
        initial={{ scale: 0.6, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 260, damping: 18 }}
        className="grid h-24 w-24 place-items-center rounded-full bg-mint-deep/15 text-mint-deep dark:bg-mint/15 dark:text-mint"
      >
        <svg viewBox="0 0 52 52" className="h-12 w-12">
          <motion.circle
            cx="26"
            cy="26"
            r="24"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          />
          <motion.path
            d="M15 27l7.5 7.5L37 19"
            fill="none"
            stroke="currentColor"
            strokeWidth="4"
            strokeLinecap="round"
            strokeLinejoin="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 0.3, delay: 0.35, ease: 'easeOut' }}
          />
        </svg>
      </motion.span>
      <motion.span
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="absolute -right-2 -top-2 grid h-8 w-8 place-items-center rounded-full bg-neon text-ink shadow-card"
      >
        <Sparkles size={14} />
      </motion.span>
    </div>
  )
}

export default function ContactPage() {
  const scope = useRevealScope()
  const faqScope = useRevealScope()
  const { push } = useToast()
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' })
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)
  const [faq, setFaq] = useState(0)
  const planeRef = useRef(null)

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))

  const submit = (e) => {
    e.preventDefault()
    if (!form.name.trim() || !form.email.trim() || !form.message.trim()) {
      push('Add your name, email and a short message first', 'error')
      return
    }
    setSending(true)
    setTimeout(() => {
      setSending(false)
      setSent(true)
      push('Message sent — a mentor will reply within 24 hours', 'success')
    }, 900)
  }

  return (
    <Page className="overflow-hidden">
      {/* ── hero ── */}
      <section className="relative overflow-hidden bg-paper py-20 text-ink dark:bg-ink dark:text-paper">
        <div className="grid-lines absolute inset-0 opacity-20" />
        <AuroraBackground className="opacity-50" />
        <div className="relative mx-auto max-w-4xl px-5 text-center lg:px-8">
          <span data-enter className="mb-5 inline-block rounded-bubble border border-neon-deep/40 bg-neon-deep/10 px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-neon-deep dark:border-neon/40 dark:bg-neon/10 dark:text-neon">
            Contact
          </span>
          <h1 data-enter className="font-display text-4xl font-extrabold leading-tight tracking-tight sm:text-6xl">
            Talk to a <span className="text-gradient-deep dark:text-gradient-snap">mentor.</span>
          </h1>
          <p data-enter className="mx-auto mt-5 max-w-2xl text-base text-ink/60 dark:text-paper/60">
            Questions about a track, partnerships with your company, or your application — we answer within a day.
          </p>
        </div>
      </section>

      {/* ── channels + form ── */}
      <section ref={scope} className="bg-paper py-20 dark:bg-ink">
        <div className="mx-auto grid max-w-6xl gap-10 px-5 lg:grid-cols-[1fr_1.15fr] lg:px-8">
          <div className="flex flex-col gap-5" data-reveal>
            {CHANNELS.map(({ icon: Icon, title, value, hint, tone }) => (
              <div key={title} className="group flex items-start gap-4 rounded-panel border border-ink/8 bg-white p-5 shadow-card transition-all duration-300 hover:-translate-y-0.5 hover:shadow-float dark:border-paper/10 dark:bg-ink-soft dark:shadow-none">
                <span className={cn('grid h-11 w-11 shrink-0 place-items-center rounded-2xl transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-3', tone)}>
                  <Icon size={20} />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-display text-sm font-bold text-ink dark:text-paper">{title}</p>
                    <span className="rounded-bubble bg-ink/5 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-ink/60 dark:bg-paper/5 dark:text-paper/60">{hint}</span>
                  </div>
                  <p className="mt-0.5 text-sm text-ink/60 dark:text-paper/55">{value}</p>
                </div>
              </div>
            ))}

            {/* office hours */}
            <div className="flex items-start gap-4 rounded-panel border border-neon-deep/25 bg-neon-deep/8 p-5 dark:border-neon/25 dark:bg-neon/8">
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-neon-deep/15 text-neon-deep dark:bg-neon/15 dark:text-neon">
                <Clock size={20} />
              </span>
              <div>
                <p className="font-display text-sm font-bold text-ink dark:text-paper">Avg. first reply</p>
                <p className="mt-0.5 text-sm text-ink/60 dark:text-paper/55">Under 6 hours on weekdays — fastest for seat-holders who booked via the dashboard.</p>
              </div>
            </div>
          </div>

          {/* ── the form ── */}
          <MotionConfig reducedMotion="user">
            <div data-reveal>
              {sent ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.94, y: 12 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  transition={{ type: 'spring', stiffness: 220, damping: 22 }}
                  className="relative flex min-h-[520px] flex-col items-center justify-center overflow-hidden rounded-panel border border-mint-deep/30 bg-white p-10 text-center shadow-card dark:border-mint/25 dark:bg-ink-soft dark:shadow-none"
                >
                  <span className="cdt-float pointer-events-none absolute -right-8 top-6 h-28 w-28 rounded-full bg-mint-deep/15 blur-2xl dark:bg-mint/15" />
                  <span className="cdt-float-slow cdt-float-delayed pointer-events-none absolute -left-10 bottom-4 h-32 w-32 rounded-full bg-cyan-deep/10 blur-2xl dark:bg-cyan-snap/10" />
                  <AnimatedCheck />
                  <motion.h3
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.45 }}
                    className="mt-6 font-display text-2xl font-bold text-ink dark:text-paper"
                  >
                    Message received
                  </motion.h3>
                  <motion.p
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    className="mt-2 max-w-sm text-sm text-ink/60 dark:text-paper/55"
                  >
                    Thanks {form.name.split(' ')[0] || 'there'} — we&apos;ve queued your message for the next mentor office-hours batch.
                  </motion.p>
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.75 }}
                    className="mt-6 flex items-center gap-2 rounded-bubble bg-mint-deep/10 px-4 py-2 text-xs font-bold text-mint-deep dark:bg-mint/10 dark:text-mint"
                  >
                    <Mail size={13} /> A confirmation lands at {form.email || 'your inbox'} shortly
                  </motion.div>
                  <Button variant="ghost" className="mt-8" onClick={() => { setSent(false); setForm({ name: '', email: '', subject: '', message: '' }) }}>
                    Send another message
                  </Button>
                </motion.div>
              ) : (
                <form onSubmit={submit} className="relative overflow-hidden rounded-panel border border-ink/10 bg-white p-6 shadow-card sm:p-8 dark:border-paper/10 dark:bg-ink-soft dark:shadow-none">
                  {/* living backdrop */}
                  <span className="cdt-float-slow pointer-events-none absolute -right-12 -top-12 h-40 w-40 rounded-full bg-cyan-deep/10 blur-3xl dark:bg-cyan-snap/10" aria-hidden />
                  <span className="cdt-float cdt-float-delayed pointer-events-none absolute -bottom-14 -left-12 h-44 w-44 rounded-full bg-violet-deep/10 blur-3xl dark:bg-violet-deep/10" aria-hidden />

                  <div className="relative">
                    <motion.span
                      initial={{ opacity: 0, y: -6 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true, margin: '-40px' }}
                      transition={{ duration: 0.4 }}
                      className="mb-2 inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.18em] text-cyan-deep dark:text-cyan-snap"
                    >
                      <Wand2 size={13} /> Drop us a line
                    </motion.span>
                    <motion.h3
                      initial={{ opacity: 0, y: 8 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true, margin: '-40px' }}
                      transition={{ duration: 0.4, delay: 0.05 }}
                      className="font-display text-2xl font-extrabold tracking-tight text-ink dark:text-paper"
                    >
                      Send a message
                      <span className="mt-1 block h-[3px] w-16 rounded-full bg-gradient-to-r from-cyan-snap via-neon to-violet-deep" />
                    </motion.h3>

                    {/* topic picker */}
                    <motion.p
                      initial={{ opacity: 0 }}
                      whileInView={{ opacity: 1 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.1 }}
                      className="mt-6 mb-2.5 text-xs font-semibold uppercase tracking-wide text-ink/50 dark:text-paper/50"
                    >
                      What&apos;s it about?
                    </motion.p>
                    <div className="flex flex-wrap gap-2">
                      {TOPICS.map((t) => {
                        const active = form.subject === t.id
                        return (
                          <button
                            key={t.id}
                            type="button"
                            onClick={() => setForm((f) => ({ ...f, subject: t.id }))}
                            aria-pressed={active}
                            className={cn(
                              'relative z-10 flex items-center gap-1.5 rounded-full border px-3.5 py-2 text-xs font-bold transition-colors duration-200',
                              active
                                ? 'border-transparent text-ink dark:text-paper'
                                : 'border-ink/12 text-ink/60 hover:border-ink/30 hover:text-ink dark:border-paper/15 dark:text-paper/60 dark:hover:border-paper/35 dark:hover:text-paper',
                            )}
                          >
                            {active && (
                              <motion.span
                                layoutId="topic-pill"
                                transition={{ type: 'spring', stiffness: 400, damping: 32 }}
                                className="absolute inset-0 -z-10 rounded-full bg-gradient-to-r from-cyan-snap via-neon to-violet-deep"
                              />
                            )}
                            <t.icon size={13} className={active ? '' : t.tone} />
                            {t.label}
                          </button>
                        )
                      })}
                    </div>

                    {/* fields */}
                    <div className="mt-6 grid gap-5">
                      <div className="grid gap-5 sm:grid-cols-2">
                        <motion.div initial={{ opacity: 0, y: 14 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-40px' }} transition={{ duration: 0.35, delay: 0.05 }}>
                          <SparkField label="Full name" placeholder="Aarav Mehta" value={form.name} onChange={set('name')} />
                        </motion.div>
                        <motion.div initial={{ opacity: 0, y: 14 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-40px' }} transition={{ duration: 0.35, delay: 0.1 }}>
                          <SparkField label="Work email" placeholder="you@company.com" type="email" value={form.email} onChange={set('email')} />
                        </motion.div>
                      </div>
                      <motion.div initial={{ opacity: 0, y: 14 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-40px' }} transition={{ duration: 0.35, delay: 0.15 }}>
                        <SparkField textarea label="What's on your mind?" placeholder="Tell us about your goals, timeline or partnership…" value={form.message} onChange={set('message')} />
                      </motion.div>
                    </div>

                    {/* meta + submit */}
                    <div className="mt-7 flex flex-col items-stretch gap-4 sm:flex-row sm:items-center sm:justify-between">
                      <p className="order-2 flex items-center gap-1.5 text-[11px] text-ink/40 dark:text-paper/40 sm:order-1">
                        <Sparkles size={12} className="text-neon-deep dark:text-neon" />
                        {form.message.trim().length}/500 · a mentor replies within a day
                      </p>
                      <Button
                        type="submit"
                        size="lg"
                        variant="neon"
                        className="group/btn order-1 sm:order-2"
                        disabled={sending}
                      >
                        {sending ? 'Flying…' : 'Send message'}
                        <motion.span
                          ref={planeRef}
                          animate={sending ? { x: 34, y: -22, opacity: 0, rotate: 20 } : { x: 0, y: 0, opacity: 1 }}
                          transition={{ type: 'spring', stiffness: 300, damping: 22 }}
                          className="inline-flex"
                        >
                          <Send size={16} />
                        </motion.span>
                        {!sending && <ArrowRight size={15} className="transition-transform duration-300 group-hover/btn:translate-x-0.5" aria-hidden />}
                      </Button>
                    </div>
                  </div>
                </form>
              )}
            </div>
          </MotionConfig>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section ref={faqScope} className="bg-paper pb-24 dark:bg-ink">
        <div className="mx-auto max-w-3xl px-5 lg:px-8">
          <div className="mb-8 text-center" data-reveal>
            <span className="mb-4 inline-block rounded-bubble border border-cyan-deep/30 bg-cyan-deep/10 px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-cyan-deep dark:border-cyan-snap/30 dark:bg-cyan-snap/10 dark:text-cyan-snap">
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
                  faq === i ? 'border-cyan-deep/40 dark:border-cyan-snap/40 shadow-float' : 'border-ink/8 dark:border-paper/10',
                )}
              >
                <button
                  onClick={() => setFaq(faq === i ? -1 : i)}
                  aria-expanded={faq === i}
                  aria-controls={`faq-${i}`}
                  className="focus-ring flex min-h-11 w-full items-center justify-between gap-4 px-5 py-4 text-left"
                >
                  <span className="text-sm font-bold text-ink dark:text-paper">{f.q}</span>
                  <ChevronDown size={16} className={cn('shrink-0 text-ink/60 transition-transform duration-300 dark:text-paper/60', faq === i && 'rotate-180 text-cyan-deep dark:text-cyan-snap')} />
                </button>
                <div
                  id={`faq-${i}`}
                  className={cn('grid transition-all duration-400 ease-[cubic-bezier(0.16,1,0.3,1)]', faq === i ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0')}
                >
                  <div className="overflow-hidden">
                    <p className="px-5 pb-5 text-sm leading-relaxed text-ink/60 dark:text-paper/55">{f.a}</p>
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