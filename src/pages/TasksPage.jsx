import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Send, Loader2, ExternalLink, Play, CalendarClock, Flag } from 'lucide-react'
import { Page } from '../components/layout/Page.jsx'
import { StudentShell } from '../components/layout/AppShell.jsx'
import { Loader, Empty, StatusBadge, Card } from '../components/ui/StateBits.jsx'
import { RichHTML } from '../components/ui/RichEditor.jsx'
import { useRtdbList } from '../hooks/useRtdbList.js'
import { useMyEnrollments } from '../hooks/useMyEnrollments.js'
import { takeOnTask, submitTask, displayTaskState, isOverdue } from '../lib/rtdb.js'
import { useAuth } from '../context/AuthContext.jsx'
import { useToast } from '../context/ToastContext.jsx'
import { getCourse } from '../data/courses.js'
import { cn } from '../lib/utils.js'

function TaskCard({ task }) {
  const { user } = useAuth()
  const { push } = useToast()
  const { rows: states } = useRtdbList(`taskState/${task.id}`)
  const { rows: subs } = useRtdbList(`taskSubmissions/${task.id}`)
  const [formOpen, setFormOpen] = useState(false)
  const [link, setLink] = useState('')
  const [note, setNote] = useState('')
  const [busy, setBusy] = useState(null)

  const stored = useMemo(() => states.find((s) => s.uid === user?.uid)?.status, [states, user])
  const state = displayTaskState(stored, task.due)
  const mine = useMemo(() => subs.filter((s) => s.uid === user?.uid), [subs, user])
  const course = getCourse(task.courseId)
  const overdue = isOverdue(task.due) && state !== 'completed'

  const start = async () => {
    setBusy('start')
    try {
      await takeOnTask(task.id, user.uid)
      push('Task started — submit your work when ready', 'success')
    } catch {
      push('Could not start task — check connection', 'error')
    } finally {
      setBusy(null)
    }
  }

  const send = async (e) => {
    e.preventDefault()
    if (!link.trim()) return push('Paste your work link (GitHub / deploy URL)', 'error')
    setBusy('send')
    try {
      await submitTask({ taskId: task.id, uid: user.uid, name: user.displayName || user.email, link, note })
      setLink('')
      setNote('')
      setFormOpen(false)
      push('Submitted — a mentor will check it', 'success')
    } catch {
      push('Submit failed — check connection', 'error')
    } finally {
      setBusy(null)
    }
  }

  return (
    <Card>
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-[11px] font-bold uppercase tracking-wider opacity-50">
            {course.title}{task.due ? ` · due ${task.due}` : ' · no due date'}
          </p>
          <h3 className="mt-0.5 font-display text-lg font-bold">{task.title}</h3>
        </div>
        <span className="flex items-center gap-1.5">
          {overdue && state !== 'completed' && (
            <span className="flex items-center gap-1 rounded-full bg-rose-600 px-2.5 py-1 text-[11px] font-extrabold text-white"><Flag size={11} /> Past due</span>
          )}
          <StatusBadge status={state === 'in-progress' ? 'submitted' : state} />
        </span>
      </div>

      <div className="mt-3 rounded-2xl bg-paper p-4 dark:bg-ink">
        <RichHTML html={task.detailHTML} />
      </div>

      {mine.length > 0 && (
        <div className="mt-3 space-y-1.5">
          {mine.slice(0, 3).map((s) => (
            <a key={s.id} href={s.link} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 rounded-2xl border border-ink/8 px-3 py-2 text-xs hover:underline dark:border-paper/10">
              <ExternalLink size={12} className="shrink-0" /> <span className="truncate">{s.link}</span>
              {s.note && <span className="truncate opacity-50">· {s.note}</span>}
            </a>
          ))}
        </div>
      )}

      <div className="mt-3">
        {state === 'completed' && (
          <p className="rounded-2xl bg-emerald-500/12 px-4 py-2.5 text-sm font-bold text-emerald-700 dark:text-emerald-300">
            Approved by your mentor. This task counts toward your certificate.
          </p>
        )}
        {state === 'failed' && (
          <p className="rounded-2xl bg-rose-500/12 px-4 py-2.5 text-sm font-bold text-rose-700 dark:text-rose-300">
            Past the due date. Message your mentor to get it re-opened.
          </p>
        )}
        {state === 'submitted' && (
          <p className="rounded-2xl bg-sky-500/12 px-4 py-2.5 text-sm font-bold text-sky-700 dark:text-sky-300">
            With your mentor for checking — you’ll see Completed here once approved.
          </p>
        )}
        {(!stored || stored === 'pending') && !overdue && (
          <button onClick={start} disabled={busy === 'start'} className="flex items-center gap-1.5 rounded-full bg-ink px-5 py-2.5 text-sm font-bold text-white transition hover:-translate-y-0.5 disabled:opacity-50 dark:bg-paper dark:text-ink">
            {busy === 'start' ? <Loader2 size={14} className="animate-spin" /> : <Play size={14} />} Take on this task
          </button>
        )}
        {(stored === 'in-progress' || (stored === 'submitted' && !overdue)) && !formOpen && state !== 'failed' && (
          <button onClick={() => setFormOpen(true)} className="flex items-center gap-1.5 rounded-full bg-ink px-5 py-2.5 text-sm font-bold text-white transition hover:-translate-y-0.5 dark:bg-paper dark:text-ink">
            <Send size={14} /> {stored === 'submitted' ? 'Submit an update' : 'Submit work for checking'}
          </button>
        )}
        {formOpen && (
          <form onSubmit={send} className="mt-2 grid gap-2 rounded-2xl border border-ink/10 p-3 dark:border-paper/10">
            <input value={link} onChange={(e) => setLink(e.target.value)} placeholder="Work link * (GitHub repo / PR / live URL)" aria-label="Work link" className="cdt-input rounded-xl px-3 py-2 text-sm" />
            <input value={note} onChange={(e) => setNote(e.target.value)} placeholder="Note for your mentor (optional)" aria-label="Note for your mentor" maxLength={300} className="cdt-input rounded-xl px-3 py-2 text-sm" />
            <div className="flex gap-2">
              <button disabled={busy === 'send'} className="flex items-center gap-1.5 rounded-full bg-ink px-4 py-2 text-xs font-bold text-white disabled:opacity-50 dark:bg-paper dark:text-ink">
                {busy === 'send' ? <Loader2 size={13} className="animate-spin" /> : <Send size={13} />} {busy === 'send' ? 'Sending…' : 'Ask mentor to check'}
              </button>
              <button type="button" onClick={() => setFormOpen(false)} className="rounded-full border border-ink/15 px-4 py-2 text-xs font-bold dark:border-paper/15">Cancel</button>
            </div>
          </form>
        )}
      </div>
    </Card>
  )
}

