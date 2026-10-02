import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, ArrowUpRight, BookOpen, CalendarCheck, GitPullRequest, ListChecks, MessagesSquare, Hourglass, Linkedin, Github, Pencil } from 'lucide-react'
import { Avatar } from '../components/ui/Avatar.jsx'
import { Page } from '../components/layout/Page.jsx'
import { StudentShell } from '../components/layout/AppShell.jsx'
import { Loader, Empty, StatusBadge } from '../components/ui/StateBits.jsx'
import { useRtdbList } from '../hooks/useRtdbList.js'
import { useMyEnrollments } from '../hooks/useMyEnrollments.js'
import { useSite } from '../hooks/useSite.js'
import { useAuth } from '../context/AuthContext.jsx'
import { getCourse } from '../data/courses.js'
import { subscribeDoc } from '../lib/rtdb.js'

export default function DashboardPage() {
  const { user } = useAuth()
  const { enrollments: mine, loading: eLoading } = useMyEnrollments()
  const { rows: joins, loading: jLoading } = useRtdbList('joinRequests')
  const { rows: tasks } = useRtdbList('tasks')
  const { rows: reviews } = useRtdbList('reviews')
  const { rows: users } = useRtdbList('users')
  const [myFees, setMyFees] = useState(null)
  useEffect(() => {
    if (!user) return
    return subscribeDoc(`fees/${user.uid.replace(/[.#$/[\]]/g, '_')}`, setMyFees)
  }, [user])
  const feePlan = useSite('fees')
  const feesDue = ['i1', 'i2', 'i3'].filter((k) => (myFees?.[k] || 'pending') !== 'paid').length
  const { rows: progressRows } = useRtdbList(user ? `progress/${user.uid.replace(/[.#$/[\]]/g, '_')}` : 'progress/_none')
  const record = users.find((u) => u.uid === user?.uid)
  const unitPct = useMemo(() => {
    const map = {}
    progressRows.forEach((n) => {
      const units = getCourse(n.id).units
      if (!units?.length) return
      const done = units.filter((u) => n[u.id]?.done).length
      map[n.id] = Math.round((done / units.length) * 100)
    })
    return map
  }, [progressRows])
  const myJoins = useMemo(() => joins.filter((j) => j.email === user?.email), [joins, user])
  const pendingJoin = myJoins.find((j) => j.status === 'requested')
  const myTasks = useMemo(() => tasks.filter((t) => mine.some((m) => m.courseId === t.courseId)), [tasks, mine])
  const myReviews = useMemo(() => reviews.filter((r) => r.uid === user?.uid), [reviews, user])
  const pendingReviews = myReviews.filter((r) => r.status === 'pending').length

  const first = user?.displayName?.split(' ')[0] || 'Builder'

  return (
    <Page>
      <StudentShell>
        <div className="flex flex-wrap items-center gap-3">
          <Avatar name={user?.displayName || user?.email} photo={user?.photoURL} size="md" />
          <div className="min-w-0 flex-1">
            <p className="text-[11px] font-bold uppercase tracking-[0.18em] opacity-50">My learning</p>
            <h1 className="font-display text-3xl font-extrabold tracking-tight sm:text-4xl">Hey {first} — keep shipping.</h1>
          </div>
          <div className="flex items-center gap-1.5">
            {record?.linkedin && <a href={record.linkedin} target="_blank" rel="noreferrer" title="LinkedIn" className="grid h-9 w-9 place-items-center rounded-full border border-ink/10 transition hover:-translate-y-0.5 dark:border-paper/15"><Linkedin size={15} /></a>}
            {record?.github && <a href={record.github} target="_blank" rel="noreferrer" title="GitHub" className="grid h-9 w-9 place-items-center rounded-full border border-ink/10 transition hover:-translate-y-0.5 dark:border-paper/15"><Github size={15} /></a>}
            <Link to="/profile" title="Edit profile" className="grid h-9 w-9 place-items-center rounded-full border border-ink/10 transition hover:-translate-y-0.5 dark:border-paper/15"><Pencil size={14} /></Link>
          </div>
        </div>

        {(eLoading || jLoading) && <Loader text="Loading your LMS…" />}

        {!eLoading && !jLoading && mine.length === 0 && (
          <div className="mt-6 rounded-[2rem] bg-ink p-8 text-white dark:bg-ink-soft">
            {pendingJoin ? (
              <>
                <p className="flex items-center gap-2 text-sm font-bold text-amber-300"><Hourglass size={15} /> Application under review</p>
                <h2 className="mt-2 font-display text-2xl font-bold">We got your request for {getCourse(pendingJoin.courseId).title}.</h2>
                <p className="mt-1 max-w-md text-sm text-white/60">Admin approves join requests daily. Your courses, tasks, attendance and messages unlock here the moment you’re approved — just sign back in.</p>
              </>
            ) : (
              <>
                <h2 className="font-display text-2xl font-bold">You haven’t joined a course yet.</h2>
                <p className="mt-1 max-w-md text-sm text-white/60">Fill the 2-minute join form, finish the Google Form, get approved — then this page becomes your LMS.</p>
                <Link to="/join" className="mt-4 inline-block rounded-full bg-white px-5 py-2.5 text-sm font-bold text-ink">Join a course <ArrowRight size={13} className="ml-1 inline" /></Link>
              </>
            )}
          </div>
        )}

        {mine.length > 0 && (
          <>
            <div className={`mt-5 flex flex-wrap items-center gap-x-4 gap-y-2 rounded-3xl border px-5 py-3.5 text-sm ${feesDue === 0 ? 'border-emerald-500/30 bg-emerald-500/8' : 'border-amber-500/30 bg-amber-500/8'}`}>
              <b>{feesDue === 0 ? 'Fees cleared' : `${feesDue} installment${feesDue === 1 ? '' : 's'} pending`}</b>
              <span className="flex items-center gap-3">
                {(feePlan.installments || []).map((inst, i) => {
                  const paid = (myFees?.[`i${i + 1}`] || 'pending') === 'paid'
                  return (
                    <span key={i} title={`${inst.label} — ${inst.amount} · ${paid ? 'paid' : 'pending'}`} className="flex items-center gap-1.5 text-xs font-semibold">
                      <i className={`h-2.5 w-2.5 rounded-full ${paid ? 'bg-emerald-500' : 'bg-amber-500/50'}`} />
                      {inst.amount}
                    </span>
                  )
                })}
              </span>
              {feesDue > 0 && <span className="text-xs opacity-60">{feePlan.note}</span>}
            </div>
            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              {[
                { icon: BookOpen, label: 'My courses', value: mine.length, to: '/learn', bg: '#E9E4FF' },
                { icon: ListChecks, label: 'Open tasks', value: myTasks.length, to: '/tasks', bg: '#FFF6B8' },
                { icon: GitPullRequest, label: 'PRs in review', value: pendingReviews, to: '/reviews', bg: pendingReviews ? '#FFE2E2' : '#D9F7E8' },
              ].map((k) => (
                <Link key={k.label} to={k.to} className="group rounded-3xl p-5 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-float active:translate-y-0 active:scale-[0.99]" style={{ background: k.bg }}>
                  <span className="grid h-9 w-9 place-items-center rounded-xl bg-ink/10 transition group-hover:rotate-3 group-hover:scale-110"><k.icon size={18} className="text-ink" /></span>
                  <p className="mt-2 font-display text-4xl font-extrabold text-ink">{k.value}</p>
                  <p className="text-xs font-bold uppercase tracking-wider text-ink/50 transition group-hover:text-ink">{k.label} →</p>
                </Link>
              ))}
            </div>

            <div className="mt-4 grid gap-3 lg:grid-cols-2">
              <div className="rounded-3xl border border-ink/10 bg-white p-5 dark:border-paper/10 dark:bg-ink-soft">
                <div className="flex items-center justify-between">
                  <h2 className="font-display text-lg font-bold">My courses</h2>
                  <Link to="/learn" className="text-xs font-bold underline">Open</Link>
                </div>
                <div className="mt-3 grid gap-2">
                  {mine.map((m) => {
                    const c = getCourse(m.courseId)
                    const pct = unitPct[c.id] || 0
                    return (
                      <Link key={m.id} to={`/learn/${c.id}`} className="group flex items-center gap-3 rounded-2xl p-2.5 transition hover:-translate-x-0.5 hover:bg-paper dark:hover:bg-ink">
                        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl font-display text-sm font-extrabold text-ink transition group-hover:scale-105" style={{ background: c.color }}>{c.title.slice(0, 1)}</span>
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-sm font-bold">{c.title}</span>
                          <span className="mt-1 block h-1.5 overflow-hidden rounded-full bg-ink/10 dark:bg-paper/10">
                            <span className="block h-full rounded-full bg-gradient-to-r from-cyan-500 via-lime-400 to-violet-500 transition-all duration-500" style={{ width: `${pct}%` }} />
                          </span>
                          <span className="mt-0.5 block text-[11px] opacity-50">{pct}% units · {m.planId === 'self-paced' ? 'Self-paced · messages only' : c.sub}</span>
                        </span>
                        <ArrowUpRight size={15} className="shrink-0 opacity-40 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:opacity-100" />
                      </Link>
                    )
                  })}
                </div>
              </div>

              <div className="grid gap-3">
                <div className="rounded-3xl border border-ink/10 bg-white p-5 dark:border-paper/10 dark:bg-ink-soft">
                  <h2 className="flex items-center gap-1.5 font-display font-bold"><GitPullRequest size={16} /> Latest reviews</h2>
                  {myReviews.length === 0
                    ? <p className="mt-2 text-xs opacity-50">No PRs yet. <Link to="/reviews" className="font-bold underline">Submit your first</Link>.</p>
                    : myReviews.slice(0, 3).map((r) => (
                      <div key={r.id} className="mt-2 flex items-center gap-2 rounded-2xl bg-paper px-3 py-2 text-xs dark:bg-ink">
                        <span className="min-w-0 flex-1 truncate">{r.prUrl}</span>
                        <StatusBadge status={r.status} />
                      </div>
                    ))}
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <Link to="/attendance" className="rounded-3xl bg-ink p-4 text-white transition hover:-translate-y-0.5 dark:bg-ink-soft">
                    <CalendarCheck size={17} /><p className="mt-1.5 text-sm font-bold">Attendance →</p>
                  </Link>
                  <Link to="/messages" className="rounded-3xl border border-ink/10 bg-white p-4 transition hover:-translate-y-0.5 dark:border-paper/10 dark:bg-ink-soft">
                    <MessagesSquare size={17} /><p className="mt-1.5 text-sm font-bold">Messages →</p>
                  </Link>
                </div>
              </div>
            </div>
          </>
        )}
      </StudentShell>
    </Page>
  )
}
