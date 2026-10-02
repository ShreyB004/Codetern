import { useEffect, useMemo, useState } from 'react'
import { GitPullRequest, Send, Loader2 } from 'lucide-react'
import { Page } from '../components/layout/Page.jsx'
import { StudentShell } from '../components/layout/AppShell.jsx'
import { Loader, Empty, StatusBadge, Card } from '../components/ui/StateBits.jsx'
import { CustomSelect } from '../components/ui/CustomSelect.jsx'
import { useRtdbList } from '../hooks/useRtdbList.js'
import { useMyEnrollments } from '../hooks/useMyEnrollments.js'
import { submitPR } from '../lib/rtdb.js'
import { useAuth } from '../context/AuthContext.jsx'
import { useToast } from '../context/ToastContext.jsx'
import { COURSES, getCourse } from '../data/courses.js'

export default function ReviewsPage() {
  const { user } = useAuth()
  const { push } = useToast()
  const { rows, loading } = useRtdbList('reviews')
  const { courseIds: myCourses, loading: eLoading } = useMyEnrollments()
  const [form, setForm] = useState({ courseId: 'ai-llms', prUrl: '', notes: '' })
  const [busy, setBusy] = useState(false)
  const mine = useMemo(() => rows.filter((r) => r.uid === user?.uid), [rows, user])
  const recentLinks = useMemo(() => [...new Set(mine.map((r) => r.prUrl).filter(Boolean))].slice(0, 5), [mine])

  useEffect(() => {
    if (myCourses.length && !myCourses.includes(form.courseId)) {
      setForm((f) => ({ ...f, courseId: myCourses[0] }))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [myCourses.join(',')])

  const send = async (e) => {
    e.preventDefault()
    if (!form.prUrl.trim()) return push('Paste your GitHub PR link', 'error')
    setBusy(true)
    try {
      await submitPR({ uid: user.uid, name: user.displayName || user.email, ...form })
      setForm({ ...form, prUrl: '', notes: '' })
      push('PR submitted — mentor queue updated', 'success')
    } catch {
      push('Could not submit — check connection', 'error')
    } finally {
      setBusy(false)
    }
  }

  return (
    <Page>
      <StudentShell>
        <h1 className="font-display text-3xl font-extrabold tracking-tight">PR reviews</h1>
        <p className="mt-1 text-sm opacity-60">Push to GitHub, submit the PR link. Mentors approve or request changes.</p>

        {(loading || eLoading) && <Loader text="Loading reviews…" />}

        {!eLoading && myCourses.length > 0 && (
          <Card className="mt-5">
            <h2 className="flex items-center gap-1.5 font-display font-bold"><GitPullRequest size={17} /> Submit a PR</h2>
            <form onSubmit={send} className="mt-3 grid gap-2.5">
              <div className="grid gap-2.5 sm:grid-cols-[200px_1fr]">
                <CustomSelect
                  value={form.courseId}
                  onChange={(v) => setForm({ ...form, courseId: v })}
                  options={COURSES.filter((c) => myCourses.includes(c.id)).map((c) => ({ value: c.id, label: c.title, sub: c.sub }))}
                  placeholder="Course"
                />
                <input value={form.prUrl} onChange={(e) => setForm({ ...form, prUrl: e.target.value })} placeholder="https://github.com/you/repo/pull/12 *" aria-label="GitHub PR link" className="cdt-input rounded-2xl px-4 py-2.5 text-sm" />
              </div>
              {recentLinks.length > 0 && (
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="text-[11px] font-bold uppercase tracking-wider opacity-50">Recent repos — tap to autofill:</span>
                  {recentLinks.map((u) => {
                    const short = u.replace(/^https?:\/\//, '').split('/').slice(0, 3).join('/')
                    return (
                      <button key={u} type="button" onClick={() => setForm({ ...form, prUrl: u })} title={u}
                        className="max-w-full truncate rounded-full border border-ink/15 px-3 py-1 text-[11px] font-semibold transition hover:-translate-y-0.5 hover:border-ink/40 dark:border-paper/15">
                        {short}
                      </button>
                    )
                  })}
                </div>
              )}
              <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="What should the reviewer focus on? (tests, perf, API design…)" aria-label="Reviewer focus notes" rows={2} maxLength={1000} className="cdt-input w-full rounded-2xl px-4 py-3 text-sm" />
              <div>
                <button disabled={busy} className="flex items-center gap-1.5 rounded-full bg-ink px-5 py-2.5 text-sm font-bold text-white transition hover:-translate-y-0.5 disabled:opacity-50 dark:bg-paper dark:text-ink">
                  {busy ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />} {busy ? 'Submitting…' : 'Submit PR for review'}
                </button>
              </div>
            </form>
          </Card>
        )}

        {!loading && !eLoading && (
          <div className="mt-4 grid gap-2">
            {mine.length === 0 && <Empty text={myCourses.length === 0 ? 'No approved courses yet — PR reviews unlock after admin approval.' : 'No PRs yet — submit your first one above.'} />}
            {mine.map((r) => (
              <div key={r.id} className="flex flex-wrap items-center gap-3 rounded-2xl border border-ink/10 bg-white p-4 dark:border-paper/10 dark:bg-ink-soft">
                <GitPullRequest size={18} className="shrink-0" />
                <div className="min-w-0 flex-1">
                  <a href={r.prUrl} target="_blank" rel="noreferrer" className="block truncate text-sm font-bold hover:underline">{r.prUrl}</a>
                  <p className="text-xs opacity-50">{getCourse(r.courseId).title}{r.notes ? ` · “${r.notes}”` : ''}{r.feedback ? ` · Mentor: “${r.feedback}”` : ''}</p>
                </div>
                <StatusBadge status={r.status} />
              </div>
            ))}
          </div>
        )}
      </StudentShell>
    </Page>
  )
}
