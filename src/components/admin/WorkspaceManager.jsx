import { useMemo, useState } from 'react'
import { BookOpen, CheckCircle2, ChevronDown, Save, Search, Settings2, X } from 'lucide-react'
import { useApp } from '../../context/AppContext.jsx'
import { useToast } from '../../context/ToastContext.jsx'
import { getProgramme, DOMAIN_COLORS } from '../../data/programmes.js'
import { cn } from '../../lib/utils.js'

export function WorkspaceManager() {
  const { candidates, programmes, updateWorkspaceFor, workspaceDefaults, updateWorkspaceDefault } = useApp()
  const { push } = useToast()

  const [domain, setDomain] = useState('all')
  const [q, setQ] = useState('')
  const [selected, setSelected] = useState([])
  const [expanded, setExpanded] = useState(null)
  const [editDefault, setEditDefault] = useState(false)

  const filtered = useMemo(
    () =>
      candidates.filter((c) => {
        const matchD = domain === 'all' || c.domain === domain
        const matchQ = c.name.toLowerCase().includes(q.toLowerCase()) || c.email.toLowerCase().includes(q.toLowerCase())
        return matchD && matchQ
      }),
    [candidates, domain, q],
  )

  const toggleSelect = (id) =>
    setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]))

  const bulkDone = (all) => {
    if (!selected.length) return push('Select at least one candidate first', 'error')
    selected.forEach((id) => {
      const c = candidates.find((x) => x.id === id)
      const ws = c?.workspace || workspaceDefaults?.[c.domain]
      if (!ws) return
      updateWorkspaceFor(id, { ...ws, tasks: ws.tasks.map((t) => ({ ...t, done: all })) })
    })
    push(`Marked ${selected.length} candidate workspace(s) ${all ? 'complete' : 'incomplete'}`, 'success')
  }

  const resolveWorkspace = (c) => c?.workspace || workspaceDefaults?.[c.domain]

  return (
    <div>
      {/* toolbar */}
      <div className="mb-6 flex flex-col gap-3 lg:flex-row lg:items-center">
        <div className="relative flex-1">
          <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-ink/30 dark:text-paper/30">
            <Search size={16} />
          </span>
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search candidates…"
            className="cdt-input w-full rounded-xl py-2.5 pl-10 pr-4 text-sm outline-none focus:border-cyan-snap/60"
          />
        </div>
        <select value={domain} onChange={(e) => { setDomain(e.target.value); setSelected([]) }} className="cdt-input rounded-xl px-4 py-2.5 text-sm outline-none">
          <option value="all">All domains</option>
          {programmes.map((p) => <option key={p.id} value={p.id}>{p.title}</option>)}
        </select>
        <button
          onClick={() => bulkDone(true)}
          className="flex items-center gap-2 rounded-xl bg-mint/15 px-4 py-2.5 text-sm font-semibold text-mint transition hover:bg-mint/25"
        >
          <CheckCircle2 size={15} /> Complete ({selected.length})
        </button>
        <button
          onClick={() => bulkDone(false)}
          className="flex items-center gap-2 rounded-xl bg-coral/10 px-4 py-2.5 text-sm font-semibold text-coral transition hover:bg-coral/20"
        >
          <X size={15} /> Reset ({selected.length})
        </button>
        <button
          onClick={() => setEditDefault(true)}
          className="flex items-center gap-2 rounded-xl bg-ink px-4 py-2.5 text-sm font-semibold text-paper transition hover:bg-ink-soft dark:bg-paper dark:text-ink dark:hover:bg-paper/85"
        >
          <Settings2 size={15} /> Edit defaults
        </button>
      </div>

      {/* candidate cards */}
      <div className="grid gap-4">
        {filtered.map((c) => {
          const p = getProgramme(c.domain)
          const color = p ? DOMAIN_COLORS[p.color] : null
          const ws = resolveWorkspace(c)
          const doneCount = ws?.tasks?.filter((t) => t.done).length || 0
          const total = ws?.tasks?.length || 0
          const open = expanded === c.id
          const isSel = selected.includes(c.id)
          return (
            <div key={c.id} className={cn('rounded-panel border bg-white shadow-card transition dark:bg-ink-soft', open ? 'border-cyan-snap/40' : 'border-ink/8 dark:border-paper/10')}>
              <div className="flex flex-wrap items-center gap-3 px-5 py-4">
                <input
                  type="checkbox"
                  checked={isSel}
                  onChange={() => toggleSelect(c.id)}
                  className="h-4 w-4 accent-[#22d3ee]"
                  aria-label={`Select ${c.name}`}
                />
                <span
                  className="grid h-10 w-10 shrink-0 place-items-center rounded-xl text-xs font-bold"
                  style={{ background: color?.bg || 'rgba(34,211,238,0.12)', color: color?.fg || '#22d3ee' }}
                >
                  {c.name.split(' ').map((w) => w[0]).slice(0, 2).join('')}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-bold text-ink dark:text-paper">{c.name}</p>
                  <p className="text-xs text-ink/45 dark:text-paper/45">{c.email} · {p?.title || 'No domain'}</p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="hidden sm:block">
                    <div className="flex items-center justify-between gap-2 text-[10px] font-bold uppercase tracking-wider text-ink/40 dark:text-paper/40">
                      <span>{doneCount}/{total}</span>
                      <span>{total ? Math.round((doneCount / total) * 100) : 0}%</span>
                    </div>
                    <div className="mt-1 h-1.5 w-32 overflow-hidden rounded-full bg-ink/8 dark:bg-paper/10">
                      <div className="h-full rounded-full bg-gradient-to-r from-cyan-snap to-mint" style={{ width: `${total ? (doneCount / total) * 100 : 0}%` }} />
                    </div>
                  </div>
                  <button
                    onClick={() => setExpanded(open ? null : c.id)}
                    className="grid h-9 w-9 place-items-center rounded-xl border border-ink/10 text-ink/60 transition hover:bg-ink/5 dark:border-paper/15 dark:text-paper/60 dark:hover:bg-paper/5"
                    aria-label="Toggle editor"
                  >
                    <ChevronDown size={16} className={cn('transition-transform', open && 'rotate-180')} />
                  </button>
                </div>
              </div>

              {open && (
                <WorkspaceEditor
                  key={c.id}
                  workspace={ws || { tasks: [], resources: [] }}
                  onChange={(next) => updateWorkspaceFor(c.id, next)}
                />
              )}
            </div>
          )
        })}

        {filtered.length === 0 && (
          <p className="rounded-2xl border border-dashed border-ink/15 py-16 text-center text-sm text-ink/45 dark:border-paper/15 dark:text-paper/45">
            No candidates match your filters.
          </p>
        )}
      </div>

      {editDefault && <DefaultEditor domain={domain} onClose={() => setEditDefault(false)} />}
    </div>
  )
}

