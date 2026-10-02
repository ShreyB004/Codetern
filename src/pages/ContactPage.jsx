import { useState } from 'react'
import { ArrowRight, CheckCircle2, ChevronDown, Loader2, Send } from 'lucide-react'
import { Page } from '../components/layout/Page.jsx'
import { Pill } from '../components/ui/Pill.jsx'
import { Reveal } from '../components/ui/Reveal.jsx'
import { useToast } from '../context/ToastContext.jsx'
import { saveContact } from '../lib/rtdb.js'
import { useSite } from '../hooks/useSite.js'
import { cn } from '../lib/utils.js'

const FAQS = [
  { q: 'Is this an internship?', a: 'No — Codetern sells courses. You learn production code, ship builds, pass PR reviews and show verifiable work.' },
  { q: 'Do I build toy projects?', a: 'Never. Micro-LLM, custom database, production API, published extension — then repeat inside a team simulation.' },
  { q: 'How do PR reviews work?', a: 'Push to GitHub, request review. Mentors comment inline within 24h (4h on Pro 1:1). You iterate until shippable.' },
  { q: 'How does joining work?', a: 'Fill the Join form (2 min) → finish the Google Form → admin approves → sign in and your LMS unlocks.' },
]

export default function ContactPage() {
  const { push } = useToast()
  const site = useSite('faqs')
  const [form, setForm] = useState({ name: '', email: '', message: '' })
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)
  const [faq, setFaq] = useState(0)

  const submit = async (e) => {
    e.preventDefault()
    if (!form.name.trim() || !form.email.trim() || !form.message.trim()) {
      push('Add your name, email and a short message first', 'error')
      return
    }
    setSending(true)
    try {
      await saveContact(form)
      setSent(true)
      push('Message saved — a mentor replies within a day', 'success')
    } catch {
      push('Could not save — check connection / Firebase rules', 'error')
    } finally {
      setSending(false)
    }
  }

  const inputCls = 'w-full rounded-2xl border border-ink/12 bg-white px-4 py-3 text-sm text-ink outline-none transition placeholder:text-ink/35 focus:border-cyan-600 dark:border-paper/15 dark:bg-ink dark:text-paper dark:placeholder:text-paper/35'

  return (
    <Page>
      <section className="mx-auto max-w-4xl px-5 pt-28 text-center lg:px-8">
        <Reveal>
          <Pill tone="cyan" dot pulse>Replies within a day</Pill>
          <h1 className="mt-4 font-display text-5xl font-extrabold tracking-tight">Talk to a mentor.</h1>
          <p className="mx-auto mt-3 max-w-xl text-[15px] opacity-60">Courses, joining, teams, reviews — ask anything.</p>
        </Reveal>
      </section>

      <section className="mx-auto max-w-2xl px-5 py-10 lg:px-8">
        <Reveal>
        {sent ? (
          <div className="flex flex-col items-center rounded-[2rem] border border-ink/10 bg-white p-10 text-center dark:border-paper/10 dark:bg-ink-soft">
            <span className="grid h-16 w-16 place-items-center rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-300"><CheckCircle2 size={28} /></span>
            <h2 className="mt-4 font-display text-2xl font-bold">Message received</h2>
            <p className="mt-1 text-sm opacity-60">Thanks {form.name.split(' ')[0] || 'there'} — we reply within a day.</p>
            <button onClick={() => { setSent(false); setForm({ name: '', email: '', message: '' }) }} className="mt-5 rounded-full border border-ink/15 px-5 py-2.5 text-sm font-bold dark:border-paper/15">Send another</button>
          </div>
        ) : (
          <form onSubmit={submit} className="rounded-[2rem] border border-ink/10 bg-white p-6 shadow-card sm:p-8 dark:border-paper/10 dark:bg-ink-soft dark:shadow-none">
            <div className="grid gap-4 sm:grid-cols-2">
              <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Full name *" className={inputCls} />
              <input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="Email *" type="email" className={inputCls} />
            </div>
            <textarea value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} rows={5} maxLength={2000} placeholder="What's on your mind? *" className={cn(inputCls, 'mt-4 resize-none')} />
            <button disabled={sending} className="mt-5 flex w-full items-center justify-center gap-2 rounded-full bg-ink py-3.5 text-sm font-bold text-white transition hover:-translate-y-0.5 disabled:opacity-50 sm:w-auto sm:px-8 dark:bg-paper dark:text-ink">
              {sending ? <><Loader2 size={16} className="animate-spin" /> Sending…</> : <>Send message <Send size={15} /></>}
            </button>
          </form>
        )}
        </Reveal>
      </section>

      <section className="mx-auto max-w-3xl px-5 pb-24 lg:px-8">
        <Reveal>
          <div className="mb-8 flex flex-wrap items-center justify-between gap-3 rounded-[2rem] bg-ink px-6 py-5 text-white transition hover:-translate-y-0.5 dark:bg-ink-soft">
            <p className="text-sm"><b>Average first reply: under 6 hours</b> <span className="opacity-60">on weekdays — fastest for enrolled students.</span></p>
            <a href="/join" className="rounded-full bg-white px-5 py-2.5 text-sm font-bold text-ink transition hover:-translate-y-0.5">Skip the queue — join</a>
          </div>
        </Reveal>
        <Reveal><h2 className="text-center font-display text-2xl font-extrabold">Quick answers</h2></Reveal>
        <div className="mt-5 grid gap-2.5">
          {(site.items?.length ? site.items : FAQS).map((f, i) => (
            <Reveal key={f.q} delay={Math.min(i * 60, 180)}>
            <div className={cn('overflow-hidden rounded-2xl border bg-white transition hover:-translate-y-0.5 dark:bg-ink-soft', faq === i ? 'border-ink/25 shadow-card dark:border-paper/25' : 'border-ink/10 dark:border-paper/10')}>
              <button onClick={() => setFaq(faq === i ? -1 : i)} aria-expanded={faq === i} className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left">
                <span className="text-sm font-bold">{f.q}</span>
                <ChevronDown size={16} className={cn('shrink-0 transition', faq === i && 'rotate-180')} />
              </button>
              <div className={cn('grid transition-all duration-300', faq === i ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0')}>
                <div className="overflow-hidden"><p className="px-5 pb-5 text-sm opacity-60">{f.a}</p></div>
              </div>
            </div>
            </Reveal>
          ))}
        </div>
        <p className="mt-6 text-center text-sm opacity-60">Ready to start? <a href="/join" className="inline-flex items-center gap-1 font-bold underline">Fill the join form <ArrowRight size={13} /></a></p>
      </section>
    </Page>
  )
}
