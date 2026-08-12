import { useState } from 'react'
import { FileText, Linkedin, Upload } from 'lucide-react'
import { StepShell, DomainPicker } from './JourneyTracker.jsx'
import { Button } from '../ui/Button.jsx'
import { useApp } from '../../context/AppContext.jsx'
import { useToast } from '../../context/ToastContext.jsx'
import { cn } from '../../lib/utils.js'

export function ResumeStep({ onComplete }) {
  const { saveProfile } = useApp()
  const { push } = useToast()
  const [form, setForm] = useState({
    name: '',
    email: '',
    linkedin: '',
    bio: '',
    domain: '',
    resumeName: '',
  })
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))

  const [drag, setDrag] = useState(false)

  const onFile = (files) => {
    const file = files?.[0]
    if (file) setForm((f) => ({ ...f, resumeName: file.name }))
  }

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
      resumeName: form.resumeName || `${form.name.split(' ')[0]}-resume.pdf`,
    })
    push('Profile locked in — screening quiz unlocked', 'success')
    onComplete()
  }

  return (
    <StepShell step={1}>
      <form onSubmit={submit} className="grid gap-6 lg:grid-cols-[1.3fr_1fr]">
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Full name" value={form.name} onChange={set('name')} placeholder="Aarav Mehta" required />
          <Field label="Email" type="email" value={form.email} onChange={set('email')} placeholder="you@email.com" required />
          <Field label="LinkedIn URL" value={form.linkedin} onChange={set('linkedin')} placeholder="linkedin.com/in/..." optional />
          <Field label="Current stage" value={form.currentStage} onChange={set('currentStage')} placeholder="Final year / Fresher / Working" optional />
          <label className="block sm:col-span-2">
            <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-ink/50">Short bio</span>
            <textarea
              value={form.bio}
              onChange={set('bio')}
              rows={3}
              placeholder="One paragraph on what you want to build and why."
              className="w-full resize-none rounded-2xl border border-ink/12 bg-white px-4 py-3 text-sm text-ink outline-none transition placeholder:text-ink/30 focus:border-cyan-snap/60 focus:ring-4 focus:ring-cyan-snap/10"
            />
          </label>
        </div>

        <div className="flex flex-col gap-5">
          <DomainPicker
            value={form.domain}
            onChange={(id) => setForm((f) => ({ ...f, domain: id }))}
          />
          <div
            onDragOver={(e) => { e.preventDefault(); setDrag(true) }}
            onDragLeave={() => setDrag(false)}
            onDrop={(e) => { e.preventDefault(); setDrag(false); onFile(e.dataTransfer.files) }}
            className={cn(
              'flex flex-1 flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed px-5 py-8 text-center transition-colors',
              drag ? 'border-cyan-snap/70 bg-cyan-snap/8' : 'border-ink/15 bg-paper/60',
            )}
          >
            <span className="grid h-11 w-11 place-items-center rounded-2xl bg-ink/5 text-ink/50">
              <Upload size={20} />
            </span>
            <p className="text-sm font-semibold text-ink">Drop your resume here</p>
            <p className="text-xs text-ink/45">PDF or DOCX · max 5MB{form.resumeName ? ` · ${form.resumeName}` : ''}</p>
            <label className="cursor-pointer rounded-full border border-ink/15 px-5 py-2 text-xs font-semibold text-ink transition hover:bg-ink/5">
              Browse files
              <input type="file" accept=".pdf,.doc,.docx" className="hidden" onChange={(e) => onFile(e.target.files)} />
            </label>
          </div>
        </div>

        <div className="flex flex-col gap-3 lg:col-span-2 lg:flex-row lg:items-center lg:justify-between lg:border-t lg:border-ink/8 lg:pt-5">
          <p className="flex items-center gap-2 text-xs text-ink/45">
            <FileText size={14} />
            A complete profile is our minimum bar — employers verify these fields.
          </p>
          <div className="flex items-center gap-3">
            {form.linkedin && (
              <span className="flex items-center gap-1.5 text-xs font-semibold text-cyan-snap">
                <Linkedin size={14} /> Profile linked
              </span>
            )}
            <Button type="submit" size="lg" variant="accent">
              Unlock Step 2 →
            </Button>
          </div>
        </div>
      </form>
    </StepShell>
  )
}

function Field({ label, optional = false, ...props }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-ink/50">
        {label} {optional && <span className="font-normal normal-case text-ink/30">(optional)</span>}
      </span>
      <input
        {...props}
        className="w-full rounded-2xl border border-ink/12 bg-white px-4 py-3 text-sm text-ink outline-none transition placeholder:text-ink/30 focus:border-cyan-snap/60 focus:ring-4 focus:ring-cyan-snap/10"
      />
    </label>
  )
}