function WorkspaceEditor({ workspace, onChange }) {
  const [ws, setWs] = useState(() => ({ tasks: workspace.tasks.map((t) => ({ ...t })), resources: [...workspace.resources] }))

  const commit = (next) => {
    setWs(next)
    onChange(next)
  }

  const patchTask = (i, patch) => commit({ ...ws, tasks: ws.tasks.map((t, idx) => (idx === i ? { ...t, ...patch } : t)) })
  const addTask = () => commit({ ...ws, tasks: [...ws.tasks, { title: 'New task', done: false, tips: 'Add guidance for the intern' }] })
  const removeTask = (i) => commit({ ...ws, tasks: ws.tasks.filter((_, idx) => idx !== i) })
  const addResource = () => commit({ ...ws, resources: [...ws.resources, 'New resource link'] })
  const patchResource = (i, v) => commit({ ...ws, resources: ws.resources.map((r, idx) => (idx === i ? v : r)) })
  const removeResource = (i) => commit({ ...ws, resources: ws.resources.filter((_, idx) => idx !== i) })

  return (
    <div className="border-t border-ink/8 bg-paper/60 px-5 py-5 dark:border-paper/10 dark:bg-ink">
      <div className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
        <div>
          <p className="mb-3 text-[11px] font-bold uppercase tracking-widest text-ink/40 dark:text-paper/40">Tasks</p>
          <div className="grid gap-2.5">
            {ws.tasks.map((t, i) => (
              <div key={i} className="flex items-start gap-3 rounded-xl border border-ink/10 bg-white p-3 dark:border-paper/10 dark:bg-ink-soft">
                <button
                  onClick={() => patchTask(i, { done: !t.done })}
                  className={cn(
                    'mt-1 grid h-5 w-5 shrink-0 place-items-center rounded-md border-2 text-[10px] font-black transition',
                    t.done ? 'border-mint bg-mint text-ink' : 'border-ink/25 text-transparent dark:border-paper/25',
                  )}
                  aria-label="Toggle done"
                >
                  ✓
                </button>
                <div className="min-w-0 flex-1 space-y-1.5">
                  <input
                    value={t.title}
                    onChange={(e) => patchTask(i, { title: e.target.value })}
                    className="cdt-input w-full rounded-lg px-3 py-1.5 text-sm font-semibold outline-none focus:border-cyan-snap/60"
                  />
                  <input
                    value={t.tips}
                    onChange={(e) => patchTask(i, { tips: e.target.value })}
                    className="cdt-input w-full rounded-lg px-3 py-1.5 text-xs outline-none focus:border-cyan-snap/60"
                  />
                </div>
                <button onClick={() => removeTask(i)} className="mt-1 shrink-0 text-coral/60 transition hover:text-coral" aria-label="Delete task">
                  <X size={15} />
                </button>
              </div>
            ))}
          </div>
          <button onClick={addTask} className="mt-3 rounded-full border border-dashed border-ink/25 px-4 py-2 text-xs font-semibold text-ink/50 transition hover:border-cyan-snap/50 hover:text-cyan-snap dark:border-paper/25 dark:text-paper/50">
            + Add task
          </button>
        </div>

        <div>
          <p className="mb-3 text-[11px] font-bold uppercase tracking-widest text-ink/40 dark:text-paper/40">Resources</p>
          <div className="grid gap-2">
            {ws.resources.map((r, i) => (
              <div key={i} className="flex items-center gap-2 rounded-xl border border-ink/10 bg-white p-2.5 dark:border-paper/10 dark:bg-ink-soft">
                <BookOpen size={14} className="shrink-0 text-violet-deep" />
                <input
                  value={r}
                  onChange={(e) => patchResource(i, e.target.value)}
                  className="cdt-input min-w-0 flex-1 rounded-lg px-3 py-1.5 text-xs outline-none focus:border-cyan-snap/60"
                />
                <button onClick={() => removeResource(i)} className="shrink-0 text-coral/60 transition hover:text-coral" aria-label="Delete resource">
                  <X size={14} />
                </button>
              </div>
            ))}
          </div>
          <button onClick={addResource} className="mt-3 rounded-full border border-dashed border-ink/25 px-4 py-2 text-xs font-semibold text-ink/50 transition hover:border-cyan-snap/50 hover:text-cyan-snap dark:border-paper/25 dark:text-paper/50">
            + Add resource
          </button>
        </div>
      </div>
    </div>
  )
}

