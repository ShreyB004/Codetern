import { useState } from 'react'
import { ArrowRight, CheckCircle2, Loader2 } from 'lucide-react'
import { COURSES } from '../../data/courses.js'
import { saveJoinRequest } from '../../lib/rtdb.js'
import { REGISTRATION_URL } from '../../lib/analytics.js'
import { useAuth } from '../../context/AuthContext.jsx'
import { CustomSelect } from '../ui/CustomSelect.jsx'
import { cn } from '../../lib/utils.js'

const EDUCATIONS = ['College student', 'Fresher / graduate', 'Working professional', 'Career switcher', 'School student', 'Other']

const VALID_COURSES = ['ai-llms', 'web-dev', 'databases', 'api-arch']

export function JoinForm({ compact = false, onDone, initialCourse }) {
  const { user } = useAuth()
  const [form, setForm] = useState({
    fullName: '', email: '', phone: '', education: '',
    linkedin: '', github: '',
    courseId: VALID_COURSES.includes(initialCourse) ? initialCourse : 'ai-llms',
    message: '',
  })
  const [errors, setErrors] = useState({})
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)

  const set = (k, v) => {
    setForm((f) => ({ ...f, [k]: v }))
    setErrors((e) => ({ ...e, [k]: null }))
  }

  const submit = async (e) => {
    e.preventDefault()
    const errs = {}
    if (!form.fullName.trim()) errs.fullName = 'Name is required'
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = 'Valid email is required'
    if (!/^[6-9]\d{9}$/.test(form.phone.replace(/\D/g, '').slice(-10))) errs.phone = 'Valid 10-digit mobile number'
    if (!form.education) errs.education = 'Pick one'
    if (form.linkedin.trim() && !/^https?:\/\/.+\..+/.test(form.linkedin.trim())) errs.linkedin = 'That doesn’t look like a full link (https://…)'
    if (form.github.trim() && !/^https?:\/\/.+\..+/.test(form.github.trim())) errs.github = 'That doesn’t look like a full link (https://…)'
    if (!form.courseId) errs.courseId = 'Pick a course'
    setErrors(errs)
    if (Object.keys(errs).length) return
    setSending(true)
    try {
      await saveJoinRequest({ ...form, uid: user?.uid || null })
      setSent(true)
      onDone?.()
      // hand off to the Google Form, then admin approves → LMS unlocks
      setTimeout(() => window.open(REGISTRATION_URL, '_blank', 'noopener,noreferrer'), 900)
    } catch {
      setErrors({ submit: 'Could not save — check your connection and retry.' })
    } finally {
      setSending(false)
    }
  }

  if (sent) {
    return (
      <div className="flex flex-col items-center p-8 text-center">
        <span className="grid h-16 w-16 place-items-center rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-300"><CheckCircle2 size={28} /></span>
        <h3 className="mt-4 font-display text-2xl font-bold">You’re on the list, {form.fullName.split(' ')[0]}.</h3>
        <p className="mt-2 max-w-md text-sm opacity-60">
          We opened the Google Form in a new tab — finish it and the admin approves you.
          After approval, sign in and your LMS appears automatically.
        </p>
        <a href={REGISTRATION_URL} target="_blank" rel="noreferrer" className="mt-5 rounded-full bg-ink px-6 py-3 text-sm font-bold text-white dark:bg-paper dark:text-ink">
          Open Google Form again <ArrowRight size={14} className="ml-1 inline" />
        </a>
      </div>
    )
  }

  const input = (hasErr) => cn(
    'w-full rounded-2xl border bg-white px-4 py-3 text-sm text-ink outline-none transition placeholder:text-ink/35 focus:border-cyan-600 dark:bg-ink dark:text-paper dark:placeholder:text-paper/35',
    hasErr ? 'border-rose-500' : 'border-ink/12 focus:border-cyan-600/60 dark:border-paper/15',
  )

  return (
    <form onSubmit={submit} className={cn('grid gap-4', compact && 'sm:grid-cols-2')}>
      <div className={compact ? 'sm:col-span-1' : ''}>
        <input value={form.fullName} onChange={(e) => set('fullName', e.target.value)} placeholder="Full name *" aria-label="Full name" className={input(errors.fullName)} />
        {errors.fullName && <p className="mt-1 text-xs text-rose-500">{errors.fullName}</p>}
      </div>
      <div>
        <input value={form.email} onChange={(e) => set('email', e.target.value)} placeholder="Email *" aria-label="Email" type="email" className={input(errors.email)} />
        {errors.email && <p className="mt-1 text-xs text-rose-500">{errors.email}</p>}
      </div>
      <div>
        <input value={form.phone} onChange={(e) => set('phone', e.target.value)} placeholder="Mobile number *" aria-label="Mobile number" type="tel" className={input(errors.phone)} />
        {errors.phone && <p className="mt-1 text-xs text-rose-500">{errors.phone}</p>}
      </div>
      <div>
        <CustomSelect value={form.education} onChange={(v) => set('education', v)} options={EDUCATIONS} placeholder="Education / background *" />
        {errors.education && <p className="mt-1 text-xs text-rose-500">{errors.education}</p>}
      </div>
      <div>
        <input value={form.linkedin} onChange={(e) => set('linkedin', e.target.value)} placeholder="LinkedIn profile link (optional)" aria-label="LinkedIn profile link" type="url" className={input(errors.linkedin)} />
        {errors.linkedin && <p className="mt-1 text-xs text-rose-500">{errors.linkedin}</p>}
      </div>
      <div>
        <input value={form.github} onChange={(e) => set('github', e.target.value)} placeholder="GitHub profile link (optional)" aria-label="GitHub profile link" type="url" className={input(errors.github)} />
        {errors.github && <p className="mt-1 text-xs text-rose-500">{errors.github}</p>}
      </div>
      <div className={compact ? 'sm:col-span-2' : ''}>
        <p className="mb-2 text-xs font-bold uppercase tracking-wider opacity-50">Which course do you want? *</p>
        <div className="grid gap-2 sm:grid-cols-2">
          {COURSES.map((c) => (
            <button type="button" key={c.id} onClick={() => set('courseId', c.id)}
              className={cn('rounded-2xl border p-3 text-left transition hover:-translate-y-0.5',
                form.courseId === c.id
                  ? 'border-ink bg-ink text-white dark:border-paper dark:bg-paper dark:text-ink'
                  : 'border-ink/12 bg-white dark:border-paper/15 dark:bg-ink')}>
              <p className="text-sm font-bold">{c.title}</p>
              <p className="text-[11px] opacity-60">{c.sub}</p>
            </button>
          ))}
        </div>
      </div>
      <div className={compact ? 'sm:col-span-2' : ''}>
        <textarea value={form.message} onChange={(e) => set('message', e.target.value)} rows={3} maxLength={1000} placeholder="Anything we should know? (goals, experience, timing…)" aria-label="Anything we should know" className={input(false)} />
      </div>
      {errors.submit && <p className={compact ? 'text-xs text-rose-500 sm:col-span-2' : 'text-xs text-rose-500'}>{errors.submit}</p>}
      <button disabled={sending} className={cn('flex items-center justify-center gap-2 rounded-full bg-ink py-3.5 text-sm font-bold text-white transition hover:-translate-y-0.5 disabled:opacity-50 dark:bg-paper dark:text-ink', compact && 'sm:col-span-2')}>
        {sending ? <><Loader2 size={16} className="animate-spin" /> Saving…</> : <>Continue to Google Form <ArrowRight size={16} /></>}
      </button>
      <p className={cn('text-center text-[11px] opacity-50', compact && 'sm:col-span-2')}>
        Step 1 of 2 here · Step 2 is the Google Form · Admin approves → LMS unlocks<br />
        By applying you agree to our <a href="/terms" target="_blank" rel="noreferrer" className="font-bold underline">Terms</a> and{' '}
        <a href="/privacy" target="_blank" rel="noreferrer" className="font-bold underline">Privacy Policy</a>
      </p>
    </form>
  )
}
