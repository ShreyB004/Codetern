import { useState } from 'react'
import { BadgeCheck, FileText, Linkedin, Mail, MapPin, Phone, Trash2, Upload, User as UserIcon } from 'lucide-react'
import { StepShell, DomainPicker } from './JourneyTracker.jsx'
import { Button } from '../ui/Button.jsx'
import { useApp } from '../../context/AppContext.jsx'
import { useToast } from '../../context/ToastContext.jsx'
import { cn } from '../../lib/utils.js'

export function ResumeStep({ onComplete }) {
  const { candidate, saveProfile } = useApp()
  const { push } = useToast()
  const [form, setForm] = useState({
    name: candidate?.profile?.name || '',
    email: candidate?.profile?.email || candidate?.email || '',
    linkedin: candidate?.profile?.linkedin || '',
    bio: candidate?.profile?.bio || '',
    domain: candidate?.profile?.domain || candidate?.domain || '',
    city: candidate?.profile?.city || '',
    phone: candidate?.profile?.phone || '',
    resumeName: candidate?.profile?.resumeName || '',
  })
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))

  const [drag, setDrag] = useState(false)

  const onFile = (files) => {
    const file = files?.[0]
    if (file) setForm((f) => ({ ...f, resumeName: file.name }))
  }

  const complete = [form.name, form.email, form.domain].filter(Boolean).length + (form.linkedin ? 1 : 0) + (form.bio ? 1 : 0) + (form.resumeName ? 1 : 0)
  const pct = Math.round((complete / 6) * 100)
  const valid = form.name && form.email && form.domain

  const submit = (e) => {
    e.preventDefault()
    if (!valid) return push('Complete your name, email and domain first', 'error')
    saveProfile({
      name: form.name,
      email: form.email,
      linkedin: form.linkedin,
      bio: form.bio,
      domain: form.domain,
      city: form.city,
      phone: form.phone,
      resumeName: form.resumeName || `${form.name.split(' ')[0]}-resume.pdf`,
    })
    push('Profile locked in — live workspace unlocked', 'success')
    onComplete()
  }

  const initials = form.name.split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase() || '?'
  const completePct = `${pct}%`

  return (
    <StepShell step={2} onBack={() => {}}>
      <div className="mb-8 flex flex-wrap items-center gap-5 rounded-2xl border border-ink/10 bg-paper/60 p-5 dark:border-paper/10 dark:bg-ink">
        <span className="grid h-16 w-16 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-cyan-snap to-violet-deep text-lg font-black text-ink">
          {initials}
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm font-bold text-ink dark:text-paper">Profile completeness</p>
            <p className="font-display text-sm font-extrabold text-cyan-snap">{completePct}</p>
          </div>
          <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-ink/8 dark:bg-paper/10">
            <div className="h-full rounded-full bg-gradient-to-r from-cyan-snap via-mint to-neon transition-all duration-700" style={{ width: completePct }} />
          </div>
          <p className="mt-1.5 text-xs text-ink/45 dark:text-paper/45">
            {pct >= 100 ? 'Profile complete — employers can verify you instantly.' : 'Name, email & domain are required; the rest boosts your candidacy.'}
          </p>
        </div>
      </div>

      <form onSubmit={submit} className="grid gap-6 lg:grid-cols-[1.3fr_1fr]">
        <div className="grid gap-5 sm:grid-cols-2">
          <Field icon={<UserIcon size={14} />} label="Full name" value={form.name} onChange={set('name')} placeholder="Aarav Mehta" required />
          <Field icon={<Mail size={14} />} type="email" label="Email" value={form.email} onChange={set('email')} placeholder="you@email.com" required />
          <Field icon={<Linkedin size={14} />} label="LinkedIn URL" value={form.linkedin} onChange={set('linkedin')} placeholder="linkedin.com/in/..." optional />
          <Field icon={<Phone size={14} />} label="Phone" value={form.phone} onChange={set('phone')} placeholder="+91 98XXXXXXXX" optional />
          <Field icon={<MapPin size={14} />} label="City" value={form.city} onChange={set('city')} placeholder="Bangalore" optional />
          <label className="block sm:col-span-2">
            <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-ink/50 dark:text-paper/50">Short bio</span>
            <textarea
              value={form.bio}
              onChange={set('bio')}
              rows={3}
              placeholder="One paragraph on what you want to build and why."
              className="cdt-input w-full resize-none rounded-xl px-4 py-3 text-sm outline-none focus:border-cyan-snap/60"
            />
          </label>
        </div>

        <div className="flex flex-col gap-5">
          <DomainPicker value={form.domain} onChange={(id) => setForm((f) => ({ ...f, domain: id }))} />
          <div
            onDragOver={(e) => { e.preventDefault(); setDrag(true) }}
            onDragLeave={() => setDrag(false)}
            onDrop={(e) => { e.preventDefault(); setDrag(false); onFile(e.dataTransfer.files) }}
            className={cn(
              'flex flex-1 flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed px-5 py-8 text-center transition-colors',
              drag ? 'border-cyan-snap/70 bg-cyan-snap/8' : 'border-ink/15 bg-paper/60 dark:border-paper/15 dark:bg-ink',
            )}
          >
            {form.resumeName ? (
              <>
                <span className="grid h-11 w-11 place-items-center rounded-2xl bg-mint/15 text-mint">
                  <FileText size={20} />
                </span>
                <div className="min-w-0">
                  <p className="truncate text-sm font-bold text-ink dark:text-paper">{form.resumeName}</p>
                  <p className="text-xs text-mint">Attached · ready to submit</p>
                </div>
                <button type="button" onClick={() => setForm((f) => ({ ...f, resumeName: '' }))} className="flex items-center gap-1.5 rounded-full border border-coral/25 px-4 py-1.5 text-xs font-semibold text-coral transition hover:bg-coral/10">
                  <Trash2 size={12} /> Remove
                </button>
              </>
            ) : (
              <>
                <span className="grid h-11 w-11 place-items-center rounded-2xl bg-ink/5 text-ink/50 dark:bg-paper/5 dark:text-paper/50">
                  <Upload size={20} />
                </span>
                <p className="text-sm font-semibold text-ink dark:text-paper">Drop your resume here</p>
                <p className="text-xs text-ink/45 dark:text-paper/45">PDF or DOCX · max 5MB</p>
                <label className="cursor-pointer rounded-full border border-ink/15 px-5 py-2 text-xs font-semibold text-ink transition hover:bg-ink/5 dark:border-paper/20 dark:text-paper dark:hover:bg-paper/5">
                  Browse files
                  <input type="file" accept=".pdf,.doc,.docx" className="hidden" onChange={(e) => onFile(e.target.files)} />
                </label>
              </>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-3 lg:col-span-2 lg:flex-row lg:items-center lg:justify-between lg:border-t lg:border-ink/8 lg:pt-5 dark:lg:border-paper/10">
          <p className="flex items-center gap-2 text-xs text-ink/45 dark:text-paper/45">
            <BadgeCheck size={14} className="text-mint" />
            A complete profile is our minimum bar — employers verify these fields.
          </p>
          <div className="flex items-center gap-3">
            {form.linkedin && (
              <span className="flex items-center gap-1.5 text-xs font-semibold text-cyan-snap">
                <Linkedin size={14} /> Profile linked
              </span>
            )}
            <Button type="submit" size="lg" variant="accent">
              Unlock live workspace →
            </Button>
          </div>
        </div>
      </form>
    </StepShell>
  )
}

function Field({ icon, label, optional = false, ...props }) {
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