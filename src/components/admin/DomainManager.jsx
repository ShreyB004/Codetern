import { useState } from 'react'
import { Check, Edit3, Plus, Save, Trash2, Upload } from 'lucide-react'
import { useApp } from '../../context/AppContext.jsx'
import { useToast } from '../../context/ToastContext.jsx'
import { DOMAIN_COLORS, DURATIONS } from '../../data/programmes.js'
import { DomainIcon } from '../ui/Icon.jsx'
import { cn } from '../../lib/utils.js'

const BASE_FORM = {
  id: '',
  title: '',
  sub: '',
  tagline: '',
  icon: 'Code2',
  color: 'mern',
  durations: [3],
  stack: [],
}

export function DomainManager() {
  const { programmes, addDomain, updateDomain, removeDomain } = useApp()
  const { push } = useToast()
  const [editing, setEditing] = useState(null)
  const [creating, setCreating] = useState(false)

  const startEdit = (p) => setEditing({ ...p, _stackText: p.stack.join(', ') })
  const startCreate = () => {
    setCreating(true)
    setEditing({ ...BASE_FORM, _stackText: '' })
  }

  const save = (form) => {
    if (!form.title.trim()) return push('Title is required', 'error')
    const payload = { ...form, stack: form._stackText.split(',').map((s) => s.trim()).filter(Boolean) }
    delete payload._stackText
    if (creating) {
      if (programmes.some((p) => p.id === payload.id)) return push('That id already exists', 'error')
      addDomain(payload)
      push('Domain added — seat slots auto-created', 'success')
    } else {
      updateDomain(payload.id, payload)
      push('Domain updated', 'success')
    }
    setEditing(null)
    setCreating(false)
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <p className="text-sm text-ink/55">{programmes.length} programmes in the catalogue</p>
        <button onClick={startCreate} className="flex items-center gap-2 rounded-full bg-ink px-5 py-2.5 text-sm font-semibold text-paper transition hover:bg-ink-soft">
          <Plus size={15} /> New domain
        </button>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {programmes.map((p) => {
          const color = DOMAIN_COLORS[p.color]
          return (
            <div key={p.id} className="rounded-panel border border-ink/8 bg-white p-5 shadow-card">
              <div className="flex items-start gap-3">
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl" style={{ background: color.bg, color: color.fg }}>
                  <DomainIcon name={p.icon} size={20} />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-display text-base font-bold text-ink">{p.title}</h3>
                    <span className="rounded-bubble bg-ink/5 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-ink/50">{p.sub}</span>
                  </div>
                  <p className="truncate text-xs text-ink/45">{p.tagline}</p>
                  <div className="mt-2 flex flex-wrap items-center gap-1.5">
                    {p.stack.slice(0, 5).map((s) => (
                      <span key={s} className="rounded-bubble bg-ink/5 px-2 py-0.5 text-[10px] font-semibold text-ink/60">{s}</span>
                    ))}
                    <span className="ml-1 flex items-center gap-1 text-[11px] font-bold text-cyan-snap">
                      {p.durations.map((d) => `${d}mo`).join(' · ')}
                    </span>
                  </div>
                </div>
                <div className="flex shrink-0 gap-1.5">
                  <button onClick={() => startEdit(p)} className="grid h-8 w-8 place-items-center rounded-lg border border-ink/10 text-ink/60 transition hover:bg-ink/5" aria-label="Edit domain">
                    <Edit3 size={14} />
                  </button>
                  <button onClick={() => { removeDomain(p.id); push(`${p.title} removed`, 'error') }} className="grid h-8 w-8 place-items-center rounded-lg border border-coral/20 text-coral transition hover:bg-coral/10" aria-label="Delete domain">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {editing && (
        <DomainForm
          form={editing}
          creating={creating}
          set={(patch) => setEditing((e) => ({ ...e, ...patch }))}
          onCancel={() => { setEditing(null); setCreating(false) }}
          onSave={save}
        />
      )}
    </div>
  )
}

function DomainForm({ form, creating, set, onCancel, onSave }) {
  return (
    <div className="fixed inset-0 z-[110] grid place-items-center p-4">
      <div className="absolute inset-0 bg-ink/60 backdrop-blur-sm" onClick={onCancel} />
      <div className="relative max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-panel bg-white p-7 shadow-float">
        <h3 className="font-display text-lg font-bold text-ink">
          {creating ? 'Create a new domain' : `Edit — ${form.title}`}
        </h3>

        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <Field label="ID (url-safe)" value={form.id} onChange={(v) => set({ id: v.toLowerCase().trim() })} placeholder="e.g. blockchain" disabled={!creating} />
          <Field label="Title" value={form.title} onChange={(v) => set({ title: v })} placeholder="Blockchain Engineering" />
          <Field label="Sub / track name" value={form.sub} onChange={(v) => set({ sub: v })} placeholder="Web3, Solidity, Smart Contracts" />
          <Field label="Tech stack (comma separated)" value={form._stackText} onChange={(v) => set({ _stackText: v })} placeholder="Solidity, Hardhat, Web3.js" />
          <label className="block sm:col-span-2">
            <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-ink/50">Tagline</span>
            <input value={form.tagline} onChange={(e) => set({ tagline: e.target.value })} placeholder="One line selling this track" className="w-full rounded-xl border border-ink/12 px-4 py-2.5 text-sm outline-none focus:border-cyan-snap/60" />
          </label>

          <div>
            <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-ink/50">Icon</span>
            <div className="flex flex-wrap gap-2">
              {['Code2', 'Globe', 'Server', 'Smartphone', 'Database', 'Cpu', 'ShieldCheck', 'Container', 'PenTool'].map((iconName) => (
                <button key={iconName} type="button" onClick={() => set({ icon: iconName })} className={cn('grid h-9 w-9 place-items-center rounded-xl border', form.icon === iconName ? 'border-cyan-snap bg-cyan-snap/10 text-cyan-snap' : 'border-ink/10 text-ink/50')}>
                  <DomainIcon name={iconName} size={16} />
                </button>
              ))}
            </div>
          </div>

          <div>
            <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-ink/50">Accent color</span>
            <div className="flex flex-wrap gap-2">
              {Object.keys(DOMAIN_COLORS).map((key) => (
                <button key={key} type="button" onClick={() => set({ color: key })} className={cn('h-9 w-9 rounded-xl border-2 transition', form.color === key ? 'border-ink' : 'border-transparent')} style={{ background: DOMAIN_COLORS[key].fg }} aria-label={key} />
              ))}
            </div>
          </div>

          <div className="sm:col-span-2">
            <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-ink/50">Available durations</span>
            <div className="flex flex-wrap gap-2">
              {DURATIONS.map((d) => (
                <button key={d} type="button" onClick={() => set({ durations: form.durations.includes(d) ? form.durations.filter((x) => x !== d) : [...form.durations, d].sort() })} className={cn('rounded-bubble px-4 py-2 text-sm font-semibold transition', form.durations.includes(d) ? 'bg-ink text-neon' : 'border border-ink/15 text-ink/50 hover:border-ink/40')}>
                  {d}mo {form.durations.includes(d) && <Check size={12} className="ml-1 inline" />}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-7 flex justify-end gap-3 border-t border-ink/8 pt-5">
          <button onClick={onCancel} className="rounded-full border border-ink/12 px-5 py-2.5 text-sm font-semibold text-ink/60 hover:bg-ink/5">Cancel</button>
          {creating && (
            <button onClick={() => { set({ dragging: true }); setTimeout(() => set({ dragging: false }), 400) }} className="flex items-center gap-2 rounded-full border border-ink/15 px-5 py-2.5 text-sm font-semibold text-ink/60 hover:bg-ink/5" aria-label="Upload logo">
              <Upload size={14} /> Logo
            </button>
          )}
          <button onClick={() => onSave(form)} className="flex items-center gap-2 rounded-full bg-ink px-6 py-2.5 text-sm font-semibold text-paper transition hover:bg-ink-soft">
            <Save size={15} /> {creating ? 'Create domain' : 'Save changes'}
          </button>
        </div>
      </div>
    </div>
  )
}

function Field({ label, value, onChange, placeholder, disabled }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-ink/50">{label}</span>
      <input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} disabled={disabled} className="w-full rounded-xl border border-ink/12 px-4 py-2.5 text-sm outline-none focus:border-cyan-snap/60 disabled:bg-ink/5 disabled:text-ink/35" />
    </label>
  )
}