import { useMemo, useState } from 'react'
import { BadgeCheck, BookOpen, BrainCircuit, CheckCircle2, Flame, Gift, ListChecks, Rocket, Trophy, Video } from 'lucide-react'
import { StepShell } from './JourneyTracker.jsx'
import { Button } from '../ui/Button.jsx'
import { useApp } from '../../context/AppContext.jsx'
import { useToast } from '../../context/ToastContext.jsx'
import { DEFAULT_WORKSPACE } from '../../data/workspace.js'
import { cn } from '../../lib/utils.js'

export function WorkspaceStep() {
  const { candidate, updateWorkspace, claimCert, workspaceDefaults } = useApp()
  const { push } = useToast()

  const fallback = (candidate?.domain && workspaceDefaults?.[candidate.domain]) || workspaceDefaults?.default || DEFAULT_WORKSPACE
  const initial = candidate?.workspace || fallback
  const [workspace, setWorkspace] = useState(() => ({
    tasks: initial.tasks.map((t) => ({ ...t })),
    resources: [...initial.resources],
  }))
  const [claimed, setClaimed] = useState(!!candidate?.cert)
  const [certId, setCertId] = useState(candidate?.cert?.id || '')

  const allDone = useMemo(() => workspace.tasks.length > 0 && workspace.tasks.every((t) => t.done), [workspace.tasks])
  const doneCount = workspace.tasks.filter((t) => t.done).length
  const pct = workspace.tasks.length ? Math.round((doneCount / workspace.tasks.length) * 100) : 0
  const milestonesDone = useMemo(() => {
    const m = [1, 2, 3, 4]
    if (doneCount === workspace.tasks.length && workspace.tasks.length) m.push(5)
    return m
  }, [doneCount, workspace.tasks.length])

  const toggleTask = (i) => {
    const nextTasks = workspace.tasks.map((t, idx) => (idx === i ? { ...t, done: !t.done } : t))
    const next = { ...workspace, tasks: nextTasks }
    setWorkspace(next)
    updateWorkspace(next)
    if (nextTasks.every((t) => t.done)) push('All tasks complete — certificate is unlocked!', 'success')
  }

  const doClaim = () => {
    const id = claimCert()
    if (id) {
      setCertId(id)
      setClaimed(true)
      push(`Certificate ${id} issued — verify it from our public portal`, 'success')
    }
  }

  const MILESTONES = [
    { label: 'Seat booked', icon: Rocket, done: !!candidate?.booking },
    { label: 'Profile complete', icon: CheckCircle2, done: !!candidate?.profile },
    { label: 'Workspace tasks', icon: ListChecks, done: allDone },
    { label: 'Assessment cleared', icon: BrainCircuit, done: !!candidate?.quizPassed },
    { label: 'Interview finalised', icon: Video, done: !!candidate?.interview?.done },
  ]

  return (
    <StepShell step={3} onBack={() => {}}>
      {/* ── progress strip ── */}
      <div className="mb-8 grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-ink/10 bg-white p-5 dark:border-paper/10 dark:bg-ink-soft">
          <div className="flex items-center justify-between text-sm font-semibold text-ink dark:text-paper">
            <span>{doneCount} / {workspace.tasks.length} tasks</span>
            <span className="font-display font-extrabold text-cyan-deep dark:text-cyan-snap">{pct}%</span>
          </div>
          <div className="mt-2.5 h-2.5 w-full overflow-hidden rounded-full bg-ink/8 dark:bg-paper/10">
            <div className="h-full rounded-full bg-gradient-to-r from-cyan-snap to-neon transition-all duration-700" style={{ width: `${pct}%` }} />
          </div>
          <p className="mt-2 text-[11px] font-semibold uppercase tracking-wider text-ink/60 dark:text-paper/60">{allDone ? 'Ready to claim' : 'Keep shipping'}</p>
        </div>
        <div className="flex items-center gap-4 rounded-2xl border border-ink/10 bg-white p-5 dark:border-paper/10 dark:bg-ink-soft">
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-coral-deep/10 text-coral-deep dark:bg-coral/10 dark:text-coral">
            <Flame size={20} />
          </span>
          <div>
            <p className="font-display text-xl font-extrabold text-ink dark:text-paper">{(pct / 10).toFixed(0)} day streak</p>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-ink/60 dark:text-paper/60">Consistency score</p>
          </div>
        </div>
        <div className="flex items-center gap-4 rounded-2xl border border-ink/10 bg-white p-5 dark:border-paper/10 dark:bg-ink-soft">
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-violet-ink/10 text-violet-ink dark:bg-violet-deep/10 dark:text-violet-deep">
            <Trophy size={20} />
          </span>
          <div>
            <p className="font-display text-xl font-extrabold text-ink dark:text-paper">{milestonesDone.length}/5</p>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-ink/60 dark:text-paper/60">Milestones hit</p>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        {/* tasks */}
        <div>
          <h3 className="mb-3 flex items-center gap-2 font-display text-lg font-bold text-ink dark:text-paper">
            <ListChecks size={18} className="text-cyan-deep dark:text-cyan-snap" /> Live project checklist
          </h3>
          <p className="mb-4 text-xs text-ink/60 dark:text-paper/45">Your mentor (admin) curates these tasks and can mark them complete on your behalf.</p>
          <div className="grid gap-3">
            {workspace.tasks.map((t, i) => (
              <div
                key={i}
                className={cn(
                  'group rounded-2xl border p-4 transition-all duration-300',
                  t.done ? 'border-mint-deep/30 bg-mint-deep/5 dark:border-mint/30 dark:bg-mint/5' : 'border-ink/10 bg-white hover:border-cyan-deep/40 dark:border-paper/10 dark:bg-ink-soft dark:hover:border-cyan-snap/40',
                )}
              >
                <div className="flex items-start gap-3">
                  <button
                    onClick={() => toggleTask(i)}
                    className={cn(
                      'mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-lg border-2 transition-all',
                      t.done ? 'border-mint bg-mint text-ink' : 'border-ink/25 text-transparent hover:border-cyan-snap dark:border-paper/25',
                    )}
                    aria-label={`Toggle ${t.title}`}
                  >
                    <CheckCircle2 size={14} strokeWidth={3} />
                  </button>
                  <div className="min-w-0">
                    <p className={cn('text-sm font-semibold', t.done ? 'text-ink/50 line-through dark:text-paper/50' : 'text-ink dark:text-paper')}>
                      {t.title}
                    </p>
                    <p className="mt-1 text-xs text-ink/45 dark:text-paper/45">{t.tips}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {allDone && (
            <div className="mt-4 flex items-center gap-3 rounded-2xl border border-mint-deep/30 bg-mint-deep/10 px-4 py-3 dark:border-mint/30 dark:bg-mint/10">
              <CheckCircle2 size={18} className="shrink-0 text-mint-deep dark:text-mint" />
              <p className="text-sm font-semibold text-ink dark:text-paper">
                Checklist complete — your certificate is ready to claim below.
              </p>
            </div>
          )}
        </div>

        {/* milestones + resources + cert */}
        <div className="flex flex-col gap-6">
          <div className="rounded-panel border border-ink/8 bg-white p-5 shadow-card dark:border-paper/10 dark:bg-ink-soft dark:shadow-none">
            <h3 className="mb-3 flex items-center gap-2 font-display text-lg font-bold text-ink dark:text-paper">
              <Trophy size={18} className="text-neon-deep dark:text-neon" /> Journey milestones
            </h3>
            <ul className="grid gap-2">
              {MILESTONES.map((m, i) => {
                const Icon = m.icon
                return (
                  <li key={m.label} className="flex items-center gap-3 rounded-xl bg-paper px-3.5 py-2.5 dark:bg-ink">
                    <span className={cn('grid h-7 w-7 shrink-0 place-items-center rounded-lg', m.done ? 'bg-mint-deep/15 text-mint-deep dark:bg-mint/15 dark:text-mint' : 'bg-ink/5 text-ink/35 dark:bg-paper/5 dark:text-paper/30')}>
                      <Icon size={14} />
                    </span>
                    <span className={cn('flex-1 text-sm font-semibold', m.done ? 'text-ink dark:text-paper' : 'text-ink/60 dark:text-paper/45')}>{m.label}</span>
                    <span className={cn('text-[10px] font-black uppercase tracking-wider', m.done ? 'text-mint-deep dark:text-mint' : 'text-ink/50 dark:text-paper/30')}>
                      {m.done ? '✓ done' : 'step 0'}
                    </span>
                  </li>
                )
              })}
            </ul>
          </div>

          <div className="rounded-panel border border-ink/8 bg-white p-5 shadow-card dark:border-paper/10 dark:bg-ink-soft dark:shadow-none">
            <h3 className="mb-3 flex items-center gap-2 font-display text-lg font-bold text-ink dark:text-paper">
              <BookOpen size={18} className="text-violet-ink dark:text-violet-deep" /> Curated resources
            </h3>
            <ul className="grid gap-2">
              {workspace.resources.map((r, i) => (
                <li key={i} className="flex items-center gap-2.5 rounded-xl bg-paper px-3.5 py-2.5 text-sm text-ink/70 dark:bg-ink dark:text-paper/70">
                  <span className="h-1.5 w-1.5 rounded-full bg-cyan-snap" />
                  {r}
                </li>
              ))}
            </ul>
          </div>

          <div className="relative overflow-hidden rounded-panel bg-ink p-6 text-white shadow-float dark:bg-ink-soft dark:shadow-none">
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
                <p className="mt-1 text-xs text-white/55">Verify it on the public Certification page.</p>
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