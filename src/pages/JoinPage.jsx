import { useSearchParams, Link } from 'react-router-dom'
import { ClipboardCheck, FileText, ShieldCheck } from 'lucide-react'
import { Page } from '../components/layout/Page.jsx'
import { JoinForm } from '../components/home/JoinForm.jsx'
import { Pill } from '../components/ui/Pill.jsx'

const STEPS = [
  { icon: ClipboardCheck, t: '1 · Tell us about you', d: 'Name, email, mobile, education + which of the 4 courses you want.' },
  { icon: FileText, t: '2 · Finish the Google Form', d: 'It opens automatically after step 1. That is your formal application.' },
  { icon: ShieldCheck, t: '3 · Admin approves → LMS', d: 'Once approved, sign in with Google and your courses, tasks and attendance appear.' },
]

export default function JoinPage() {
  const [params] = useSearchParams()
  const course = params.get('course')

  return (
    <Page>
      <section className="mx-auto max-w-5xl px-5 pb-24 pt-28 lg:px-8">
        <div className="text-center">
          <Pill tone="neon" dot pulse>Admissions open · 4 courses</Pill>
          <h1 className="mx-auto mt-4 max-w-2xl font-display text-5xl font-extrabold tracking-tight">Join Codetern in 2 steps.</h1>
          <p className="mx-auto mt-3 max-w-xl text-[15px] opacity-60">Fill this short form, then the Google Form. Admin approves — you get the LMS.</p>
        </div>

        <div className="mt-8 grid gap-3 sm:grid-cols-3">
          {STEPS.map((s) => (
            <div key={s.t} className="rounded-3xl border border-ink/10 bg-white p-5 dark:border-paper/10 dark:bg-ink-soft">
              <s.icon size={20} />
              <h2 className="mt-2 font-display font-bold">{s.t}</h2>
              <p className="mt-1 text-[13px] opacity-60">{s.d}</p>
            </div>
          ))}
        </div>

        <div className="mt-6 rounded-[2rem] border border-ink/10 bg-white p-6 shadow-card sm:p-8 dark:border-paper/10 dark:bg-ink-soft dark:shadow-none">
          <JoinForm compact={false} initialCourse={course} />
          {course && <p className="mt-3 text-center text-xs opacity-50">Pre-selected course: <b>{course}</b> — change it above if needed.</p>}
        </div>
        <p className="mt-4 text-center text-sm opacity-60">Already approved? <Link to="/login" className="font-bold underline">Sign in to open your LMS</Link></p>
      </section>
    </Page>
  )
}