function DefaultEditor({ domain, onClose }) {
  const { programmes, workspaceDefaults, updateWorkspaceDefault } = useApp()
  const { push } = useToast()
  const [target, setTarget] = useState(domain !== 'all' ? domain : programmes[0]?.id || '')
  const initial = (target && workspaceDefaults?.[target]) || { tasks: [], resources: [] }
  const [draft, setDraft] = useState(() => ({
    tasks: initial.tasks.map((t) => ({ ...t })),
    resources: [...initial.resources],
  }))

  const switchTarget = (id) => {
    setTarget(id)
    const ws = workspaceDefaults?.[id] || { tasks: [], resources: [] }
    setDraft({ tasks: ws.tasks.map((t) => ({ ...t })), resources: [...ws.resources] })
  }

  const patchTask = (i, patch) => setDraft((d) => ({ ...d, tasks: d.tasks.map((t, idx) => (idx === i ? { ...t, ...patch } : t)) }))
  const removeTask = (i) => setDraft((d) => ({ ...d, tasks: d.tasks.filter((_, idx) => idx !== i) }))
  const patchResource = (i, v) => setDraft((d) => ({ ...d, resources: d.resources.map((r, idx) => (idx === i ? v : r)) }))

  const save = () => {
    updateWorkspaceDefault(target, draft)
    push(`Default workspace for ${target} saved`, 'success')
    onClose()
  }

  return (
    <div className="fixed inset-0 z-[110] grid place-items-center p-4">
      <div className="absolute inset-0 bg-ink/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-panel bg-white p-7 shadow-float dark:bg-ink-soft">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="flex items-center gap-2 font-display text-lg font-bold text-ink dark:text-paper">
              <Settings2 size={18} className="text-cyan-snap" /> Domain default workspace
            </h3>
            <p className="mt-1 text-sm text-ink/50 dark:text-paper/50">Applies to candidates who haven't customized their own yet.</p>
          </div>
          <button onClick={onClose} className="grid h-8 w-8 place-items-center rounded-full border border-ink/10 text-ink/60 dark:border-paper/15 dark:text-paper/60" aria-label="Close">
            <X size={15} />
          </button>
        </div>

        <select value={target} onChange={(e) => switchTarget(e.target.value)} className="cdt-input mt-5 w-full rounded-xl px-4 py-2.5 text-sm outline-none">
          {programmes.map((p) => <option key={p.id} value={p.id}>{p.title}</option>)}
        </select>

        <div className="mt-5 grid gap-6 lg:grid-cols-[1.5fr_1fr]">
          <div>
            <p className="mb-3 text-[11px] font-bold uppercase tracking-widest text-ink/40 dark:text-paper/40">Tasks</p>
            <div className="grid gap-2.5">
              {draft.tasks.map((t, i) => (
                <div key={i} className="flex items-start gap-3 rounded-xl border border-ink/10 bg-white p-3 dark:border-paper/10 dark:bg-ink-soft">
                  <button
                    onClick={() => patchTask(i, { done: !t.done })}
                    className={cn(
                      'mt-1 grid h-5 w-5 shrink-0 place-items-center rounded-md border-2 text-[10px] font-black transition',
                      t.done ? 'border-mint bg-mint text-ink' : 'border-ink/25 text-transparent dark:border-paper/25',
                    )}
                    aria-label="Toggle done"
                  >
                    ✓
                  </button>
                  <div className="min-w-0 flex-1 space-y-1.5">
                    <input
                      value={t.title}
                      onChange={(e) => patchTask(i, { title: e.target.value })}
                      className="cdt-input w-full rounded-lg px-3 py-1.5 text-sm font-semibold outline-none focus:border-cyan-snap/60"
                    />
                    <input
                      value={t.tips}
                      onChange={(e) => patchTask(i, { tips: e.target.value })}
                      className="cdt-input w-full rounded-lg px-3 py-1.5 text-xs outline-none focus:border-cyan-snap/60"
                    />
                  </div>
                  <button onClick={() => removeTask(i)} className="mt-1 shrink-0 text-coral/60 transition hover:text-coral" aria-label="Delete task">
                    <X size={15} />
                  </button>
                </div>
              ))}
            </div>
            <button
              onClick={() => setDraft((d) => ({ ...d, tasks: [...d.tasks, { title: 'New task', done: false, tips: 'Add guidance' }] }))}
              className="mt-3 rounded-full border border-dashed border-ink/25 px-4 py-2 text-xs font-semibold text-ink/50 transition hover:border-cyan-snap/50 hover:text-cyan-snap dark:border-paper/25 dark:text-paper/50"
            >
              + Add task
            </button>
          </div>

          <div>
            <p className="mb-3 text-[11px] font-bold uppercase tracking-widest text-ink/40 dark:text-paper/40">Resources</p>
            <div className="grid gap-2">
              {draft.resources.map((r, i) => (
                <div key={i} className="flex items-center gap-2 rounded-xl border border-ink/10 bg-white p-2.5 dark:border-paper/10 dark:bg-ink-soft">
                  <BookOpen size={14} className="shrink-0 text-violet-deep" />
                  <input
                    value={r}
                    onChange={(e) => patchResource(i, e.target.value)}
                    className="cdt-input min-w-0 flex-1 rounded-lg px-3 py-1.5 text-xs outline-none focus:border-cyan-snap/60"
                  />
                </div>
              ))}
            </div>
            <button
              onClick={() => setDraft((d) => ({ ...d, resources: [...d.resources, 'New resource link'] }))}
              className="mt-3 rounded-full border border-dashed border-ink/25 px-4 py-2 text-xs font-semibold text-ink/50 transition hover:border-cyan-snap/50 hover:text-cyan-snap dark:border-paper/25 dark:text-paper/50"
            >
              + Add resource
            </button>
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-3 border-t border-ink/8 pt-5 dark:border-paper/10">
          <button onClick={onClose} className="rounded-full border border-ink/12 px-5 py-2.5 text-sm font-semibold text-ink/60 hover:bg-ink/5 dark:border-paper/15 dark:text-paper/60 dark:hover:bg-paper/5">
            Cancel
          </button>
          <button onClick={save} className="flex items-center gap-2 rounded-full bg-ink px-6 py-2.5 text-sm font-semibold text-paper transition hover:bg-ink-soft dark:bg-paper dark:text-ink dark:hover:bg-paper/85">
            <Save size={15} /> Save defaults
          </button>
        </div>
      </div>
    </div>
  )
}
