import { useState } from 'react'
import { BadgeCheck, BookOpen, CheckCircle2, Gift, ListChecks, Rocket, Trophy } from 'lucide-react'
import { StepShell } from './JourneyTracker.jsx'
import { Button } from '../ui/Button.jsx'
import { useApp } from '../../context/AppContext.jsx'
import { useToast } from '../../context/ToastContext.jsx'
import { DEFAULT_WORKSPACE, WORKSPACE_TASKS } from '../../data/workspace.js'
import { cn } from '../../lib/utils.js'

export function WorkspaceStep() {
  const { candidate, updateWorkspace, claimCert } = useApp()
  const { push } = useToast()

  const initial = candidate?.workspace || (candidate?.domain && WORKSPACE_TASKS[candidate.domain]) || DEFAULT_WORKSPACE
  const [workspace, setWorkspace] = useState(initial)
  const [claimed, setClaimed] = useState(!!candidate?.cert)
  const [certId, setCertId] = useState(candidate?.cert?.id || '')

  const allDone = workspace.tasks.every((t) => t.done)
  const doneCount = workspace.tasks.filter((t) => t.done).length

  const toggleTask = (i) => {
    const nextTasks = workspace.tasks.map((t, idx) => (idx === i ? { ...t, done: !t.done } : t))
    const next = { ...workspace, tasks: nextTasks }
    setWorkspace(next)
    updateWorkspace(next)
  }

  const doClaim = () => {
    const id = claimCert()
    if (id) {
      setCertId(id)
      setClaimed(true)
      push(`Certificate ${id} issued — verify it from our public portal`, 'success')
    }
  }

  return (
    <StepShell step={5}>
      <div className="mb-8 flex flex-wrap items-center gap-4">
        <div className="flex-1">
          <div className="flex items-center justify-between text-sm font-semibold text-ink">
            <span>{doneCount} / {workspace.tasks.length} tasks</span>
            <span>{Math.round((doneCount / workspace.tasks.length) * 100)}%</span>
          </div>
          <div className="mt-2 h-2.5 w-full overflow-hidden rounded-full bg-ink/8">
            <div
              className="h-full rounded-full bg-gradient-to-r from-cyan-snap to-neon transition-all duration-700"
              style={{ width: `${(doneCount / workspace.tasks.length) * 100}%` }}
            />
          </div>
        </div>
        <span className={cn(
          'flex items-center gap-1.5 rounded-bubble px-3.5 py-1.5 text-[11px] font-bold uppercase tracking-wider',
          allDone ? 'bg-mint/15 text-mint' : 'bg-ink/5 text-ink/50',
        )}>
          <Trophy size={13} />
          {allDone ? 'Ready to claim' : 'Keep going'}
        </span>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        {/* tasks */}
        <div>
          <h3 className="mb-3 flex items-center gap-2 font-display text-lg font-bold text-ink">
            <ListChecks size={18} className="text-cyan-snap" /> Live project checklist
          </h3>
          <div className="grid gap-3">
            {workspace.tasks.map((t, i) => (
              <div
                key={t.title}
                className={cn(
                  'group rounded-2xl border p-4 transition-all duration-300',
                  t.done ? 'border-mint/30 bg-mint/5' : 'border-ink/10 bg-white hover:border-cyan-snap/40',
                )}
              >
                <div className="flex items-start gap-3">
                  <button
                    onClick={() => toggleTask(i)}
                    className={cn(
                      'mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-lg border-2 transition-all',
                      t.done ? 'border-mint bg-mint text-ink' : 'border-ink/25 text-transparent hover:border-cyan-snap',
                    )}
                    aria-label={`Toggle ${t.title}`}
                  >
                    <CheckCircle2 size={14} strokeWidth={3} />
                  </button>
                  <div>
                    <p className={cn('text-sm font-semibold', t.done ? 'text-ink/50 line-through' : 'text-ink')}>
                      {t.title}
                    </p>
                    <p className="mt-1 text-xs text-ink/45">{t.tips}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* resources + cert */}
        <div className="flex flex-col gap-6">
          <div className="rounded-panel border border-ink/8 bg-white p-5 shadow-card">
            <h3 className="mb-3 flex items-center gap-2 font-display text-lg font-bold text-ink">
              <BookOpen size={18} className="text-violet-deep" /> Curated resources
            </h3>
            <ul className="grid gap-2">
              {workspace.resources.map((r) => (
                <li key={r} className="flex items-center gap-2.5 rounded-xl bg-paper px-3.5 py-2.5 text-sm text-ink/70">
                  <span className="h-1.5 w-1.5 rounded-full bg-cyan-snap" />
                  {r}
                </li>
              ))}
            </ul>
          </div>

          <div className="relative overflow-hidden rounded-panel bg-ink p-6 text-white shadow-float">
            <div className="pointer-events-none absolute -right-8 -top-8 h-28 w-28 rounded-full bg-neon/20 blur-2xl" />
            <span className="inline-flex items-center gap-1.5 rounded-bubble bg-neon/15 px-3 py-1 text-[11px] font-bold uppercase tracking-widest text-neon">
              <Gift size={13} /> Final milestone
            </span>
            <h3 className="mt-3 flex items-center gap-2 font-display text-xl font-bold">
              {claimed ? 'Certificate issued' : 'Claim your certificate'}
            </h3>
            <p className="mt-2 text-sm text-white/55">
              Complete every checklist item to earn your employer-verifiable Codetern certificate with a unique ID.
            </p>
            {claimed ? (
              <div className="mt-4 rounded-2xl border border-mint/30 bg-mint/10 px-4 py-3">
                <p className="text-[11px] font-bold uppercase tracking-widest text-mint">Your verification ID</p>
                <p className="mt-1 font-mono text-base font-bold text-white">{certId}</p>
                <p className="mt-1 text-xs text-white/45">Verify it on the public Certification page.</p>
              </div>
            ) : (
              <Button size="md" variant="neon" className="mt-4" onClick={doClaim} disabled={!allDone}>
                <BadgeCheck size={16} />
                {allDone ? 'Claim now' : 'Locked until all tasks done'}
              </Button>
            )}
          </div>
        </div>
      </div>
    </StepShell>
  )
}