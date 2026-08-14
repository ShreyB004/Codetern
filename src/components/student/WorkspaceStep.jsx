import { useMemo, useRef, useState } from 'react'
import { ArrowRight, BookOpen, BrainCircuit, CheckCircle2, Clock3, ExternalLink, Flame, ImagePlus, ListChecks, Loader2, Rocket, Send, Trash2, Trophy, Video, XCircle } from 'lucide-react'
import { StepShell } from './JourneyTracker.jsx'
import { useApp } from '../../context/AppContext.jsx'
import { useToast } from '../../context/ToastContext.jsx'
import { DEFAULT_WORKSPACE } from '../../data/workspace.js'
import { cn } from '../../lib/utils.js'

// Read an image file → downscaled dataURL (keeps localStorage healthy)
function readImage(file) {
  return new Promise((resolve) => {
    const reader = new FileReader()
    reader.onload = () => {
      const img = new Image()
      img.onload = () => {
        const max = 900
        const scale = Math.min(1, max / Math.max(img.width, img.height))
        const canvas = document.createElement('canvas')
        canvas.width = Math.round(img.width * scale)
        canvas.height = Math.round(img.height * scale)
        canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height)
        resolve(canvas.toDataURL('image/jpeg', 0.72))
      }
      img.onerror = () => resolve(reader.result)
      img.src = reader.result
    }
    reader.onerror = () => resolve(null)
    reader.readAsDataURL(file)
  })
}

const STATUS_META = {
  todo: { label: 'Not submitted', cls: 'border-ink/12 text-ink/50 dark:border-paper/15 dark:text-paper/45', Icon: Clock3 },
  pending: { label: 'Awaiting review', cls: 'border-amber-400/40 bg-amber-400/10 text-amber-600 dark:text-amber-300', Icon: Loader2 },
  revision: { label: 'Changes requested', cls: 'border-coral-deep/40 bg-coral-deep/10 text-coral-deep dark:border-coral/40 dark:bg-coral/10 dark:text-coral', Icon: XCircle },
  approved: { label: 'Approved by mentor', cls: 'border-mint-deep/40 bg-mint-deep/10 text-mint-deep dark:border-mint/40 dark:bg-mint/10 dark:text-mint', Icon: CheckCircle2 },
}