export default function TasksPage() {
  const { courseIds: myCourses, loading: eLoading } = useMyEnrollments()
  const { rows: tasks, loading: tLoading } = useRtdbList('tasks')

  const visible = useMemo(() => tasks.filter((t) => myCourses.includes(t.courseId)), [tasks, myCourses])

  return (
    <Page>
      <StudentShell>
        <h1 className="flex items-center gap-2 font-display text-3xl font-extrabold tracking-tight">
          Tasks <span className={cn('rounded-full px-2.5 py-1 text-xs font-extrabold', visible.length ? 'bg-ink text-white dark:bg-paper dark:text-ink' : 'bg-ink/8 opacity-60 dark:bg-paper/10')}>{visible.length}</span>
        </h1>
        <p className="mt-1 flex items-center gap-1.5 text-sm opacity-60"><CalendarClock size={14} /> Read the brief, take it on, submit — only your mentor can mark it complete.</p>
        {(eLoading || tLoading) && <Loader text="Loading tasks…" />}
        {!eLoading && !tLoading && myCourses.length === 0 && (
          <div className="mt-5"><Empty text="No approved courses yet — tasks appear after admin approval." action={<Link to="/join" className="rounded-full bg-ink px-4 py-2 text-xs font-bold text-white dark:bg-paper dark:text-ink">Check join status</Link>} /></div>
        )}
        {!eLoading && !tLoading && myCourses.length > 0 && visible.length === 0 && (
          <div className="mt-5"><Empty text="No tasks posted for your courses yet — mentors add them after each session." /></div>
        )}
        <div className="mt-5 grid gap-3">
          {visible.map((t) => <TaskCard key={t.id} task={t} />)}
        </div>
      </StudentShell>
    </Page>
  )
}
