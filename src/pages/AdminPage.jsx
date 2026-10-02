import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Search, Download, Check, X, Plus, Pencil, Trash2, Loader2, CalendarCheck, ChevronDown } from 'lucide-react'
import { MessageThread } from '../components/lms/MessageThread.jsx'
import { CustomSelect } from '../components/ui/CustomSelect.jsx'
import { Avatar } from '../components/ui/Avatar.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { Page } from '../components/layout/Page.jsx'
import { AdminShell } from '../components/layout/AppShell.jsx'
import { Loader, Empty, StatusBadge } from '../components/ui/StateBits.jsx'
import { useRtdbList } from '../hooks/useRtdbList.js'
import {
  approveJoinRequest, setJoinStatus, createTask, updateTask, deleteTask,
  markAttendance, reviewPR, updateLeadStatus, sendMessage, sendMentorMessage,
  setTaskState, displayTaskState, setFee, setUserEnrollments, safeKey,
} from '../lib/rtdb.js'
import { useSite } from '../hooks/useSite.js'
import { RichEditor } from '../components/ui/RichEditor.jsx'
import { SITE_DEFAULTS, PALETTES } from '../data/site.js'
import { saveSiteSection, subscribeDoc } from '../lib/rtdb.js'
import { setRead as setReadTs, maxTs } from '../lib/readState.js'
import { useToast } from '../context/ToastContext.jsx'
import { COURSES, getCourse } from '../data/courses.js'
import { cn } from '../lib/utils.js'

const TABS = [
  { id: 'overview', label: 'Overview' },
  { id: 'approvals', label: 'Approvals' },
  { id: 'students', label: 'Students' },
  { id: 'tasks', label: 'Tasks' },
  { id: 'attendance', label: 'Attendance' },
  { id: 'reviews', label: 'PR queue' },
  { id: 'messages', label: 'Messages' },
  { id: 'inbox', label: 'Inbox' },
  { id: 'content', label: 'Content' },
]

function useBusy() {
  const [busy, setBusy] = useState(null)
  const run = async (key, fn, okMsg) => {
    setBusy(key)
    try {
      await fn()
      return true
    } catch {
      return false
    } finally {
      setBusy(null)
    }
  }
  return [busy, run]
}

const today = () => new Date().toISOString().slice(0, 10)

export default function AdminPage() {
  const { tab } = useParams()
  const active = TABS.some((t) => t.id === tab) ? tab : 'overview'
  const { push } = useToast()
  const [busy, run] = useBusy()

  const { rows: users, loading: uLoading } = useRtdbList('users')
  const { rows: joins, loading: jLoading } = useRtdbList('joinRequests')
  const { rows: enrollments } = useRtdbList('enrollments')
  const { rows: tasks } = useRtdbList('tasks')
  const { rows: reviews } = useRtdbList('reviews')
  const { rows: leads } = useRtdbList('leads')
  const { rows: contacts } = useRtdbList('contacts')

  const allStudents = useMemo(() => users.filter((u) => u.role !== 'admin'), [users])

  const requested = joins.filter((j) => j.status === 'requested')
  const decided = joins.filter((j) => j.status !== 'requested')
  const pendingPRs = reviews.filter((r) => r.status === 'pending')
  const donePRs = reviews.filter((r) => r.status !== 'pending')

  const approve = (j) => run(`approve-${j.id}`, () => approveJoinRequest(j)).then((ok) =>
    push(ok ? `${j.fullName || j.email} approved — LMS unlocked` : 'Approve failed — check rules', ok ? 'success' : 'error'))
  const reject = (j) => run(`reject-${j.id}`, () => setJoinStatus(j.id, 'rejected')).then((ok) =>
    push(ok ? 'Request rejected' : 'Failed — check rules', ok ? 'success' : 'error'))
  const decidePR = (id, status) => run(`${status}-${id}`, () => reviewPR(id, status, status === 'approved' ? 'Ship it.' : 'Needs changes — see classroom notes.'))

  return (
    <Page>
      <AdminShell>
        <div className="flex flex-wrap items-center gap-1.5">
          {TABS.map((t) => (
            <Link key={t.id} to={t.id === 'overview' ? '/admin' : `/admin/${t.id}`}
              className={cn('rounded-full px-3.5 py-2 text-[13px] font-bold transition hover:-translate-y-0.5',
                active === t.id ? 'bg-ink text-white shadow-card dark:bg-paper dark:text-ink' : 'border border-ink/10 hover:bg-ink/5 dark:border-paper/10 dark:hover:bg-paper/10')}>
              {t.label}
              {t.id === 'approvals' && requested.length > 0 && <span className="ml-1.5 rounded-full bg-amber-400 px-1.5 text-[11px] text-ink">{requested.length}</span>}
              {t.id === 'reviews' && pendingPRs.length > 0 && <span className="ml-1.5 rounded-full bg-amber-400 px-1.5 text-[11px] text-ink">{pendingPRs.length}</span>}
            </Link>
          ))}
        </div>

        {active === 'overview' && (
          <Overview students={allStudents.length} enrollments={enrollments.length} pendingJoins={requested.length} pendingPRs={pendingPRs.length} tasks={tasks.length} loading={uLoading || jLoading} />
        )}
        {active === 'approvals' && (
          <Approvals requested={requested} decided={decided} busy={busy} onApprove={approve} onReject={reject} loading={jLoading} />
        )}
        {active === 'students' && <Students users={allStudents} enrollments={enrollments} loading={uLoading} busy={busy} run={run} push={push} />}
        {active === 'tasks' && <TasksAdmin tasks={tasks} enrollments={enrollments} users={users} busy={busy} run={run} push={push} />}
        {active === 'attendance' && <AttendanceAdmin students={allStudents} enrollments={enrollments} busy={busy} run={run} push={push} />}
        {active === 'reviews' && <ReviewsAdmin pending={pendingPRs} done={donePRs} busy={busy} onDecide={decidePR} />}
        {active === 'messages' && <MessagesAdmin />}
        {active === 'inbox' && <Inbox leads={leads} contacts={contacts} busy={busy} run={run} push={push} />}
        {active === 'content' && <ContentAdmin busy={busy} run={run} push={push} />}
      </AdminShell>
    </Page>
  )
}

