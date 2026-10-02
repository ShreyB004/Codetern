import { useEffect, useMemo, useState } from 'react'
import { Link, useParams, Navigate } from 'react-router-dom'
import { ArrowLeft, CheckCircle2, Circle, GitPullRequest, Users, Loader2 } from 'lucide-react'
import { Page } from '../components/layout/Page.jsx'
import { StudentShell } from '../components/layout/AppShell.jsx'
import { Loader, StatusBadge } from '../components/ui/StateBits.jsx'
import { COURSES, getCourse } from '../data/courses.js'
import { saveUnitProgress } from '../lib/rtdb.js'
import { useRtdbList } from '../hooks/useRtdbList.js'
import { useMyEnrollments } from '../hooks/useMyEnrollments.js'
import { CertificateGate } from '../components/lms/Certificate.jsx'
import { useAuth } from '../context/AuthContext.jsx'

const lastSelected = () => {
  try { return localStorage.getItem('cdt:lastCourse') } catch { return null }
}

function LockedLibrary() {
  return (
    <Page>
      <StudentShell>
        <p className="text-[11px] font-bold uppercase tracking-[0.18em] opacity-50">My courses</p>
        <h1 className="mt-1 font-display text-3xl font-extrabold tracking-tight">Nothing unlocked yet.</h1>
        <p className="mt-1 max-w-md text-sm opacity-60">Your courses appear here after admin approval. Only the tracks you joined are ever shown — nothing irrelevant.</p>
        <div className="mt-5 flex flex-wrap gap-2">
          <Link to="/join" className="rounded-full bg-ink px-5 py-2.5 text-sm font-bold text-white dark:bg-paper dark:text-ink">Join a course</Link>
          <Link to="/dashboard" className="rounded-full border border-ink/15 px-5 py-2.5 text-sm font-bold dark:border-paper/15">Back to dashboard</Link>
        </div>
      </StudentShell>
    </Page>
  )
}

