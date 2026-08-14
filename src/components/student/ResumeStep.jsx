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

  return (
    <StepShell step={2} onBack={() => {}}>
      {/* ── compact completeness strip ── */}
      <div className="mb-6 flex items-center gap-4 rounded-2xl border border-ink/10 bg-paper/60 px-4 py-3 dark:border-paper/10 dark:bg-ink">
        <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl text-sm font-black text-white" style={{ background: 'linear-gradient(rgba(11,14,26,0.45), rgba(11,14,26,0.45)), linear-gradient(135deg, var(--color-cyan-snap), var(--color-violet-deep))' }}>
          {initials}
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-3">
            <p className="text-xs font-bold text-ink dark:text-paper">Profile completeness</p>
            <p className="font-display text-xs font-extrabold text-cyan-deep dark:text-cyan-snap">{pct}%</p>
          </div>
          <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-ink/8 dark:bg-paper/10">
            <div className="h-full rounded-full bg-gradient-to-r from-cyan-snap via-mint to-neon transition-all duration-700" style={{ width: `${pct}%` }} />
          </div>
          <p className="mt-1 text-[11px] text-ink/55 dark:text-paper/45">
            {pct >= 100 ? 'Profile complete — employers can verify you instantly.' : 'Name, email & domain are required; the rest boosts your candidacy.'}
          </p>
        </div>
      </div>

      <form onSubmit={submit} className="grid gap-6 lg:grid-cols-[1.2fr_1fr]">
        {/* ── left column: about you + resume ── */}
        <div className="flex flex-col gap-6">
          <section className="rounded-2xl border border-ink/10 bg-paper/50 p-4 sm:p-5 dark:border-paper/10 dark:bg-ink">
            <p className="mb-3 flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-ink/50 dark:text-paper/50">
              <UserIcon size={13} className="text-cyan-deep dark:text-cyan-snap" /> About you
            </p>
            <div className="grid gap-3 sm:grid-cols-2">
              <Field icon={<UserIcon size={14} />} label="Full name" value={form.name} onChange={set('name')} placeholder="Aarav Mehta" required />
              <Field icon={<Mail size={14} />} type="email" label="Email" value={form.email} onChange={set('email')} placeholder="you@email.com" required />
              <Field icon={<Linkedin size={14} />} label="LinkedIn URL" value={form.linkedin} onChange={set('linkedin')} placeholder="linkedin.com/in/..." optional />
              <Field icon={<Phone size={14} />} label="Phone" value={form.phone} onChange={set('phone')} placeholder="+91 98XXXXXXXX" optional />
              <Field icon={<MapPin size={14} />} label="City" value={form.city} onChange={set('city')} placeholder="Bangalore" optional />
              <label className="block sm:col-span-2">
                <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-ink/50 dark:text-paper/50">
                  Short bio <span className="font-normal normal-case text-ink/30 dark:text-paper/30">(optional)</span>
                </span>
                <textarea
                  value={form.bio}
                  onChange={set('bio')}
                  rows={2}
                  placeholder="One paragraph on what you want to build and why."
                  className="cdt-input w-full resize-none rounded-xl px-4 py-2.5 text-sm outline-none focus:border-cyan-snap/60"
                />
              </label>
            </div>
          </section>

          <section className="rounded-2xl border border-ink/10 bg-paper/50 p-4 sm:p-5 dark:border-paper/10 dark:bg-ink">
            <p className="mb-3 flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-ink/50 dark:text-paper/50">
              <FileText size={13} className="text-violet-deep" /> Your resume
            </p>
            <div
              onDragOver={(e) => { e.preventDefault(); setDrag(true) }}
              onDragLeave={() => setDrag(false)}
              onDrop={(e) => { e.preventDefault(); setDrag(false); onFile(e.dataTransfer.files) }}
              className={cn(
                'flex items-center gap-4 rounded-2xl border-2 border-dashed px-4 py-4 transition-colors',
                drag ? 'border-cyan-deep/70 bg-cyan-deep/8 dark:border-cyan-snap/70 dark:bg-cyan-snap/8' : 'border-ink/15 bg-paper/60 dark:border-paper/15 dark:bg-ink',
              )}
            >
              {form.resumeName ? (
                <>
                  <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-mint-deep/15 text-mint-deep dark:bg-mint/15 dark:text-mint">
                    <FileText size={20} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-bold text-ink dark:text-paper">{form.resumeName}</p>
                    <p className="text-xs text-mint-deep dark:text-mint">Attached · ready to submit</p>
                  </div>
                  <button type="button" onClick={() => setForm((f) => ({ ...f, resumeName: '' }))} className="flex shrink-0 items-center gap-1.5 rounded-full border border-coral-deep/25 px-4 py-1.5 text-xs font-semibold text-coral-deep transition hover:bg-coral-deep/10 dark:border-coral/25 dark:text-coral dark:hover:bg-coral/10">
                    <Trash2 size={12} /> Remove
                  </button>
                </>
              ) : (
                <>
                  <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-ink/5 text-ink/50 dark:bg-paper/5 dark:text-paper/50">
                    <Upload size={20} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-ink dark:text-paper">Drop your resume here</p>
                    <p className="text-xs text-ink/45 dark:text-paper/45">PDF or DOCX · max 5MB</p>
                  </div>
                  <label className="shrink-0 cursor-pointer rounded-full border border-ink/15 px-5 py-2 text-xs font-semibold text-ink transition hover:bg-ink/5 dark:border-paper/20 dark:text-paper dark:hover:bg-paper/5">
                    Browse files
                    <input type="file" accept=".pdf,.doc,.docx" className="hidden" onChange={(e) => onFile(e.target.files)} />
                  </label>
                </>
              )}
            </div>
          </section>
        </div>

        {/* ── right column: domain track (list) ── */}
        <section className="self-start rounded-2xl border border-ink/10 bg-paper/50 p-4 sm:p-5 dark:border-paper/10 dark:bg-ink">
          <DomainPicker compact value={form.domain} onChange={(id) => setForm((f) => ({ ...f, domain: id }))} />
        </section>

        <div className="flex flex-col gap-3 lg:col-span-2 lg:flex-row lg:items-center lg:justify-between lg:border-t lg:border-ink/8 lg:pt-4 dark:lg:border-paper/10">
          <p className="flex items-center gap-2 text-xs text-ink/60 dark:text-paper/45">
            <BadgeCheck size={14} className="text-mint-deep dark:text-mint" />
            A complete profile is our minimum bar — employers verify these fields.
          </p>
          <div className="flex items-center gap-3">
            {form.linkedin && (
              <span className="flex items-center gap-1.5 text-xs font-semibold text-cyan-deep dark:text-cyan-snap">
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
      <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-ink/50 dark:text-paper/50">
        {label} {optional && <span className="font-normal normal-case text-ink/30 dark:text-paper/30">(optional)</span>}
      </span>
      <div className="relative">
        <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-ink/35 dark:text-paper/35">{icon}</span>
        <input
          {...props}
          className="cdt-input w-full rounded-xl py-2.5 pl-10 pr-4 text-sm outline-none focus:border-cyan-snap/60"
        />
      </div>
    </label>
  )
}