/* ── overview ── */
function Overview({ students, enrollments, pendingJoins, pendingPRs, tasks, loading }) {
  const { rows: joins } = useRtdbList('joinRequests')
  const { rows: reviews } = useRtdbList('reviews')
  if (loading) return <Loader text="Loading admin stats…" />
  const cards = [
    ['Students', students, '#E9E4FF', '/admin/students'],
    ['Join requests', pendingJoins, '#FFF6B8', '/admin/approvals'],
    ['PRs pending', pendingPRs, '#FFE2E2', '/admin/reviews'],
    ['Enrollments', enrollments, '#D9F7E8', '/admin/students'],
    ['Tasks live', tasks, '#E3F2FF', '/admin/tasks'],
  ]
  const topJoins = joins.filter((j) => j.status === 'requested').slice(0, 3)
  const topPRs = reviews.filter((r) => r.status === 'pending').slice(0, 3)
  return (
    <div className="mt-5 grid gap-3">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map(([t, v, bg, to]) => (
          <Link key={t} to={to} className="group rounded-3xl p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-float active:translate-y-0" style={{ background: bg }}>
            <p className="text-xs font-bold uppercase tracking-wider text-ink/50 transition group-hover:text-ink">{t}</p>
            <p className="font-display text-5xl font-extrabold text-ink">{v}</p>
          </Link>
        ))}
        <div className="rounded-3xl bg-ink p-5 text-white transition hover:-translate-y-1 dark:bg-ink-soft">
          <p className="text-xs font-bold uppercase tracking-wider text-white/50">Flow</p>
          <p className="mt-1 text-sm text-white/70">Join form → Google Form → you approve → LMS unlocks on next login.</p>
        </div>
      </div>
      <div className="grid gap-3 lg:grid-cols-2">
        <div className="rounded-3xl border border-ink/10 bg-white p-5 dark:border-paper/10 dark:bg-ink-soft">
          <div className="flex items-center justify-between">
            <h2 className="font-display font-bold">Waiting for approval</h2>
            <Link to="/admin/approvals" className="text-xs font-bold underline">Open queue</Link>
          </div>
          {topJoins.length === 0 && <p className="mt-2 text-xs opacity-50">All clear — no pending join requests.</p>}
          {topJoins.map((j) => (
            <Link key={j.id} to="/admin/approvals" className="mt-2 flex items-center gap-2 rounded-2xl bg-paper px-3 py-2 text-[13px] transition hover:-translate-x-0.5 dark:bg-ink">
              <Avatar name={j.fullName || j.email} size="xs" />
              <span className="min-w-0 flex-1 truncate font-bold">{j.fullName || j.email} <span className="font-normal opacity-50">· {getCourse(j.courseId).title}</span></span>
              <StatusBadge status={j.status} />
            </Link>
          ))}
        </div>
        <div className="rounded-3xl border border-ink/10 bg-white p-5 dark:border-paper/10 dark:bg-ink-soft">
          <div className="flex items-center justify-between">
            <h2 className="font-display font-bold">PRs awaiting review</h2>
            <Link to="/admin/reviews" className="text-xs font-bold underline">Open queue</Link>
          </div>
          {topPRs.length === 0 && <p className="mt-2 text-xs opacity-50">Queue is clear.</p>}
          {topPRs.map((r) => (
            <Link key={r.id} to="/admin/reviews" className="mt-2 flex items-center gap-2 rounded-2xl bg-paper px-3 py-2 text-[13px] transition hover:-translate-x-0.5 dark:bg-ink">
              <span className="min-w-0 flex-1 truncate font-bold">{r.author} <span className="font-normal opacity-50">· {getCourse(r.courseId).title}</span></span>
              <StatusBadge status={r.status} />
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}

/* ── approvals ── */
function Approvals({ requested, decided, busy, onApprove, onReject, loading }) {
  if (loading) return <Loader text="Loading join requests…" />
  return (
    <div className="mt-5 grid gap-2.5">
      {requested.length === 0 && <Empty text="No pending requests — new Join form submissions appear here instantly." />}
      {requested.map((j) => (
        <div key={j.id} className="rounded-3xl border border-amber-500/30 bg-white p-5 dark:border-amber-400/20 dark:bg-ink-soft">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="font-display text-lg font-bold">{j.fullName} <span className="ml-1 rounded-full bg-amber-500/15 px-2 py-0.5 align-middle text-[11px] font-bold text-amber-700 dark:text-amber-300">wants to join</span></p>
              <p className="text-[13px] opacity-60">{j.email} · {j.phone} · {j.education}</p>
              <p className="mt-1 text-[13px]"><b>{getCourse(j.courseId).title}</b>{j.message ? ` · “${j.message}”` : ''}</p>
            </div>
            <StatusBadge status={j.status} />
          </div>
          <div className="mt-3 flex gap-2">
            <button disabled={busy !== null} onClick={() => onApprove(j)} className="flex items-center gap-1.5 rounded-full bg-emerald-600 px-4 py-2 text-xs font-bold text-white transition hover:-translate-y-0.5 disabled:opacity-50">
              {busy === `approve-${j.id}` ? <Loader2 size={13} className="animate-spin" /> : <Check size={13} />} {busy === `approve-${j.id}` ? 'Approving…' : 'Approve → unlock LMS'}
            </button>
            <button disabled={busy !== null} onClick={() => onReject(j)} className="flex items-center gap-1.5 rounded-full border border-rose-500/40 px-4 py-2 text-xs font-bold text-rose-600 transition hover:bg-rose-500/10 disabled:opacity-50 dark:text-rose-400">
              {busy === `reject-${j.id}` ? <Loader2 size={13} className="animate-spin" /> : <X size={13} />} Reject
            </button>
          </div>
        </div>
      ))}
      {decided.length > 0 && (
        <>
          <p className="mt-4 text-xs font-bold uppercase tracking-wider opacity-50">Decided ({decided.length})</p>
          {decided.map((j) => (
            <div key={j.id} className="flex flex-wrap items-center gap-2 rounded-2xl border border-ink/10 bg-white p-3.5 text-sm opacity-80 dark:border-paper/10 dark:bg-ink-soft">
              <b>{j.fullName || j.email}</b>
              <span className="opacity-50">{getCourse(j.courseId).title}</span>
              <span className="ml-auto"><StatusBadge status={j.status} /></span>
            </div>
          ))}
        </>
      )}
    </div>
  )
}

/* ── students ── */
const sameDay = (ts, ref) => {
  const a = new Date(ts)
  const b = new Date(ref)
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate()
}

/* ── students directory: search + sort + date/status/course filters,
      fee tracking (3 installments), LMS access revoke/restore ── */
function Students({ users, enrollments, loading, busy, run, push }) {
  const feePlan = useSite('fees')
  const { rows: feeRows } = useRtdbList('fees')
  const [q, setQ] = useState('')
  const [sort, setSort] = useState('newest')
  const [dateF, setDateF] = useState('all')
  const [customDate, setCustomDate] = useState('')
  const [statusF, setStatusF] = useState('all')
  const [courseF, setCourseF] = useState('all')

  const feesOf = (uid) => feeRows.find((f) => f.id === uid.replace(/[.#$/[\]]/g, '_'))
  const activeOf = (uid) => enrollments.filter((e) => e.uid === uid && e.status === 'active')
  const removedOf = (uid) => enrollments.filter((e) => e.uid === uid && e.status === 'removed')

  const feeState = (uid) => {
    const f = feesOf(uid) || {}
    const states = [f.i1 || 'pending', f.i2 || 'pending', f.i3 || 'pending']
    const paid = states.filter((s) => s === 'paid').length
    return { states, paid, label: paid === 3 ? 'paid' : paid === 0 ? 'pending' : `${paid}/3 paid` }
  }

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase()
    const now = Date.now()
    let list = users.filter((u) => u.role !== 'admin')
    if (s) list = list.filter((u) => [u.name, u.email].filter(Boolean).join(' ').toLowerCase().includes(s))
    if (statusF === 'joined') list = list.filter((u) => activeOf(u.uid).length > 0)
    if (statusF === 'new') list = list.filter((u) => activeOf(u.uid).length === 0 && removedOf(u.uid).length === 0)
    if (statusF === 'removed') list = list.filter((u) => removedOf(u.uid).length > 0)
    if (courseF !== 'all') list = list.filter((u) => activeOf(u.uid).some((e) => e.courseId === courseF))
    if (dateF === 'today') list = list.filter((u) => u.lastLogin && sameDay(u.lastLogin, now))
    if (dateF === 'yesterday') list = list.filter((u) => u.lastLogin && sameDay(u.lastLogin, now - 86400000))
    if (dateF === 'custom' && customDate) list = list.filter((u) => u.lastLogin && sameDay(u.lastLogin, new Date(`${customDate}T12:00:00`).getTime()))
    list = [...list].sort((a, b) => {
      if (sort === 'name') return String(a.name || a.email || '').localeCompare(String(b.name || b.email || ''))
      if (sort === 'oldest') return (a.lastLogin || 0) - (b.lastLogin || 0)
      return (b.lastLogin || 0) - (a.lastLogin || 0)
    })
    return list
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [users, enrollments, feeRows, q, sort, dateF, customDate, statusF, courseF])

  const toggleFee = async (uid, idx, cur) => {
    const next = cur === 'paid' ? 'pending' : 'paid'
    const ok = await run(`fee-${uid}-${idx}`, () => setFee(uid, idx, next))
    push(ok ? `Installment ${idx} marked ${next}` : 'Fee update failed', ok ? 'success' : 'error')
  }

  const revoke = async (u) => {
    if (!confirm(`Remove ${u.name || u.email} from the LMS? Their courses, tasks and messages lock immediately.`)) return
    const ok = await run(`access-${u.uid}`, () => setUserEnrollments(u.uid, 'removed', enrollments))
    push(ok ? 'Access removed — LMS locked for this student' : 'Remove failed', ok ? 'success' : 'error')
  }

  const restore = async (u) => {
    const ok = await run(`access-${u.uid}`, () => setUserEnrollments(u.uid, 'active', enrollments))
    push(ok ? 'Access restored' : 'Restore failed', ok ? 'success' : 'error')
  }

  const csv = () => {
    const head = 'name,email,courses,fees,linkedin,github\n'
    const body = filtered.map((s) => {
      const enr = activeOf(s.uid).map((e) => e.courseId).join(';')
      const fee = feeState(s.uid).label
      return `"${s.name || ''}","${s.email || ''}","${enr}","${fee}","${s.linkedin || ''}","${s.github || ''}"`
    }).join('\n')
    const a = document.createElement('a')
    a.href = URL.createObjectURL(new Blob([head + body], { type: 'text/csv' }))
    a.download = 'codetern-students.csv'
    a.click()
  }

  if (loading) return <Loader text="Loading students…" />

  const pill = (on) => cn('rounded-full px-3.5 py-1.5 text-xs font-bold transition hover:-translate-y-0.5',
    on ? 'bg-ink text-white dark:bg-paper dark:text-ink' : 'border border-ink/15 opacity-60 hover:opacity-100 dark:border-paper/15')

  return (
    <div className="mt-5 grid gap-3">
      <div className="rounded-3xl border border-ink/10 bg-white p-4 dark:border-paper/10 dark:bg-ink-soft">
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative min-w-44 flex-1">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 opacity-40" />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search name or email…" className="cdt-input w-full rounded-full py-2 pl-9 pr-3 text-sm" />
          </div>
          <span className="w-40"><CustomSelect value={sort} onChange={setSort} compact
            options={[{ value: 'newest', label: 'Newest first' }, { value: 'oldest', label: 'Oldest first' }, { value: 'name', label: 'Name A–Z' }]} /></span>
          <span className="w-44"><CustomSelect value={courseF} onChange={setCourseF} compact
            options={[{ value: 'all', label: 'All courses' }, ...COURSES.map((c) => ({ value: c.id, label: c.title }))]} /></span>
          <button onClick={csv} className="flex items-center gap-1 rounded-full border border-ink/15 px-3.5 py-2 text-xs font-bold dark:border-paper/15"><Download size={13} /> Export</button>
        </div>
        <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
          <span className="text-[11px] font-bold uppercase tracking-wider opacity-40">Status:</span>
          {[['all', 'All'], ['joined', 'Joined'], ['new', 'New signups'], ['removed', 'Removed']].map(([v, l]) => (
            <button key={v} onClick={() => setStatusF(v)} className={pill(statusF === v)}>{l}</button>
          ))}
          <span className="ml-2 text-[11px] font-bold uppercase tracking-wider opacity-40">Active:</span>
          {[['all', 'Any time'], ['today', 'Today'], ['yesterday', 'Yesterday'], ['custom', 'Pick date']].map(([v, l]) => (
            <button key={v} onClick={() => setDateF(v)} className={pill(dateF === v)}>{l}</button>
          ))}
          {dateF === 'custom' && (
            <input type="date" value={customDate} max={new Date().toISOString().slice(0, 10)} onChange={(e) => setCustomDate(e.target.value)}
              className="rounded-full border border-ink/15 bg-transparent px-3 py-1.5 text-xs dark:border-paper/15" />
          )}
        </div>
      </div>

      <div className="overflow-x-auto rounded-3xl border border-ink/10 bg-white dark:border-paper/10 dark:bg-ink-soft">
        <div className="flex items-center justify-between p-4">
          <p className="text-sm font-bold">{filtered.length} student{filtered.length === 1 ? '' : 's'}</p>
          <p className="text-[11px] opacity-50">Fees: {(feePlan.installments || []).map((x) => x.amount).join(' · ')}</p>
        </div>
        <table className="w-full min-w-[980px] text-left text-sm">
          <thead><tr className="border-b border-dashed border-ink/15 opacity-50 dark:border-paper/15">{['Student', 'Courses', 'Fees (3)', 'Links', 'Status', 'Access'].map((h) => <th key={h} className="px-4 py-3">{h}</th>)}</tr></thead>
          <tbody>
            {filtered.map((s) => {
              const enr = activeOf(s.uid)
              const removed = removedOf(s.uid).length > 0 && enr.length === 0
              const fee = feeState(s.uid)
              const link = (url, label) => url
                ? <a href={url} target="_blank" rel="noreferrer" className="text-sky-600 underline hover:opacity-80 dark:text-sky-400">{label}</a>
                : <span className="opacity-40">—</span>
              return (
                <tr key={s.id} className="border-b border-ink/5 transition last:border-0 hover:bg-paper/60 dark:border-paper/5 dark:hover:bg-ink">
                  <td className="px-4 py-3">
                    <span className="flex items-center gap-2">
                      <Avatar name={s.name || s.email} photo={s.photo} size="xs" />
                      <span className="min-w-0"><span className="block truncate font-bold">{s.name || '—'}</span>
                        <span className="block truncate text-[11px] opacity-50">{s.email}</span></span>
                    </span>
                  </td>
                  <td className="max-w-44 px-4 py-3 text-xs">{enr.length ? enr.map((e) => getCourse(e.courseId).title).join(', ') : <span className="opacity-50">{removed ? 'access removed' : 'awaiting approval'}</span>}</td>
                  <td className="px-4 py-3">
                    <span className="flex items-center gap-1" title={(feePlan.installments || []).map((x, i) => `${x.label}: ${x.amount} — ${fee.states[i]}`).join('\n')}>
                      {fee.states.map((st, i) => (
                        <button key={i} disabled={busy === `fee-${s.uid}-${i + 1}`} onClick={() => toggleFee(s.uid, i + 1, st)} title={`Installment ${i + 1}: ${st} — click to flip`}
                          className={cn('h-4 w-4 rounded-full border-2 transition hover:scale-125 disabled:opacity-50',
                            st === 'paid' ? 'border-emerald-500 bg-emerald-500' : 'border-amber-500/60 bg-transparent')}>
                          {busy === `fee-${s.uid}-${i + 1}` && <Loader2 size={8} className="animate-spin" />}
                        </button>
                      ))}
                      <span className={cn('ml-1.5 rounded-full px-2 py-0.5 text-[10px] font-extrabold',
                        fee.paid === 3 ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300' : fee.paid === 0 ? 'bg-rose-500/15 text-rose-700 dark:text-rose-300' : 'bg-amber-500/15 text-amber-700 dark:text-amber-300')}>
                        {fee.label}
                      </span>
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-xs">{link(s.linkedin, 'In')} · {link(s.github, 'GH')}</td>
                  <td className="px-4 py-3"><StatusBadge status={removed ? 'rejected' : enr.length ? 'active' : 'requested'} /></td>
                  <td className="px-4 py-3">
                    {removed || (!enr.length && removedOf(s.uid).length > 0) ? (
                      <button disabled={busy === `access-${s.uid}`} onClick={() => restore(s)}
                        className="rounded-full border border-emerald-500/50 px-3 py-1.5 text-[11px] font-bold text-emerald-700 disabled:opacity-50 dark:text-emerald-300">
                        {busy === `access-${s.uid}` ? '…' : 'Restore'}
                      </button>
                    ) : (
                      <button disabled={busy === `access-${s.uid}` || !enr.length} onClick={() => revoke(s)} title={enr.length ? 'Lock LMS immediately' : 'No active access to remove'}
                        className="rounded-full border border-rose-500/40 px-3 py-1.5 text-[11px] font-bold text-rose-600 disabled:opacity-30 dark:text-rose-400">
                        {busy === `access-${s.uid}` ? '…' : 'Remove'}
                      </button>
                    )}
                  </td>
                </tr>
              )
            })}
            {filtered.length === 0 && <tr><td colSpan={6} className="px-4 py-8 text-center opacity-60">Nobody matches these filters.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  )
}

/* ── tasks admin: rich briefs + per-student completion (strictly admin) ── */
function TasksAdmin({ tasks, enrollments, users, busy, run, push }) {
  const [form, setForm] = useState({ courseId: 'ai-llms', title: '', detailHTML: '', due: '' })
  const [editing, setEditing] = useState(null)
  const [openId, setOpenId] = useState(null)

  const save = async (e) => {
    e.preventDefault()
    if (!form.title.trim()) return push('Task needs a title', 'error')
    if (!form.due) return push('Set a due date — students see it and overdue tasks fail', 'error')
    const ok = await run('task-save', () => editing
      ? updateTask(editing, { ...form })
      : createTask(form))
    if (ok) {
      push(editing ? 'Task updated for all students' : 'Task posted to students', 'success')
      setForm({ courseId: 'ai-llms', title: '', detailHTML: '', due: '' })
      setEditing(null)
    } else push('Save failed — check rules', 'error')
  }

  const del = async (id) => {
    if (!confirm('Delete this task for all students?')) return
    const ok = await run(`task-del-${id}`, () => deleteTask(id))
    push(ok ? 'Task deleted' : 'Delete failed', ok ? 'success' : 'error')
  }

  return (
    <div className="mt-5 grid gap-3">
      <form onSubmit={save} className="grid gap-2.5 rounded-3xl border border-ink/10 bg-white p-5 dark:border-paper/10 dark:bg-ink-soft">
        <h2 className="flex items-center gap-1.5 font-display font-bold"><Plus size={16} /> {editing ? 'Edit task' : 'Post a task with a due date'}</h2>
        <div className="grid gap-2.5 sm:grid-cols-[200px_1fr_180px]">
          <CustomSelect value={form.courseId} onChange={(v) => setForm({ ...form, courseId: v })}
            options={COURSES.map((c) => ({ value: c.id, label: c.title }))} placeholder="Course" />
          <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Task title * (e.g. RAG retriever v1)" className="cdt-input rounded-2xl px-4 py-2.5 text-sm" />
          <input type="date" value={form.due} onChange={(e) => setForm({ ...form, due: e.target.value })}
            title="Due date * — past-due incomplete tasks are marked failed"
            className="cdt-input rounded-2xl border border-ink/12 bg-white px-4 py-2.5 text-sm text-ink dark:border-paper/15 dark:bg-ink dark:text-paper" />
        </div>
        <RichEditor value={form.detailHTML} onChange={(v) => setForm({ ...form, detailHTML: v })} />
        <div className="flex gap-2">
          <button disabled={busy === 'task-save'} className="flex items-center gap-1.5 rounded-full bg-ink px-5 py-2.5 text-sm font-bold text-white disabled:opacity-50 dark:bg-paper dark:text-ink">
            {busy === 'task-save' ? <Loader2 size={14} className="animate-spin" /> : editing ? <Pencil size={14} /> : <Plus size={14} />}
            {busy === 'task-save' ? 'Saving…' : editing ? 'Save changes' : 'Post task'}
          </button>
          {editing && <button type="button" onClick={() => { setEditing(null); setForm({ courseId: 'ai-llms', title: '', detailHTML: '', due: '' }) }} className="rounded-full border border-ink/15 px-5 py-2.5 text-sm font-bold dark:border-paper/15">Cancel</button>}
        </div>
      </form>

      {tasks.length === 0 && <Empty text="No tasks yet — post the first one above." />}
      {tasks.map((t) => (
        <TaskProgressRow key={t.id} task={t} open={openId === t.id} onToggle={() => setOpenId(openId === t.id ? null : t.id)}
          enrollments={enrollments} users={users} busy={busy} run={run} push={push}
          onEdit={() => { setEditing(t.id); setForm({ courseId: t.courseId, title: t.title, detailHTML: t.detailHTML || '', due: t.due || '' }); window.scrollTo({ top: 0, behavior: 'smooth' }) }}
          onDelete={() => del(t.id)} />
      ))}
    </div>
  )
}

function TaskProgressRow({ task, open, onToggle, enrollments, users, busy, run, push, onEdit, onDelete }) {
  const { rows: states } = useRtdbList(`taskState/${task.id}`)
  const { rows: subs } = useRtdbList(`taskSubmissions/${task.id}`)
  const roster = useMemo(() => enrollments.filter((e) => e.courseId === task.courseId && e.status === 'active'), [enrollments, task.courseId])
  const doneCount = roster.filter((s) => states.find((st) => st.uid === s.uid)?.status === 'completed').length

  const setState = async (uid, status) => {
    const ok = await run(`ts-${task.id}-${uid}`, () => setTaskState(task.id, uid, status))
    push(ok ? (status === 'completed' ? 'Marked complete — counts toward certificate' : 'Re-opened to pending') : 'Update failed', ok ? 'success' : 'error')
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-ink/10 bg-white dark:border-paper/10 dark:bg-ink-soft">
      <button onClick={onToggle} aria-expanded={open}
        className="flex w-full flex-wrap items-center gap-2 p-4 text-left text-sm transition hover:bg-paper/70 dark:hover:bg-ink">
        <span className={cn('grid h-8 w-8 shrink-0 place-items-center rounded-full border border-ink/10 transition-transform duration-300 dark:border-paper/15', open && 'rotate-180 bg-ink text-white dark:bg-paper dark:text-ink')}>
          <ChevronDown size={15} />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block font-bold">{task.title}</span>
          <span className="block text-xs opacity-50">{getCourse(task.courseId).title}{task.due ? ` · due ${task.due}` : ''} · {doneCount}/{roster.length} completed</span>
        </span>
        <span className="h-2 w-24 overflow-hidden rounded-full bg-ink/10 dark:bg-paper/10">
          <span className="block h-full rounded-full bg-emerald-500" style={{ width: `${roster.length ? Math.round((doneCount / roster.length) * 100) : 0}%` }} />
        </span>
        <span className="flex gap-1.5" onClick={(e) => e.stopPropagation()}>
          <span onClick={onEdit} title="Edit brief" className="cursor-pointer rounded-full border border-ink/15 p-1.5 dark:border-paper/15"><Pencil size={12} /></span>
          <span onClick={onDelete} title="Delete task" className="cursor-pointer rounded-full border border-rose-500/40 p-1.5 text-rose-600 dark:text-rose-400"><Trash2 size={12} /></span>
        </span>
      </button>
      {open && (
        <div className="grid gap-1.5 border-t border-ink/8 p-4 dark:border-paper/10">
          {roster.length === 0 && <p className="text-xs opacity-50">No enrolled students in this course yet.</p>}
          {roster.map((s) => {
            const st = states.find((x) => x.uid === s.uid)
            const latest = subs.filter((x) => x.uid === s.uid)[0]
            const status = st?.status || 'pending'
            return (
              <div key={s.id} className="flex flex-wrap items-center gap-2 rounded-xl bg-paper px-3 py-2 text-[13px] dark:bg-ink">
                <Avatar name={s.name || s.email} size="xs" />
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-bold">{s.name || s.email}</span>
                  {latest && <a href={latest.link} target="_blank" rel="noreferrer" className="block truncate text-[11px] text-sky-600 underline dark:text-sky-400">{latest.link}</a>}
                </span>
                <StatusBadge status={displayTaskState(status, task.due)} />
                {status === 'completed' ? (
                  <button disabled={busy === `ts-${task.id}-${s.uid}`} onClick={() => setState(s.uid, 'pending')}
                    className="rounded-full border border-amber-500/50 px-3 py-1.5 text-[11px] font-bold text-amber-700 disabled:opacity-50 dark:text-amber-300">
                    {busy === `ts-${task.id}-${s.uid}` ? '…' : 'Re-open'}
                  </button>
                ) : (
                  <button disabled={busy === `ts-${task.id}-${s.uid}`} onClick={() => setState(s.uid, 'completed')}
                    className="flex items-center gap-1 rounded-full bg-emerald-600 px-3 py-1.5 text-[11px] font-bold text-white disabled:opacity-50">
                    {busy === `ts-${task.id}-${s.uid}` ? <Loader2 size={11} className="animate-spin" /> : <Check size={11} />} Complete
                  </button>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

/* ── attendance admin ── */
function AttendanceAdmin({ students, enrollments, busy, run, push }) {
  const [courseId, setCourseId] = useState('ai-llms')
  const [date, setDate] = useState(today())
  const { rows: dayRows, loading } = useRtdbList(`attendance/${courseId}/${date}`)
  const marked = useMemo(() => Object.fromEntries(dayRows.map((r) => [r.uid, r.present])), [dayRows])
  // only students enrolled in the selected course (default: AI & LLMs)
  const roster = useMemo(() => {
    const ids = new Set(enrollments.filter((e) => e.courseId === courseId && e.status === 'active').map((e) => e.uid))
    return students.filter((s) => ids.has(s.uid))
  }, [students, enrollments, courseId])
  const presentCount = roster.filter((s) => marked[s.uid]).length

  const toggle = async (s, present) => {
    const ok = await run(`att-${s.uid}`, () => markAttendance({ date, courseId, uid: s.uid, name: s.name || s.email, present }))
    if (!ok) push('Save failed — check rules', 'error')
  }

  return (
    <div className="mt-5 rounded-3xl border border-ink/10 bg-white p-5 dark:border-paper/10 dark:bg-ink-soft">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="flex items-center gap-1.5 font-display font-bold"><CalendarCheck size={17} /> Mark attendance <span className="text-xs font-normal opacity-50">(after the Google Meet)</span></h2>
        <span className="rounded-full bg-emerald-500/12 px-3 py-1 text-xs font-extrabold text-emerald-700 dark:text-emerald-300">{presentCount}/{roster.length} present</span>
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        <div className="min-w-52 flex-1 sm:max-w-64">
          <CustomSelect value={courseId} onChange={setCourseId} compact
            options={COURSES.map((c) => ({ value: c.id, label: c.title }))} placeholder="Course" />
        </div>
        <input type="date" value={date} max={today()} onChange={(e) => setDate(e.target.value)}
          className="cdt-input rounded-2xl border border-ink/12 bg-white px-4 py-2 text-sm text-ink dark:border-paper/15 dark:bg-ink dark:text-paper" />
      </div>
      {loading && <Loader text="Loading that day…" />}
      {!loading && (
        <div className="mt-3 grid gap-1.5">
          {roster.length === 0 && <Empty text={`Nobody enrolled in ${getCourse(courseId).title} yet — approve joins first.`} />}
          {roster.map((s) => {
            const state = marked[s.uid]
            return (
              <div key={s.id} className="flex items-center gap-2 rounded-2xl bg-paper px-3.5 py-2.5 text-sm dark:bg-ink">
                <span className="min-w-0 flex-1 truncate font-bold">{s.name || s.email}</span>
                {state !== undefined && <StatusBadge status={state ? 'present' : 'absent'} />}
                <button disabled={busy === `att-${s.uid}`} onClick={() => toggle(s, true)}
                  className={cn('rounded-full px-3.5 py-1.5 text-xs font-bold transition', state === true ? 'bg-emerald-600 text-white' : 'border border-ink/15 hover:bg-emerald-500/10 dark:border-paper/15')}>
                  {busy === `att-${s.uid}` ? '…' : 'Present'}
                </button>
                <button disabled={busy === `att-${s.uid}`} onClick={() => toggle(s, false)}
                  className={cn('rounded-full px-3.5 py-1.5 text-xs font-bold transition', state === false ? 'bg-rose-600 text-white' : 'border border-ink/15 hover:bg-rose-500/10 dark:border-paper/15')}>
                  {busy === `att-${s.uid}` ? '…' : 'Absent'}
                </button>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

/* ── PR queue admin ── */
function ReviewsAdmin({ pending, done, busy, onDecide }) {
  return (
    <div className="mt-5 grid gap-2.5">
      {pending.length === 0 && <Empty text="Queue is clear — student PR submissions land here." />}
      {pending.map((r) => (
        <div key={r.id} className="rounded-3xl border border-amber-500/30 bg-white p-5 dark:border-amber-400/20 dark:bg-ink-soft">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div className="min-w-0">
              <a href={r.prUrl} target="_blank" rel="noreferrer" className="block truncate font-bold hover:underline">{r.prUrl}</a>
              <p className="text-xs opacity-60">{r.author} · {getCourse(r.courseId).title}{r.notes ? ` · “${r.notes}”` : ''}</p>
            </div>
            <StatusBadge status={r.status} />
          </div>
          <div className="mt-3 flex gap-2">
            <button disabled={busy !== null} onClick={() => onDecide(r.id, 'approved')} className="flex items-center gap-1.5 rounded-full bg-emerald-600 px-4 py-2 text-xs font-bold text-white disabled:opacity-50">
              {busy === `approved-${r.id}` ? <Loader2 size={13} className="animate-spin" /> : <Check size={13} />} Approve
            </button>
            <button disabled={busy !== null} onClick={() => onDecide(r.id, 'changes')} className="flex items-center gap-1.5 rounded-full bg-rose-600 px-4 py-2 text-xs font-bold text-white disabled:opacity-50">
              {busy === `changes-${r.id}` ? <Loader2 size={13} className="animate-spin" /> : <X size={13} />} Request changes
            </button>
          </div>
        </div>
      ))}
      {done.length > 0 && (
        <>
          <p className="mt-3 text-xs font-bold uppercase tracking-wider opacity-50">Decided ({done.length})</p>
          {done.map((r) => (
            <div key={r.id} className="flex flex-wrap items-center gap-2 rounded-2xl border border-ink/10 bg-white p-3.5 text-sm opacity-80 dark:border-paper/10 dark:bg-ink-soft">
              <span className="min-w-0 flex-1 truncate">{r.prUrl}</span>
              <StatusBadge status={r.status} />
            </div>
          ))}
        </>
      )}
    </div>
  )
}

/* ── messages admin: broadcast to everyone or DM one student ── */
function MessagesAdmin() {
  const { user } = useAuth()
  const { push } = useToast()
  const { rows: users } = useRtdbList('users')
  const { rows: feeRows } = useRtdbList('fees')
  const feePlan = useSite('fees')
  const templates = useSite('templates')
  const [target, setTarget] = useState('everyone') // 'everyone' | student uid
  const [q, setQ] = useState('')
  const [text, setText] = useState('')
  const [important, setImportant] = useState(false)
  const [sending, setSending] = useState(false)

  const applyTemplate = (body) => {
    const t = target !== 'everyone' ? users.find((u) => u.uid === target) : null
    const name = t?.name || t?.email?.split('@')[0] || 'there'
    const fr = t ? feeRows.find((f) => f.id === safeKey(t.uid)) : null
    const states = [fr?.i1, fr?.i2, fr?.i3]
    const idx = states.findIndex((s) => s !== 'paid')
    const inst = idx >= 0 ? (feePlan.installments || [])[idx] : null
    setText(body
      .replaceAll('{name}', name)
      .replaceAll('{amount}', inst?.amount || '')
      .replaceAll('{label}', inst?.label || '')
      .replaceAll('{link}', ''))
  }

  const students = useMemo(() => {
    const s = q.trim().toLowerCase()
    return users
      .filter((u) => u.role !== 'admin')
      .filter((u) => !s || [u.name, u.email].filter(Boolean).join(' ').toLowerCase().includes(s))
  }, [users, q])

  const targetStudent = target !== 'everyone' ? users.find((u) => u.uid === target) : null
  const threadPath = target === 'everyone' ? 'messages/everyone' : `mentorChats/${target}`

  const send = async (e) => {
    e.preventDefault()
    if (!text.trim()) return
    setSending(true)
    try {
      const payload = { name: user.displayName || 'Mentor', text, uid: user.uid, important }
      if (target === 'everyone') await sendMessage('everyone', payload)
      else await sendMentorMessage(target, payload)
      setText('')
      setImportant(false)
      push(target === 'everyone' ? 'Broadcast sent to everyone' : `Sent to ${targetStudent?.name || targetStudent?.email}`, 'success')
    } catch {
      push('Send failed — check connection', 'error')
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="mt-5 grid gap-4 lg:grid-cols-[300px_1fr]">
      <div className="h-fit rounded-3xl border border-ink/10 bg-white p-4 dark:border-paper/10 dark:bg-ink-soft">
        <p className="px-1 text-[11px] font-bold uppercase tracking-wider opacity-50">Send to</p>
        <button onClick={() => setTarget('everyone')}
          className={cn('mt-2 flex w-full items-center gap-2.5 rounded-2xl p-3 text-left transition',
            target === 'everyone' ? 'bg-ink text-white dark:bg-paper dark:text-ink' : 'hover:bg-paper dark:hover:bg-ink')}>
          <span className="grid h-9 w-9 place-items-center rounded-full bg-gradient-to-br from-ink to-ink-soft font-display text-xs font-extrabold text-neon dark:from-paper dark:to-white/70 dark:text-ink">All</span>
          <span><span className="block text-sm font-bold">Everyone</span><span className="block text-[11px] opacity-60">Whole batch · Meet links go here</span></span>
        </button>
        <div className="relative mt-3">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 opacity-40" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search a student…" className="cdt-input w-full rounded-full py-2 pl-9 pr-3 text-sm" />
        </div>
        <div className="cdt-scroll-slim mt-2 max-h-72 space-y-1 overflow-y-auto">
          {students.map((s) => (
            <button key={s.id} onClick={() => setTarget(s.uid)}
              className={cn('flex w-full items-center gap-2.5 rounded-2xl p-2.5 text-left transition',
                target === s.uid ? 'bg-ink text-white dark:bg-paper dark:text-ink' : 'hover:bg-paper dark:hover:bg-ink')}>
              <Avatar name={s.name || s.email} photo={s.photo} size="xs" />
              <span className="min-w-0"><span className="block truncate text-sm font-bold">{s.name || 'Student'}</span><span className="block truncate text-[11px] opacity-60">{s.email}</span></span>
            </button>
          ))}
          {students.length === 0 && <p className="p-3 text-center text-xs opacity-50">No students match.</p>}
        </div>
      </div>

      <div>
      <MessageThread
        key={threadPath}
        path={threadPath}
        onRead={(rows) => setReadTs('admin-feed', maxTs(rows))}
        sendTo={target === 'everyone' ? 'everyone' : 'mentor'}
        sendUid={target === 'everyone' ? undefined : target}
          title={target === 'everyone' ? 'Everyone' : (targetStudent?.name || targetStudent?.email || 'Student')}
          subtitle={target === 'everyone' ? 'Broadcast + Google Meet links' : `Private mentor thread · ${targetStudent?.email || ''}`}
          announce={target === 'everyone'}
          allowImportant
        />
        <form onSubmit={send} className="mt-3 rounded-3xl border border-ink/10 bg-white p-4 dark:border-paper/10 dark:bg-ink-soft">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-xs font-bold opacity-60">
              Quick send to {target === 'everyone' ? 'everyone' : (targetStudent?.name || 'student')}:
            </p>
            {(templates.items?.length ? templates.items : []).length > 0 && (
              <span className="w-52">
                <CustomSelect value="" onChange={(v) => { const t = (templates.items || []).find((x) => x.title === v); if (t) applyTemplate(t.body) }} compact
                  options={[{ value: '', label: 'Use a template…' }, ...(templates.items || []).filter((t) => t.title).map((t) => ({ value: t.title, label: t.title }))]} />
              </span>
            )}
          </div>
          <div className="mt-2 flex gap-2">
            <input value={text} onChange={(e) => setText(e.target.value)} placeholder="https://meet.google.com/… or any update" className="cdt-input min-w-0 flex-1 rounded-full px-4 py-2.5 text-sm" />
            <label className="flex shrink-0 cursor-pointer items-center gap-1.5 text-xs font-bold text-rose-600 dark:text-rose-400">
              <input type="checkbox" checked={important} onChange={(e) => setImportant(e.target.checked)} className="h-4 w-4 accent-rose-600" /> Important
            </label>
            <button disabled={sending || !text.trim()} className="shrink-0 rounded-full bg-ink px-5 py-2.5 text-sm font-bold text-white disabled:opacity-50 dark:bg-paper dark:text-ink">
              {sending ? 'Sending…' : 'Send'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

/* ── legacy inbox ── */
function Inbox({ leads, contacts, busy, run, push }) {
  const all = [...leads.map((l) => ({ ...l, kind: 'lead' })), ...contacts.map((c) => ({ ...c, kind: 'contact', fullName: c.name }))]
  const setStatus = (r, status) => run(`inbox-${r.id}`, () => updateLeadStatus(`${r.kind}s`, r.id, status))
    .then((ok) => { if (!ok) push('Update failed', 'error') })
  return (
    <div className="mt-5 grid gap-2">
      {all.length === 0 && <Empty text="Legacy inbox is empty. New join requests live under Approvals." />}
      {all.map((r) => (
        <div key={`${r.kind}-${r.id}`} className="flex flex-wrap items-center gap-2 rounded-2xl border border-ink/10 bg-white p-3.5 text-sm dark:border-paper/10 dark:bg-ink-soft">
          <span className="rounded-full bg-ink/5 px-2 py-0.5 text-[11px] font-bold dark:bg-paper/10">{r.kind}</span>
          <b>{r.fullName || r.name || r.email}</b>
          <span className="opacity-50">{r.email} · {r.phone || r.message || ''}</span>
          <span className="ml-auto flex items-center gap-2">
            <StatusBadge status={r.status} />
            <span className="w-32">
              <CustomSelect value={r.status || 'new'} onChange={(v) => setStatus(r, v)} compact
                options={['new', 'contacted', 'accepted', 'rejected']} />
            </span>
          </span>
        </div>
      ))}
    </div>
  )
}

/* ── content CMS: control home / courses / pricing / about copy ── */
const CONTENT_GROUPS = [
  { label: 'Pages & content', ids: ['home', 'quote', 'week', 'stats', 'cta', 'courses', 'pricing', 'about', 'faqs', 'footer'] },
  { label: 'Fees & messages', ids: ['fees', 'templates'] },
  { label: 'Look & feel', ids: ['theme', 'motion'] },
]
const CONTENT_LABELS = {
  home: 'Homepage', quote: 'Quote', week: 'Week band', stats: 'Stats', cta: 'Closing CTA',
  courses: 'Courses page', pricing: 'Pricing page', about: 'About page', faqs: 'Contact FAQs',
  footer: 'Footer', fees: 'Fee installments', templates: 'Message templates', theme: 'Palette', motion: 'Animations',
}

function ContentAdmin({ busy, run, push }) {
  const [section, setSection] = useState('home')
  const [form, setForm] = useState(SITE_DEFAULTS.home)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    setLoaded(false)
    const off = subscribeDoc(`siteContent/${section}`, (doc) => {
      setForm({ ...SITE_DEFAULTS[section], ...(doc || {}) })
      setLoaded(true)
    })
    return off
  }, [section])

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }))

  const save = async () => {
    const ok = await run('site-save', () => saveSiteSection(section, form))
    push(ok ? 'Published — live on the site now' : 'Publish failed', ok ? 'success' : 'error')
  }

  const reset = async () => {
    if (!confirm('Reset this page to defaults?')) return
    const ok = await run('site-save', () => saveSiteSection(section, SITE_DEFAULTS[section]))
    push(ok ? 'Reset to defaults' : 'Reset failed', ok ? 'success' : 'error')
  }

  const inputCls = 'w-full rounded-2xl border border-ink/12 bg-white px-4 py-2.5 text-sm text-ink outline-none transition focus:border-ink/40 dark:border-paper/15 dark:bg-ink dark:text-paper'
  const labelCls = 'mb-1 block text-xs font-bold uppercase tracking-wider opacity-50'

  return (
    <div className="mt-5 grid gap-4">
      {CONTENT_GROUPS.map((g) => (
        <div key={g.label} className="rounded-3xl border border-ink/10 bg-white/60 p-3 dark:border-paper/10 dark:bg-ink-soft/60">
          <p className="px-2 pb-2 text-[10px] font-extrabold uppercase tracking-[0.18em] opacity-40">{g.label}</p>
          <div className="flex flex-wrap gap-1.5">
            {g.ids.map((id) => (
              <button key={id} onClick={() => setSection(id)}
                className={cn('rounded-full px-4 py-2 text-[13px] font-bold transition hover:-translate-y-0.5',
                  section === id ? 'bg-ink text-white shadow-card dark:bg-paper dark:text-ink' : 'border border-ink/10 bg-white hover:bg-ink/5 dark:border-paper/10 dark:bg-ink-soft dark:hover:bg-paper/10')}>
                {CONTENT_LABELS[id]}
              </button>
            ))}
          </div>
        </div>
      ))}

      {!loaded && <Loader text="Loading saved copy…" />}

      {loaded && section === 'home' && (
        <div className="grid gap-3 rounded-3xl border border-ink/10 bg-white p-5 dark:border-paper/10 dark:bg-ink-soft">
          <h2 className="font-display font-bold">Homepage hero</h2>
          <div className="grid gap-3 sm:grid-cols-3">
            <label className="block"><span className={labelCls}>Top badge</span><input value={form.badge} onChange={(e) => set('badge', e.target.value)} className={inputCls} /></label>
            <label className="block"><span className={labelCls}>Title line 1</span><input value={form.titleA} onChange={(e) => set('titleA', e.target.value)} className={inputCls} /></label>
            <label className="block"><span className={labelCls}>Title line 2 (gradient)</span><input value={form.titleB} onChange={(e) => set('titleB', e.target.value)} className={inputCls} /></label>
          </div>
          <label className="block"><span className={labelCls}>Subtitle</span><textarea value={form.subtitle} onChange={(e) => set('subtitle', e.target.value)} rows={3} className={cn(inputCls, 'resize-none')} /></label>
          <label className="block"><span className={labelCls}>Note under buttons</span><input value={form.applyNote} onChange={(e) => set('applyNote', e.target.value)} className={inputCls} /></label>

          <h2 className="mt-2 font-display font-bold">Sections on homepage</h2>
          <div className="flex flex-wrap gap-2">
            {[['showStats', 'Stats strip'], ['showLoop', 'How-it-works cards'], ['showWeek', 'Week rhythm band'], ['showCourses', 'Course strip'], ['showCta', 'Closing CTA']].map(([k, label]) => (
              <button key={k} type="button" onClick={() => set(k, !form[k])}
                className={cn('rounded-full px-4 py-2 text-xs font-bold transition', form[k] ? 'bg-ink text-white dark:bg-paper dark:text-ink' : 'border border-ink/15 opacity-50 dark:border-paper/15')}>
                {form[k] ? '✓ ' : ''}{label}
              </button>
            ))}
          </div>

          <h2 className="mt-2 font-display font-bold">Course strip (names + your descriptions)</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="block"><span className={labelCls}>Strip eyebrow</span><input value={form.coursesSub} onChange={(e) => set('coursesSub', e.target.value)} className={inputCls} /></label>
            <label className="block"><span className={labelCls}>Strip heading</span><input value={form.coursesTitle} onChange={(e) => set('coursesTitle', e.target.value)} className={inputCls} /></label>
          </div>
          {(form.featured || []).map((f, i) => (
            <div key={i} className="flex flex-wrap items-center gap-2 rounded-2xl bg-paper p-2.5 dark:bg-ink">
              <span className="w-44"><CustomSelect value={f.id} compact
                onChange={(v) => set('featured', form.featured.map((x, j) => (j === i ? { ...x, id: v } : x)))}
                options={COURSES.map((c) => ({ value: c.id, label: c.title }))} /></span>
              <input value={f.blurb} onChange={(e) => set('featured', form.featured.map((x, j) => (j === i ? { ...x, blurb: e.target.value } : x)))}
                placeholder="Your one-line description" className={cn(inputCls, 'min-w-52 flex-1')} />
              <button type="button" onClick={() => set('featured', form.featured.filter((_, j) => j !== i))} className="rounded-full p-2 text-rose-600 hover:bg-rose-500/10"><Trash2 size={14} /></button>
            </div>
          ))}
          {(!form.featured || form.featured.length < 4) && (
            <button type="button" onClick={() => set('featured', [...(form.featured || []), { id: 'ai-llms', blurb: '' }])}
              className="flex w-fit items-center gap-1.5 rounded-full border border-ink/15 px-4 py-2 text-xs font-bold dark:border-paper/15"><Plus size={13} /> Add course to strip</button>
          )}
        </div>
      )}

      {loaded && (section === 'courses' || section === 'pricing') && (
        <div className="grid gap-3 rounded-3xl border border-ink/10 bg-white p-5 dark:border-paper/10 dark:bg-ink-soft">
          <h2 className="font-display font-bold">{section === 'courses' ? 'Courses page header' : 'Pricing page header'}</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="block"><span className={labelCls}>Badge</span><input value={form.badge} onChange={(e) => set('badge', e.target.value)} className={inputCls} /></label>
            <label className="block"><span className={labelCls}>Title</span><input value={form.title} onChange={(e) => set('title', e.target.value)} className={inputCls} /></label>
          </div>
          <label className="block"><span className={labelCls}>Subtitle</span><textarea value={form.sub} onChange={(e) => set('sub', e.target.value)} rows={3} className={cn(inputCls, 'resize-none')} /></label>
          {section === 'pricing' && (
            <label className="block"><span className={labelCls}>Footer note</span><input value={form.foot} onChange={(e) => set('foot', e.target.value)} className={inputCls} /></label>
          )}
        </div>
      )}

      {loaded && section === 'about' && (
        <div className="grid gap-3 rounded-3xl border border-ink/10 bg-white p-5 dark:border-paper/10 dark:bg-ink-soft">
          <h2 className="font-display font-bold">About page</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="block"><span className={labelCls}>Badge</span><input value={form.badge} onChange={(e) => set('badge', e.target.value)} className={inputCls} /></label>
            <label className="block"><span className={labelCls}>Title</span><input value={form.title} onChange={(e) => set('title', e.target.value)} className={inputCls} /></label>
          </div>
          <label className="block"><span className={labelCls}>Story (blank line = new paragraph)</span><textarea value={form.story} onChange={(e) => set('story', e.target.value)} rows={8} className={cn(inputCls, 'resize-y')} /></label>
        </div>
      )}

      {loaded && section === 'quote' && (
        <div className="grid gap-3 rounded-3xl border border-ink/10 bg-white p-5 dark:border-paper/10 dark:bg-ink-soft">
          <h2 className="font-display font-bold">Homepage builder quote</h2>
          <label className="block"><span className={labelCls}>Quote text</span><textarea value={form.text} onChange={(e) => set('text', e.target.value)} rows={3} className={cn(inputCls, 'resize-none')} /></label>
          <label className="block"><span className={labelCls}>Attribution</span><input value={form.author} onChange={(e) => set('author', e.target.value)} className={inputCls} /></label>
        </div>
      )}

      {loaded && section === 'week' && (
        <div className="grid gap-3 rounded-3xl border border-ink/10 bg-white p-5 dark:border-paper/10 dark:bg-ink-soft">
          <h2 className="font-display font-bold">Week rhythm band (3 rows)</h2>
          {(form.rows || []).map((r, i) => (
            <div key={i} className="grid gap-2 rounded-2xl bg-paper p-3 sm:grid-cols-[110px_1fr_1fr] dark:bg-ink">
              <input value={r.d} onChange={(e) => set('rows', form.rows.map((x, j) => (j === i ? { ...x, d: e.target.value } : x)))} placeholder="Sat–Sun" className={inputCls} />
              <input value={r.t} onChange={(e) => set('rows', form.rows.map((x, j) => (j === i ? { ...x, t: e.target.value } : x)))} placeholder="Title" className={inputCls} />
              <input value={r.s} onChange={(e) => set('rows', form.rows.map((x, j) => (j === i ? { ...x, s: e.target.value } : x)))} placeholder="Subtitle" className={inputCls} />
            </div>
          ))}
        </div>
      )}

      {loaded && section === 'stats' && (
        <div className="grid gap-3 rounded-3xl border border-ink/10 bg-white p-5 dark:border-paper/10 dark:bg-ink-soft">
          <h2 className="font-display font-bold">Hero stats (4 numbers)</h2>
          <div className="grid gap-2 sm:grid-cols-2">
            {(form.items || []).map(([v, l], i) => (
              <div key={i} className="flex gap-2 rounded-2xl bg-paper p-2.5 dark:bg-ink">
                <input value={v} onChange={(e) => set('items', form.items.map((x, j) => (j === i ? [e.target.value, x[1]] : x)))} placeholder="24h" className={inputCls} />
                <input value={l} onChange={(e) => set('items', form.items.map((x, j) => (j === i ? [x[0], e.target.value] : x)))} placeholder="Label" className={inputCls} />
              </div>
            ))}
          </div>
        </div>
      )}

      {loaded && section === 'cta' && (
        <div className="grid gap-3 rounded-3xl border border-ink/10 bg-white p-5 dark:border-paper/10 dark:bg-ink-soft">
          <h2 className="font-display font-bold">Homepage closing CTA</h2>
          <label className="block"><span className={labelCls}>Title</span><input value={form.title} onChange={(e) => set('title', e.target.value)} className={inputCls} /></label>
          <label className="block"><span className={labelCls}>Subtitle</span><textarea value={form.sub} onChange={(e) => set('sub', e.target.value)} rows={2} className={cn(inputCls, 'resize-none')} /></label>
        </div>
      )}

      {loaded && section === 'faqs' && (
        <div className="grid gap-3 rounded-3xl border border-ink/10 bg-white p-5 dark:border-paper/10 dark:bg-ink-soft">
          <h2 className="font-display font-bold">Contact page FAQs</h2>
          {(form.items || []).map((f, i) => (
            <div key={i} className="grid gap-2 rounded-2xl bg-paper p-3 dark:bg-ink">
              <input value={f.q} onChange={(e) => set('items', form.items.map((x, j) => (j === i ? { ...x, q: e.target.value } : x)))} placeholder="Question" className={cn(inputCls, 'font-bold')} />
              <textarea value={f.a} onChange={(e) => set('items', form.items.map((x, j) => (j === i ? { ...x, a: e.target.value } : x)))} placeholder="Answer" rows={2} className={cn(inputCls, 'resize-none')} />
              <button type="button" onClick={() => set('items', form.items.filter((_, j) => j !== i))} className="flex w-fit items-center gap-1 rounded-full px-3 py-1.5 text-xs font-bold text-rose-600 hover:bg-rose-500/10"><Trash2 size={12} /> Remove</button>
            </div>
          ))}
          <button type="button" onClick={() => set('items', [...(form.items || []), { q: '', a: '' }])}
            className="flex w-fit items-center gap-1.5 rounded-full border border-ink/15 px-4 py-2 text-xs font-bold dark:border-paper/15"><Plus size={13} /> Add FAQ</button>
        </div>
      )}

      {loaded && section === 'footer' && (
        <div className="grid gap-3 rounded-3xl border border-ink/10 bg-white p-5 dark:border-paper/10 dark:bg-ink-soft">
          <h2 className="font-display font-bold">Footer tagline</h2>
          <label className="block"><span className={labelCls}>Tagline</span><textarea value={form.tagline} onChange={(e) => set('tagline', e.target.value)} rows={3} className={cn(inputCls, 'resize-none')} /></label>
        </div>
      )}

      {loaded && section === 'theme' && (
        <div className="grid gap-4 rounded-3xl border border-ink/10 bg-white p-5 dark:border-paper/10 dark:bg-ink-soft">
          <div>
            <h2 className="font-display font-bold">Palette preset</h2>
            <div className="mt-2 flex flex-wrap gap-2">
              {Object.entries(PALETTES).map(([id, p]) => (
                <button key={id} type="button" onClick={() => set('preset', id)}
                  className={cn('flex items-center gap-2 rounded-full border px-4 py-2 text-xs font-bold transition hover:-translate-y-0.5',
                    form.preset === id ? 'border-ink bg-ink text-white dark:border-paper dark:bg-paper dark:text-ink' : 'border-ink/15 dark:border-paper/15')}>
                  <span className="flex -space-x-1">
                    {[p.neon, p.cyan, p.violet, p.mint].map((c) => (
                      <i key={c} className="h-4 w-4 rounded-full border border-black/10" style={{ background: c }} />
                    ))}
                  </span>
                  {p.label}
                </button>
              ))}
            </div>
          </div>
          <div>
            <h2 className="font-display font-bold">Custom overrides <span className="text-xs font-normal opacity-50">(blank = use preset)</span></h2>
            <div className="mt-2 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
              {[['neon', 'Neon lime'], ['cyan', 'Cyan'], ['violet', 'Violet'], ['mint', 'Mint']].map(([k, label]) => (
                <label key={k} className="flex items-center gap-2 rounded-2xl bg-paper px-3 py-2 dark:bg-ink">
                  <input type="color" value={/^#[0-9a-f]{6}$/i.test(form[k] || '') ? form[k] : '#b4ff39'} onChange={(e) => set(k, e.target.value)} className="h-8 w-8 shrink-0 cursor-pointer rounded-lg border-0 bg-transparent p-0" />
                  <span className="min-w-0"><span className="block text-[11px] font-bold uppercase tracking-wider opacity-50">{label}</span>
                    <input value={form[k] || ''} onChange={(e) => set(k, e.target.value)} placeholder="#b4ff39" spellCheck={false}
                      className="w-full bg-transparent font-mono text-xs outline-none placeholder:opacity-30" /></span>
                </label>
              ))}
            </div>
            <p className="mt-2 text-[11px] opacity-50">Applies site-wide instantly (both modes). Clear a field to fall back to the preset.</p>
          </div>
        </div>
      )}

      {loaded && section === 'motion' && (
        <div className="grid gap-4 rounded-3xl border border-ink/10 bg-white p-5 dark:border-paper/10 dark:bg-ink-soft">
          <div>
            <h2 className="font-display font-bold">Animation intensity</h2>
            <div className="mt-2 max-w-xs"><CustomSelect value={form.intensity} onChange={(v) => set('intensity', v)}
              options={[{ value: 'full', label: 'Full motion', sub: 'Reveals, floats, marquees' }, { value: 'subtle', label: 'Subtle', sub: 'Slow, calm movement' }, { value: 'off', label: 'Off', sub: 'Static — fastest, accessible' }]} /></div>
          </div>
          <button type="button" onClick={() => set('floats', form.floats === false ? true : false)}
            className={cn('flex w-fit items-center gap-2 rounded-full px-4 py-2 text-xs font-bold transition', form.floats !== false ? 'bg-ink text-white dark:bg-paper dark:text-ink' : 'border border-ink/15 opacity-60 dark:border-paper/15')}>
            {form.floats !== false ? '✓ ' : ''}Floating pills
          </button>
          <p className="text-[11px] opacity-50">Takes effect on every page immediately. “Off” also honors reduced-motion users.</p>
        </div>
      )}

      {loaded && section === 'fees' && (
        <div className="grid gap-3 rounded-3xl border border-ink/10 bg-white p-5 dark:border-paper/10 dark:bg-ink-soft">
          <h2 className="font-display font-bold">3 fee installments <span className="text-xs font-normal opacity-50">(toggle per student in Students)</span></h2>
          <label className="block"><span className={labelCls}>Note shown to students</span><input value={form.note || ''} onChange={(e) => set('note', e.target.value)} className={inputCls} /></label>
          {(form.installments || []).map((inst, i) => (
            <div key={i} className="grid gap-2 rounded-2xl bg-paper p-3 sm:grid-cols-[1fr_140px_1fr] dark:bg-ink">
              <input value={inst.label} onChange={(e) => set('installments', form.installments.map((x, j) => (j === i ? { ...x, label: e.target.value } : x)))} placeholder="Installment label" className={cn(inputCls, 'font-bold')} />
              <input value={inst.amount} onChange={(e) => set('installments', form.installments.map((x, j) => (j === i ? { ...x, amount: e.target.value } : x)))} placeholder="₹999" className={inputCls} />
              <input value={inst.note} onChange={(e) => set('installments', form.installments.map((x, j) => (j === i ? { ...x, note: e.target.value } : x)))} placeholder="Due note" className={inputCls} />
            </div>
          ))}
        </div>
      )}

      {loaded && section === 'templates' && (
        <div className="grid gap-3 rounded-3xl border border-ink/10 bg-white p-5 dark:border-paper/10 dark:bg-ink-soft">
          <h2 className="font-display font-bold">Ready-made message templates</h2>
          <p className="-mt-1 text-xs opacity-50">Use <code className="rounded bg-ink/8 px-1 dark:bg-paper/10">{'{name}'}</code>, <code className="rounded bg-ink/8 px-1 dark:bg-paper/10">{'{amount}'}</code>, <code className="rounded bg-ink/8 px-1 dark:bg-paper/10">{'{label}'}</code>, <code className="rounded bg-ink/8 px-1 dark:bg-paper/10">{'{link}'}</code> — filled automatically when sending.</p>
          {(form.items || []).map((t, i) => (
            <div key={i} className="grid gap-2 rounded-2xl bg-paper p-3 dark:bg-ink">
              <input value={t.title} onChange={(e) => set('items', form.items.map((x, j) => (j === i ? { ...x, title: e.target.value } : x)))} placeholder="Template title" className={cn(inputCls, 'font-bold')} />
              <textarea value={t.body} onChange={(e) => set('items', form.items.map((x, j) => (j === i ? { ...x, body: e.target.value } : x)))} placeholder="Message body…" rows={2} className={cn(inputCls, 'resize-none')} />
              <button type="button" onClick={() => set('items', form.items.filter((_, j) => j !== i))} className="flex w-fit items-center gap-1 rounded-full px-3 py-1.5 text-xs font-bold text-rose-600 hover:bg-rose-500/10"><Trash2 size={12} /> Remove</button>
            </div>
          ))}
          <button type="button" onClick={() => set('items', [...(form.items || []), { title: '', body: '' }])}
            className="flex w-fit items-center gap-1.5 rounded-full border border-ink/15 px-4 py-2 text-xs font-bold dark:border-paper/15"><Plus size={13} /> Add template</button>
        </div>
      )}

      {loaded && (
        <div className="flex gap-2">
          <button onClick={save} disabled={busy === 'site-save'} className="rounded-full bg-ink px-6 py-2.5 text-sm font-bold text-white disabled:opacity-50 dark:bg-paper dark:text-ink">
            {busy === 'site-save' ? 'Publishing…' : 'Publish changes'}
          </button>
          <button onClick={reset} disabled={busy === 'site-save'} className="rounded-full border border-ink/15 px-6 py-2.5 text-sm font-bold disabled:opacity-50 dark:border-paper/15">
            Reset to defaults
          </button>
        </div>
      )}
    </div>
  )
}
