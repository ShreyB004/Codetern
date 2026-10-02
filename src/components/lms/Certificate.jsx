import { useMemo } from 'react'
import { Award, Check, X, Lock } from 'lucide-react'
import { Loader } from '../ui/StateBits.jsx'
import { useRtdbList } from '../../hooks/useRtdbList.js'
import { useAuth } from '../../context/AuthContext.jsx'
import { getCourse } from '../../data/courses.js'
import { cn } from '../../lib/utils.js'

// Strict rule: attendance ABOVE 75% AND every course task completed
// (by admin only). Otherwise no preview — just the checklist.
export function useEligibility(courseId) {
  const { user } = useAuth()
  const sk = user ? user.uid.replace(/[.#$/[\]]/g, '_') : '_none'
  const { rows: tasks, loading: tLoading } = useRtdbList('tasks')
  const { rows: stateTree, loading: sLoading } = useRtdbList('taskState')
  const { rows: attRows, loading: aLoading } = useRtdbList(`attendanceByStudent/${sk}/${courseId}`)

  const data = useMemo(() => {
    const courseTasks = tasks.filter((t) => t.courseId === courseId)
    const states = {}
    stateTree
      .filter((n) => courseTasks.some((t) => t.id === n.id))
      .forEach((n) => {
        Object.entries(n).forEach(([k, v]) => {
          if (k !== 'id' && v && typeof v === 'object' && v.uid === user?.uid) states[n.id] = v.status
        })
      })
    const completed = courseTasks.filter((t) => states[t.id] === 'completed').length
    const sessions = attRows.length
    const present = attRows.filter((r) => r.present).length
    const pct = sessions ? Math.round((present / sessions) * 100) : 0
    return {
      total: courseTasks.length,
      completed,
      sessions,
      present,
      pct,
      eligible: courseTasks.length > 0 && completed === courseTasks.length && sessions > 0 && pct > 75,
    }
  }, [tasks, stateTree, attRows, courseId, user])

  return { ...data, loading: tLoading || sLoading || aLoading }
}

export function CertificateGate({ courseId }) {
  const { user } = useAuth()
  const { total, completed, sessions, present, pct, eligible, loading } = useEligibility(courseId)
  const course = getCourse(courseId)

  if (loading) return <Loader text="Checking completion…" />

  const rows = [
    { label: `Attendance above 75% (yours: ${sessions ? `${pct}% · ${present}/${sessions}` : 'no classes yet'})`, ok: sessions > 0 && pct > 75 },
    { label: `All ${total} tasks completed by mentor (${completed}/${total})`, ok: total > 0 && completed === total },
  ]

  if (!eligible) {
    return (
      <div className="rounded-3xl border border-ink/10 bg-white p-6 dark:border-paper/10 dark:bg-ink-soft">
        <h3 className="flex items-center gap-2 font-display text-lg font-bold"><Lock size={17} /> Course certificate — locked</h3>
        <p className="mt-1 text-sm opacity-60">Finish everything below and it unlocks here. No shortcuts, no preview until then.</p>
        <ul className="mt-4 space-y-2">
          {rows.map((r) => (
            <li key={r.label} className={cn('flex items-start gap-2.5 rounded-2xl px-3.5 py-3 text-sm font-semibold',
              r.ok ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300' : 'bg-paper dark:bg-ink')}>
              <span className={cn('mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full', r.ok ? 'bg-emerald-500 text-white' : 'bg-ink/10 dark:bg-paper/15')}>
                {r.ok ? <Check size={12} /> : <X size={12} />}
              </span>
              {r.label}
            </li>
          ))}
        </ul>
      </div>
    )
  }

  const code = `CDT-${courseId.toUpperCase().replace(/-/g, '')}-${(user?.uid || 'XXXXXX').slice(0, 6).toUpperCase()}`
  return (
    <div className="relative overflow-hidden rounded-3xl bg-ink p-8 text-center text-white dark:bg-ink-soft">
      <div className="pointer-events-none absolute -left-12 -top-12 h-44 w-44 rounded-full bg-neon/20 blur-[80px]" />
      <div className="pointer-events-none absolute -bottom-12 -right-12 h-44 w-44 rounded-full bg-cyan-snap/20 blur-[80px]" />
      <Award size={34} className="relative mx-auto text-neon" />
      <p className="relative mt-3 text-[11px] font-extrabold uppercase tracking-[0.22em] text-white/50">Certificate of completion</p>
      <h3 className="relative mt-1 font-display text-3xl font-extrabold">{user?.displayName || 'Graduate'}</h3>
      <p className="relative mt-1 text-sm text-white/65">completed <b className="text-white">{course.title}</b> — {completed}/{total} tasks · {pct}% attendance</p>
      <p className="relative mt-4 inline-block rounded-full border border-white/20 px-4 py-1.5 font-mono text-xs tracking-widest">Verify: {code}</p>
    </div>
  )
}