export function WorkspaceStep() {
  const { candidate, submitTaskWork, workspaceDefaults } = useApp()
  const { push } = useToast()

  const fallback = (candidate?.domain && workspaceDefaults?.[candidate.domain]) || workspaceDefaults?.default || DEFAULT_WORKSPACE
  const initial = candidate?.workspace || fallback
  const workspace = {
    tasks: initial.tasks.map((t) => ({ ...t, status: t.status || (t.done ? 'approved' : 'todo') })),
    resources: [...initial.resources],
  }

  const allDone = useMemo(() => workspace.tasks.length > 0 && workspace.tasks.every((t) => t.done), [workspace.tasks])
  const pendingCount = workspace.tasks.filter((t) => t.status === 'pending').length
  const doneCount = workspace.tasks.filter((t) => t.done).length
  const pct = workspace.tasks.length ? Math.round((doneCount / workspace.tasks.length) * 100) : 0
  const milestonesDone = useMemo(() => {
    const m = [1, 2, 3, 4]
    if (allDone) m.push(5)
    return m
  }, [allDone])

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
      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-ink/10 bg-white p-5 dark:border-paper/10 dark:bg-ink-soft">
          <div className="flex items-center justify-between text-sm font-semibold text-ink dark:text-paper">
            <span>{doneCount} / {workspace.tasks.length} tasks approved</span>
            <span className="font-display font-extrabold text-cyan-deep dark:text-cyan-snap">{pct}%</span>
          </div>
          <div className="mt-2.5 h-2.5 w-full overflow-hidden rounded-full bg-ink/8 dark:bg-paper/10">
            <div className="h-full rounded-full bg-gradient-to-r from-cyan-snap to-neon transition-all duration-700" style={{ width: `${pct}%` }} />
          </div>
          <p className="mt-2 text-[11px] font-semibold uppercase tracking-wider text-ink/60 dark:text-paper/60">
            {allDone ? 'All approved — next: assessment' : pendingCount ? `${pendingCount} waiting on mentor review` : 'Keep shipping'}
          </p>
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
          <p className="mb-4 text-xs text-ink/60 dark:text-paper/45">
            Upload screenshots or a live link as proof of work — your mentor reviews each submission and approves it.
          </p>
          <div className="grid gap-3">
            {workspace.tasks.map((t, i) => (
              <TaskCard
                key={i}
                index={i}
                task={t}
                onSubmit={(evidence) => {
                  submitTaskWork(i, evidence)
                  push('Work submitted — waiting for mentor review', 'success')
                }}
              />
            ))}
          </div>

          {allDone && (
            <div className="mt-4 flex items-center gap-3 rounded-2xl border border-mint-deep/30 bg-mint-deep/10 px-4 py-3 dark:border-mint/30 dark:bg-mint/10">
              <CheckCircle2 size={18} className="shrink-0 text-mint-deep dark:text-mint" />
              <p className="text-sm font-semibold text-ink dark:text-paper">
                Every task approved — head to the Final Assessment next. Your certificate is issued after the final interview.
              </p>
            </div>
          )}
        </div>

        {/* milestones + resources + next */}
        <div className="flex flex-col gap-6">
          <div className="rounded-panel border border-ink/8 bg-white p-5 shadow-card dark:border-paper/10 dark:bg-ink-soft dark:shadow-none">
            <h3 className="mb-3 flex items-center gap-2 font-display text-lg font-bold text-ink dark:text-paper">
              <Trophy size={18} className="text-neon-deep dark:text-neon" /> Journey milestones
            </h3>
            <ul className="grid gap-2">
              {MILESTONES.map((m) => {
                const Icon = m.icon
                return (
                  <li key={m.label} className="flex items-center gap-3 rounded-xl bg-paper px-3.5 py-2.5 dark:bg-ink">
                    <span className={cn('grid h-7 w-7 shrink-0 place-items-center rounded-lg', m.done ? 'bg-mint-deep/15 text-mint-deep dark:bg-mint/15 dark:text-mint' : 'bg-ink/5 text-ink/35 dark:bg-paper/5 dark:text-paper/30')}>
                      <Icon size={14} />
                    </span>
                    <span className={cn('flex-1 text-sm font-semibold', m.done ? 'text-ink dark:text-paper' : 'text-ink/60 dark:text-paper/45')}>{m.label}</span>
                    <span className={cn('text-[10px] font-black uppercase tracking-wider', m.done ? 'text-mint-deep dark:text-mint' : 'text-ink/50 dark:text-paper/30')}>
                      {m.done ? '✓ done' : 'pending'}
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
            <span className="inline-flex items-center gap-1.5 rounded-bubble bg-cyan-snap/15 px-3 py-1 text-[11px] font-bold uppercase tracking-widest text-cyan-snap">
              <ArrowRight size={13} /> What&apos;s next
            </span>
            <h3 className="mt-3 font-display text-xl font-bold">Certificate comes after the interview</h3>
            <p className="mt-2 text-sm text-white/55">
              Once your tasks are approved, you&apos;ll face the final assessment and AI-scored interview. Your certificate is issued the moment you clear the interview — not before.
            </p>
            <div className="mt-4 flex items-center gap-2.5 rounded-2xl border border-mint/25 bg-mint/10 px-4 py-2.5 text-xs text-white/75">
              <CheckCircle2 size={14} className="shrink-0 text-mint" />
              Workspace → Assessment → Interview → <span className="font-bold text-mint">Certificate</span>
            </div>
          </div>
        </div>
      </div>
    </StepShell>
  )
}

// ── single task with evidence upload + review status ──────
function TaskCard({ index, task, onSubmit }) {
  const [picked, setPicked] = useState([])
  const [link, setLink] = useState(task.evidence?.link || '')
  const [submitting, setSubmitting] = useState(false)
  const fileRef = useRef(null)

  const meta = STATUS_META[task.status] || STATUS_META.todo
  const StatusIcon = meta.Icon

  const addFiles = async (files) => {
    const list = Array.from(files).filter((f) => f.type.startsWith('image/')).slice(0, 4)
    if (!list.length) return
    setSubmitting(true)
    const urls = (await Promise.all(list.map(readImage))).filter(Boolean)
    setPicked((prev) => [...prev, ...urls].slice(0, 4))
    setSubmitting(false)
  }

  const canSubmit = (picked.length > 0 || link.trim().length >= 4) && !task.done
  const resubmit = task.status === 'revision'

  const submit = () => {
    if (!canSubmit || submitting) return
    onSubmit({ images: picked, link: link.trim() })
    setPicked([])
  }

  return (
    <div
      className={cn(
        'rounded-2xl border p-4 transition-all duration-300',
        task.done ? 'border-mint-deep/30 bg-mint-deep/5 dark:border-mint/30 dark:bg-mint/5' : 'border-ink/10 bg-white dark:border-paper/10 dark:bg-ink-soft',
      )}
    >
      <div className="flex items-start gap-3">
        <span
          className={cn(
            'mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-lg border-2',
            task.done ? 'border-mint bg-mint text-ink' : 'border-ink/25 text-transparent dark:border-paper/25',
          )}
        >
          <CheckCircle2 size={14} strokeWidth={3} />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className={cn('text-sm font-semibold', task.done ? 'text-ink/50 line-through dark:text-paper/50' : 'text-ink dark:text-paper')}>
              {index + 1}. {task.title}
            </p>
            <span className={cn('inline-flex items-center gap-1.5 rounded-bubble border px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider', meta.cls)}>
              <StatusIcon size={11} className={task.status === 'pending' ? 'animate-spin' : ''} />
              {meta.label}
            </span>
          </div>
          <p className="mt-1 text-xs text-ink/45 dark:text-paper/45">{task.tips}</p>

          {task.evidence && task.evidence.link && (
            <a href={task.evidence.link} target="_blank" rel="noreferrer" className="mt-2 inline-flex items-center gap-1.5 rounded-bubble border border-cyan-deep/25 bg-cyan-deep/8 px-3 py-1 text-[11px] font-semibold text-cyan-deep hover:underline dark:border-cyan-snap/25 dark:bg-cyan-snap/8 dark:text-cyan-snap">
              <ExternalLink size={11} /> Live work link
            </a>
          )}
          {task.evidence?.images?.length > 0 && (
            <div className="mt-2.5 flex flex-wrap gap-2">
              {task.evidence.images.map((src, j) => (
                <img key={j} src={src} alt={`Evidence ${j + 1}`} className="h-16 w-20 rounded-lg border border-ink/10 object-cover dark:border-paper/10" />
              ))}
            </div>
          )}
          {task.review?.note && (
            <p className="mt-2 flex items-start gap-1.5 rounded-xl bg-coral-deep/8 px-3 py-2 text-[11px] text-coral-deep dark:bg-coral/8 dark:text-coral">
              <XCircle size={12} className="mt-0.5 shrink-0" />
              Mentor: {task.review.note}
            </p>
          )}

          {!task.done && (
            <div className="mt-3 grid gap-2.5 rounded-xl border border-dashed border-ink/15 bg-paper/60 p-3 dark:border-paper/15 dark:bg-ink">
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  disabled={submitting || picked.length >= 4}
                  className="flex items-center gap-1.5 rounded-full border border-ink/15 px-3.5 py-1.5 text-xs font-semibold text-ink/70 transition hover:border-cyan-deep/50 hover:text-cyan-deep disabled:opacity-50 dark:border-paper/20 dark:text-paper/70 dark:hover:border-cyan-snap/50 dark:hover:text-cyan-snap"
                >
                  <ImagePlus size={13} /> Add screenshots ({picked.length}/4)
                </button>
                <input ref={fileRef} type="file" accept="image/*" multiple className="hidden" onChange={(e) => addFiles(e.target.files)} />
                <div className="relative min-w-0 flex-1">
                  <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink/30 dark:text-paper/30">
                    <ExternalLink size={12} />
                  </span>
                  <input
                    value={link}
                    onChange={(e) => setLink(e.target.value)}
                    placeholder="Live project link (e.g. vercel.app/…)"
                    className="cdt-input w-full rounded-full py-1.5 pl-8 pr-3 text-xs outline-none focus:border-cyan-snap/60"
                  />
                </div>
                <button
                  type="button"
                  onClick={submit}
                  disabled={!canSubmit || submitting}
                  className={cn(
                    'flex items-center gap-1.5 rounded-full px-4 py-1.5 text-xs font-bold transition',
                    canSubmit && !submitting
                      ? 'bg-ink text-paper hover:bg-ink-soft dark:bg-paper dark:text-ink dark:hover:bg-paper/85'
                      : 'cursor-not-allowed bg-ink/10 text-ink/40 dark:bg-paper/10 dark:text-paper/40',
                  )}
                >
                  {submitting ? <Loader2 size={12} className="animate-spin" /> : <Send size={12} />}
                  {resubmit ? 'Resubmit for review' : 'Submit for review'}
                </button>
              </div>
              {picked.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {picked.map((src, j) => (
                    <span key={j} className="relative">
                      <img src={src} alt={`Preview ${j + 1}`} className="h-14 w-18 rounded-lg border border-ink/10 object-cover dark:border-paper/10" />
                      <button
                        type="button"
                        onClick={() => setPicked((p) => p.filter((_, k) => k !== j))}
                        className="absolute -right-1.5 -top-1.5 grid h-4 w-4 place-items-center rounded-full bg-coral-deep text-white"
                        aria-label="Remove image"
                      >
                        <Trash2 size={9} />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
