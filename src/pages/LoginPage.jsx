import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'
import { Chrome, ShieldCheck, GitPullRequest, Users, Rocket, Loader2 } from 'lucide-react'
import { Page } from '../components/layout/Page.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { useToast } from '../context/ToastContext.jsx'

export default function LoginPage() {
  const { user, isAdmin, signIn, expiredNotice } = useAuth()
  const { push } = useToast()
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const [busy, setBusy] = useState(false)
  const next = params.get('next') || '/dashboard'

  useEffect(() => {
    if (user) navigate(isAdmin ? '/admin' : next, { replace: true })
  }, [user, isAdmin, navigate, next])

  const go = async () => {
    setBusy(true)
    try {
      await signIn()
    } catch {
      push('Enable Google sign-in in Firebase console first', 'error')
    } finally {
      setBusy(false)
    }
  }

  return (
    <Page>
      <section className="mx-auto grid max-w-5xl gap-5 px-5 pb-24 pt-28 lg:grid-cols-2 lg:px-8">
        <div className="relative overflow-hidden rounded-[2rem] bg-ink p-8 text-white dark:bg-ink-soft">
          <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-neon/15 blur-[90px]" />
          <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-white/50">No toy projects</p>
          <h1 className="mt-2 font-display text-4xl font-extrabold leading-tight">Learn production code. Ship it. Get reviewed.</h1>
          <ul className="mt-6 space-y-3 text-sm text-white/70">
            <li className="flex gap-2"><Rocket size={16} className="mt-0.5 shrink-0 text-lime-300" /> From-scratch builds across 4 courses — not todo lists.</li>
            <li className="flex gap-2"><GitPullRequest size={16} className="mt-0.5 shrink-0 text-cyan-300" /> Every unit ends in a GitHub PR with mentor review.</li>
            <li className="flex gap-2"><Users size={16} className="mt-0.5 shrink-0 text-violet-300" /> Team simulation: sprints, standups, code owners.</li>
            <li className="flex gap-2"><ShieldCheck size={16} className="mt-0.5 shrink-0 text-emerald-300" /> Approved students unlock the LMS automatically.</li>
          </ul>
        </div>
        <div className="grid place-items-center rounded-[2rem] border border-ink/10 bg-white p-10 dark:border-paper/10 dark:bg-ink-soft">
          <div className="w-full max-w-xs text-center">
            <h2 className="font-display text-2xl font-bold">Sign in to Codetern</h2>
            {expiredNotice && (
              <p className="mt-3 rounded-2xl bg-amber-500/12 px-4 py-2.5 text-xs font-bold text-amber-700 dark:text-amber-300">
                Your 30-day session ended — please sign in again to continue.
              </p>
            )}
            <p className="mt-1 text-sm opacity-60">Students open the LMS. <b>shreybhangale@gmail.com</b> opens the admin panel.</p>
            <button onClick={go} disabled={busy} className="mt-6 flex w-full items-center justify-center gap-2 rounded-full bg-ink py-3 text-sm font-bold text-white transition hover:-translate-y-0.5 disabled:opacity-50 dark:bg-paper dark:text-ink">
              {busy ? <Loader2 size={16} className="animate-spin" /> : <Chrome size={16} />} Continue with Google
            </button>
            <p className="mt-4 text-xs opacity-50">Not approved yet? <Link to="/join" className="font-bold underline">Fill the join form first</Link></p>
          </div>
        </div>
      </section>
    </Page>
  )
}
