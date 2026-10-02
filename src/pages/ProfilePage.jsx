import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Loader2, Linkedin, Github, Phone, GraduationCap, Check } from 'lucide-react'
import { Page } from '../components/layout/Page.jsx'
import { StudentShell } from '../components/layout/AppShell.jsx'
import { Loader } from '../components/ui/StateBits.jsx'
import { Avatar } from '../components/ui/Avatar.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { useMyEnrollments } from '../hooks/useMyEnrollments.js'
import { useRtdbList } from '../hooks/useRtdbList.js'
import { saveProfile } from '../lib/rtdb.js'
import { useToast } from '../context/ToastContext.jsx'
import { getCourse } from '../data/courses.js'

export default function ProfilePage() {
  const { user } = useAuth()
  const { push } = useToast()
  const { enrollments, loading: eLoading } = useMyEnrollments()
  const { rows: users, loading: uLoading } = useRtdbList('users')
  const [form, setForm] = useState({ phone: '', education: '', linkedin: '', github: '' })
  const [saving, setSaving] = useState(false)
  const [savedTick, setSavedTick] = useState(false)

  const record = users.find((u) => u.uid === user?.uid)

  useEffect(() => {
    if (record) {
      setForm({
        phone: record.phone || '',
        education: record.education || '',
        linkedin: record.linkedin || '',
        github: record.github || '',
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [record?.phone, record?.education, record?.linkedin, record?.github])

  const save = async (e) => {
    e.preventDefault()
    if (form.linkedin && !/^https?:\/\/.+\..+/.test(form.linkedin.trim())) return push('LinkedIn must be a full link (https://…)', 'error')
    if (form.github && !/^https?:\/\/.+\..+/.test(form.github.trim())) return push('GitHub must be a full link (https://…)', 'error')
    setSaving(true)
    try {
      await saveProfile(user.uid, form)
      push('Profile saved', 'success')
      setSavedTick(true)
      setTimeout(() => setSavedTick(false), 2500)
    } catch {
      push('Save failed — check connection', 'error')
    } finally {
      setSaving(false)
    }
  }

  const inputCls = 'w-full rounded-2xl border border-ink/12 bg-white px-4 py-2.5 text-sm text-ink outline-none transition placeholder:text-ink/35 focus:border-ink/40 dark:border-paper/15 dark:bg-ink dark:text-paper dark:placeholder:text-paper/35'

  return (
    <Page>
      <StudentShell>
        <h1 className="font-display text-3xl font-extrabold tracking-tight">Profile</h1>
        <p className="mt-1 text-sm opacity-60">Mentors see these links on every PR and task you submit.</p>

        {(eLoading || uLoading) && <Loader text="Loading profile…" />}

        <div className="mt-5 grid gap-4 lg:grid-cols-[320px_1fr]">
          <div className="h-fit rounded-3xl border border-ink/10 bg-white p-6 text-center dark:border-paper/10 dark:bg-ink-soft">
            <Avatar name={user?.displayName || user?.email} photo={user?.photoURL} size="lg" role={record?.role} />
            <h2 className="mt-3 font-display text-xl font-bold">{user?.displayName || 'Student'}</h2>
            <p className="truncate text-sm opacity-50">{user?.email}</p>
            <div className="mt-4 grid gap-2 text-left">
              {[
                { Icon: Linkedin, label: 'LinkedIn', value: form.linkedin, href: form.linkedin },
                { Icon: Github, label: 'GitHub', value: form.github, href: form.github },
                { Icon: Phone, label: 'Phone', value: form.phone },
                { Icon: GraduationCap, label: 'Background', value: form.education },
              ].map(({ Icon, label, value, href }) => (
                <div key={label} className="flex items-center gap-2.5 rounded-2xl bg-paper px-3 py-2 text-sm dark:bg-ink">
                  <Icon size={15} className="shrink-0 opacity-50" />
                  <span className="min-w-0 flex-1">
                    <span className="block text-[10px] font-bold uppercase tracking-wider opacity-50">{label}</span>
                    {href ? <a href={href} target="_blank" rel="noreferrer" className="block truncate font-semibold underline">{value}</a>
                      : <span className="block truncate font-semibold">{value || '—'}</span>}
                  </span>
                </div>
              ))}
            </div>
            <div className="mt-4 border-t border-ink/8 pt-3 text-left dark:border-paper/10">
              <p className="text-[11px] font-bold uppercase tracking-wider opacity-50">Enrolled ({enrollments.length})</p>
              {enrollments.map((m) => (
                <Link key={m.id} to={`/learn/${m.courseId}`} className="mt-1.5 block truncate rounded-xl bg-paper px-3 py-2 text-xs font-bold hover:underline dark:bg-ink">
                  {getCourse(m.courseId).title}
                </Link>
              ))}
              {enrollments.length === 0 && <p className="mt-1 text-xs opacity-50">Nothing yet — approval unlocks courses.</p>}
            </div>
          </div>

          <form onSubmit={save} className="h-fit rounded-3xl border border-ink/10 bg-white p-6 dark:border-paper/10 dark:bg-ink-soft">
            <h2 className="font-display text-lg font-bold">Edit details</h2>
            <p className="text-xs opacity-50">Links are optional, but mentors review PRs faster when they can see your profiles.</p>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <label className="block"><span className="mb-1 block text-xs font-bold opacity-60">Phone</span>
                <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="+91 …" className={inputCls} /></label>
              <label className="block"><span className="mb-1 block text-xs font-bold opacity-60">Background</span>
                <input value={form.education} onChange={(e) => setForm({ ...form, education: e.target.value })} placeholder="College student, fresher…" className={inputCls} /></label>
              <label className="block sm:col-span-2"><span className="mb-1 block text-xs font-bold opacity-60">LinkedIn profile link (optional)</span>
                <input value={form.linkedin} onChange={(e) => setForm({ ...form, linkedin: e.target.value })} placeholder="https://linkedin.com/in/you" type="url" className={inputCls} /></label>
              <label className="block sm:col-span-2"><span className="mb-1 block text-xs font-bold opacity-60">GitHub profile link (optional)</span>
                <input value={form.github} onChange={(e) => setForm({ ...form, github: e.target.value })} placeholder="https://github.com/you" type="url" className={inputCls} /></label>
            </div>
            <button disabled={saving} className="mt-4 flex items-center gap-1.5 rounded-full bg-ink px-6 py-2.5 text-sm font-bold text-white transition hover:-translate-y-0.5 disabled:opacity-50 dark:bg-paper dark:text-ink">
              {saving ? <Loader2 size={14} className="animate-spin" /> : savedTick ? <Check size={14} /> : null}
              {saving ? 'Saving…' : savedTick ? 'Saved' : 'Save profile'}
            </button>
          </form>
        </div>
      </StudentShell>
    </Page>
  )
}
