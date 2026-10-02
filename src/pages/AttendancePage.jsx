import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { Check, X } from 'lucide-react'
import { Page } from '../components/layout/Page.jsx'
import { StudentShell } from '../components/layout/AppShell.jsx'
import { Loader, Empty, Card } from '../components/ui/StateBits.jsx'
import { useRtdbList } from '../hooks/useRtdbList.js'
import { useMyEnrollments } from '../hooks/useMyEnrollments.js'
import { useAuth } from '../context/AuthContext.jsx'
import { getCourse } from '../data/courses.js'
import { cn } from '../lib/utils.js'

function fmtDate(iso) {
  try {
    return new Date(`${iso}T12:00:00`).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })
  } catch {
    return iso
  }
}

function CourseAttendance({ courseId }) {
  const { user } = useAuth()
  const sk = user ? user.uid.replace(/[.#$/[\]]/g, '_') : '_none'
  // per-student mirror — one read, always in sync with what admin marked
  const { rows, loading } = useRtdbList(`attendanceByStudent/${sk}/${courseId}`)
  // legacy fallback: marks written before the mirror existed
  const { rows: legacyDays, loading: legacyLoading } = useRtdbList(`attendance/${courseId}`)

  const sessions = useMemo(() => {
    const map = new Map()
    legacyDays.forEach((day) => {
      const rec = day[sk]
      if (rec && typeof rec === 'object') map.set(day.id, !!rec.present)
    })
    rows.forEach((r) => map.set(r.id, !!r.present)) // mirror wins
    return [...map.entries()]
      .map(([date, present]) => ({ date, present }))
      .sort((a, b) => (a.date < b.date ? 1 : -1))
  }, [rows, legacyDays, sk])
  const present = sessions.filter((s) => s.present).length
  const pct = sessions.length ? Math.round((present / sessions.length) * 100) : null
  const course = getCourse(courseId)

  return (
    <Card>
      <div className="flex items-center justify-between gap-3">
        <div>
          <h3 className="font-display text-lg font-bold">{course.title}</h3>
          <p className="text-xs opacity-50">Every marked Meet is a class · {sessions.length} classes so far</p>
        </div>
        <div className="grid h-16 w-16 shrink-0 place-items-center rounded-full border-4 border-ink/10 text-center dark:border-paper/15"
          style={pct !== null ? { borderColor: pct > 75 ? '#10b981' : pct >= 50 ? '#f59e0b' : '#f43f5e' } : undefined}>
          <span><span className="block font-display text-lg font-extrabold leading-none">{pct === null ? '—' : `${pct}%`}</span></span>
        </div>
      </div>
      {(loading || legacyLoading) && <Loader text="Loading your record…" />}
      {!loading && !legacyLoading && sessions.length === 0 && (
        <p className="mt-3 rounded-2xl bg-paper p-3 text-xs opacity-60 dark:bg-ink">No classes marked yet — your record appears here after the first Meet.</p>
      )}
      {!loading && !legacyLoading && sessions.length > 0 && (
        <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
          {sessions.map((s) => (
            <div key={s.date} className={cn('rounded-2xl border p-3 text-center transition hover:-translate-y-0.5',
              s.present
                ? 'border-emerald-500/30 bg-emerald-500/8 dark:border-emerald-400/25'
                : 'border-rose-500/30 bg-rose-500/8 dark:border-rose-400/25')}>
              <span className={cn('mx-auto grid h-8 w-8 place-items-center rounded-full',
                s.present ? 'bg-emerald-500 text-white' : 'bg-rose-500 text-white')}>
                {s.present ? <Check size={15} /> : <X size={15} />}
              </span>
              <p className="mt-1.5 text-[13px] font-bold leading-tight">{fmtDate(s.date)}</p>
              <p className="text-[10px] opacity-40">{s.date}</p>
              <p className={cn('mt-1 text-[10px] font-extrabold uppercase tracking-wider',
                s.present ? 'text-emerald-700 dark:text-emerald-300' : 'text-rose-700 dark:text-rose-300')}>
                {s.present ? 'Present' : 'Absent'}
              </p>
            </div>
          ))}
        </div>
      )}
      <p className="mt-2 text-[11px] opacity-50">Certificate needs attendance above 75% plus every task completed.</p>
    </Card>
  )
}

export default function AttendancePage() {
  const { courseIds: myCourses, loading } = useMyEnrollments()

  return (
    <Page>
      <StudentShell>
        <h1 className="font-display text-3xl font-extrabold tracking-tight">Attendance</h1>
        <p className="mt-1 text-sm opacity-60">Marked by mentors after each Google Meet — date by date, class by class.</p>
        {loading && <Loader text="Loading your courses…" />}
        {!loading && myCourses.length === 0 && (
          <div className="mt-5"><Empty text="No approved courses yet — your record appears after admin approval." action={<Link to="/join" className="rounded-full bg-ink px-4 py-2 text-xs font-bold text-white dark:bg-paper dark:text-ink">Check join status</Link>} /></div>
        )}
        <div className="mt-5 grid gap-3">
          {myCourses.map((c) => <CourseAttendance key={c} courseId={c} />)}
        </div>
      </StudentShell>
    </Page>
  )
}