export default function LearnPage() {
  // all hooks first, unconditionally (Rules of Hooks)
  const { courseId } = useParams()
  const { user } = useAuth()
  const { enrollments, courseIds, loading: eLoading } = useMyEnrollments()
  const { rows: tasks } = useRtdbList('tasks')
  const [active, setActive] = useState(null)
  const [done, setDone] = useState(() => {
    try { return JSON.parse(localStorage.getItem('cdt:progress') || '{}') } catch { return {} }
  })
  const [saving, setSaving] = useState(null)

  // default view: last-opened enrolled course, else first enrollment
  const resolvedId = courseId
    || (courseIds.includes(lastSelected()) ? lastSelected() : null)
    || courseIds[0]
    || null
  const course = getCourse(resolvedId || 'ai-llms')

  const enrolled = useMemo(
    () => enrollments.some((e) => e.courseId === course.id),
    [enrollments, course.id],
  )
  const myPlan = useMemo(
    () => enrollments.find((e) => e.courseId === course.id)?.planId,
    [enrollments, course.id],
  )
  const courseTasks = useMemo(() => tasks.filter((t) => t.courseId === course.id), [tasks, course.id])

  const firstUnitId = course.units[0].id
  useEffect(() => {
    setActive(firstUnitId)
    if (enrolled) {
      try { localStorage.setItem('cdt:lastCourse', course.id) } catch { /* noop */ }
    }
  }, [course.id, enrolled, firstUnitId])

  const doneCount = useMemo(() => course.units.filter((u) => done[`${course.id}:${u.id}`]).length, [done, course])
  const pct = Math.round((doneCount / course.units.length) * 100)

  const toggle = async (id) => {
    if (!enrolled) return
    const next = !done[`${course.id}:${id}`]
    setDone((d) => ({ ...d, [`${course.id}:${id}`]: next }))
    setSaving(id)
    try {
      await saveUnitProgress({ userKey: user?.uid || 'guest', courseId: course.id, unitId: id, done: next })
    } catch { /* local only */ }
    finally { setSaving(null) }
  }

  const unit = course.units.find((u) => u.id === active) || course.units[0]

  // render branches only after every hook ran
  if (!courseId && !eLoading && resolvedId && courseIds.includes(resolvedId)) {
    return <Navigate to={`/learn/${resolvedId}`} replace />
  }
  if (!courseId && !eLoading && !resolvedId) {
    return <LockedLibrary />
  }
  if (!courseId && eLoading) {
    return (
      <Page>
        <StudentShell>
          <Loader text="Opening your courses…" />
        </StudentShell>
      </Page>
    )
  }

  return (
    <Page>
      <StudentShell>
        <Link to="/dashboard" className="inline-flex items-center gap-1 text-xs font-bold opacity-60 hover:opacity-100"><ArrowLeft size={13} /> Dashboard</Link>
        <div className="mt-1 flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.18em] opacity-50">{course.level}</p>
            <h1 className="font-display text-3xl font-extrabold tracking-tight">{course.title}</h1>
            <p className="text-sm opacity-60">{course.sub} · {doneCount}/{course.units.length} units ({pct}%)</p>
          </div>
          <div className="h-2.5 w-52 overflow-hidden rounded-full bg-ink/10 dark:bg-paper/10">
            <div className="h-full rounded-full bg-gradient-to-r from-cyan-500 via-lime-400 to-violet-500 transition-all" style={{ width: `${pct}%` }} />
          </div>
        </div>

        <div className="mt-4 grid gap-2 rounded-3xl bg-paper p-4 text-[13px] dark:bg-ink">
          <p className="flex gap-2"><GitPullRequest size={14} className="mt-0.5 shrink-0" /><span><b>Build:</b> {course.build}</span></p>
          <p className="flex gap-2"><Users size={14} className="mt-0.5 shrink-0" /><span><b>Team sim:</b> {course.teamSim}</span></p>
          {myPlan === 'self-paced' && <p className="rounded-2xl bg-amber-500/10 px-3 py-2 text-xs font-bold text-amber-700 dark:text-amber-300">Self-paced plan: you get mentor messages — no live Meets, no PR queue. Everything else is yours.</p>}
        </div>

        {eLoading && <Loader text="Checking enrollment…" />}
        {!eLoading && !enrolled && (
          <div className="mt-4 rounded-3xl bg-ink p-6 text-white dark:bg-ink-soft">
            <h2 className="font-display text-xl font-bold">Syllabus is free to read. Doing needs approval.</h2>
            <p className="mt-1 text-sm text-white/60">Join this course — admin approves, then checklists, tasks and messages unlock.</p>
            <Link to={`/join?course=${course.id}`} className="mt-4 inline-block rounded-full bg-white px-5 py-2.5 text-sm font-bold text-ink">Join {course.title}</Link>
          </div>
        )}

        <div className="mt-4 grid gap-4 xl:grid-cols-[240px_1.5fr_300px]">
          <div className="h-fit rounded-3xl border border-ink/10 bg-white p-3 dark:border-paper/10 dark:bg-ink-soft">
            <p className="px-2 text-[11px] font-bold uppercase tracking-wider opacity-50">My courses</p>
            {COURSES.filter((c) => courseIds.includes(c.id)).map((c) => (
              <Link key={c.id} to={`/learn/${c.id}`} className={`mt-1 block rounded-2xl p-3 transition ${c.id === course.id ? 'bg-ink text-white dark:bg-paper dark:text-ink' : 'hover:bg-paper dark:hover:bg-ink'}`}>
                <p className="text-sm font-bold">{c.title}</p>
                <p className="text-[11px] opacity-60">{c.weeks} weeks</p>
              </Link>
            ))}
            {courseIds.length === 0 && <p className="px-2 py-2 text-xs opacity-50">No approved courses yet.</p>}
          </div>

          <div className="h-fit rounded-3xl border border-ink/10 bg-white p-5 dark:border-paper/10 dark:bg-ink-soft">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-lg font-bold">Units</h2>
              <StatusBadge status={enrolled ? 'active' : 'requested'} />
            </div>
            <div className="mt-3 grid gap-2">
              {course.units.map((u) => {
                const isDone = !!done[`${course.id}:${u.id}`]
                return (
                  <button key={u.id} onClick={() => setActive(u.id)} disabled={!enrolled}
                    className={`flex w-full items-center gap-2.5 rounded-2xl p-3 text-left text-ink transition dark:text-paper ${active === u.id ? 'bg-white ring-2 ring-ink dark:bg-paper/10 dark:ring-paper' : 'bg-paper/70 hover:bg-white dark:bg-paper/5 dark:hover:bg-paper/10'} ${!enrolled ? 'opacity-70' : ''}`}>
                    <span onClick={(e) => { e.stopPropagation(); toggle(u.id) }} title={enrolled ? 'Mark done' : 'Join to track'}>
                      {saving === u.id
                        ? <Loader2 size={19} className="animate-spin opacity-50" />
                        : isDone ? <CheckCircle2 size={19} className="text-emerald-600" /> : <Circle size={19} className="opacity-30" />}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-bold">{u.title}</span>
                      <span className="text-[11px] opacity-50">{u.kind}</span>
                    </span>
                  </button>
                )
              })}
            </div>
            <div className="mt-4 rounded-2xl bg-paper p-4 text-sm dark:bg-ink">
              <p className="font-bold">Now: {unit.title}</p>
              <p className="mt-1 text-[13px] opacity-60">Do the work, submit via Tasks, then request a PR review. Mentors respond within 24h.</p>
              <div className="mt-3 flex flex-wrap gap-2">
                <Link to="/tasks" className="rounded-full bg-ink px-4 py-2 text-xs font-bold text-white dark:bg-paper dark:text-ink">Open tasks</Link>
                <Link to="/reviews" className="rounded-full border border-ink/15 px-4 py-2 text-xs font-bold dark:border-paper/15">Submit PR</Link>
              </div>
            </div>
          </div>

          <div className="h-fit rounded-3xl bg-[#E9E4FF] p-4 dark:bg-ink-soft">
            <h2 className="px-1 font-display font-bold text-ink dark:text-paper">Tasks for this course</h2>
            <div className="mt-2 grid gap-2">
              {courseTasks.length === 0 && <p className="rounded-2xl bg-white/70 p-3 text-xs text-ink/60 dark:bg-ink dark:text-paper/60">No tasks posted yet — mentors add them after each session.</p>}
              {courseTasks.slice(0, 5).map((t) => (
                <div key={t.id} className="rounded-2xl bg-white/80 p-3 dark:bg-ink">
                  <p className="truncate text-[13px] font-bold text-ink dark:text-paper">{t.title}</p>
                  <p className="text-[11px] text-ink/55 dark:text-paper/55">{t.due ? `Due ${t.due}` : 'No due date'}</p>
                </div>
              ))}
              <Link to="/tasks" className="rounded-2xl bg-ink p-3 text-center text-xs font-bold text-white dark:bg-paper dark:text-ink">Open all tasks</Link>
              <Link to="/messages" className="rounded-2xl border border-ink/15 bg-white/60 p-3 text-center text-xs font-bold text-ink dark:border-paper/15 dark:bg-transparent dark:text-paper">Messages</Link>
            </div>
          </div>
        </div>

        {enrolled && (
          <div className="mt-4">
            <CertificateGate courseId={course.id} />
          </div>
        )}
      </StudentShell>
    </Page>
  )
}
