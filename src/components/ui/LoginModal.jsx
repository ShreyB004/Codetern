import { createContext, useCallback, useContext, useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { ArrowRight, Eye, EyeOff, Gift, Lock, Mail, User as UserIcon, X } from 'lucide-react'
import { useAuth } from '../../context/AppContext.jsx'
import { useToast } from '../../context/ToastContext.jsx'
import { Modal } from './Modal.jsx'
import { Button } from './Button.jsx'
import { cn } from '../../lib/utils.js'
import { gsap } from '../../lib/gsap.js'

const LoginModalCtx = createContext(() => {})

export function LoginModalProvider({ children }) {
  const [mode, setMode] = useState(null) // null | 'login' | 'signup'
  const open = useCallback((m) => setMode(m), [])
  const close = useCallback(() => setMode(null), [])
  const value = useMemo(() => open, [open])
  return (
    <LoginModalCtx.Provider value={value}>
      {children}
      {mode && <LoginSignupModal mode={mode} open onClose={close} />}
    </LoginModalCtx.Provider>
  )
}

export function useLoginModal() {
  return useContext(LoginModalCtx)
}

function Docs({ active, onTab }) {
  return (
    <div className="mb-6 grid grid-cols-2 gap-1 rounded-2xl border border-ink/10 bg-ink/5 p-1 dark:bg-paper/10">
      {(['login', 'signup']).map((m) => (
        <button
          key={m}
          onClick={() => onTab(m)}
          className={cn(
            'rounded-xl py-2.5 text-sm font-semibold capitalize transition-all',
            active === m ? 'bg-white text-ink dark:text-paper shadow-card' : 'text-ink/50 hover:text-ink dark:text-paper/50 dark:hover:text-paper',
          )}
        >
          {m === 'login' ? 'Sign in' : 'Create account'}
        </button>
      ))}
    </div>
  )
}

function LoginSignupModal({ mode, onClose }) {
  const [tab, setTab] = useState(mode)
  const [showPw, setShowPw] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const { login, signup } = useAuth()
  const { push } = useToast()
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const refCode = params.get('ref')
  const preselect = params.get('d')

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))

  const submit = (e) => {
    e.preventDefault()
    setError('')
    const res = tab === 'login' ? login(form.email, form.password) : signup(form.name, form.email, form.password, refCode)
    if (res.error) return setError(res.error)
    if (tab === 'signup' && refCode) {
      push(res.referred ? 'Account created — referral applied, earn ₹50 when you book!' : 'Account created — let’s build', 'success')
    } else {
      push(tab === 'login' ? 'Welcome back to Codetern' : 'Account created — let’s build', 'success')
    }
    gsap.fromTo('.cdt-modal-panel', { scale: 0.96, opacity: 0.5 }, { scale: 1, opacity: 1, duration: 0.3 })
    onClose()
    navigate(preselect ? `/dashboard?d=${preselect}` : '/dashboard')
  }

  return (
    <Modal open onClose={onClose} size="md" labelledBy="cdt-login-title">
      <div className="relative p-6 sm:p-8">
        <button
          onClick={onClose}
          className="absolute right-5 top-5 grid h-8 w-8 place-items-center rounded-full border border-ink/10 text-ink/60 transition hover:bg-ink/5 dark:border-paper/15 dark:text-paper/60 dark:hover:bg-paper/5"
          aria-label="Close"
        >
          <X size={15} />
        </button>

        <div className="mb-6">
          <span className="mb-3 inline-block rounded-bubble border border-cyan-deep/30 bg-cyan-deep/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-cyan-deep dark:border-cyan-snap/30 dark:bg-cyan-snap/10 dark:text-cyan-snap">
            {tab === 'login' ? 'Welcome back' : 'Join Codetern'}
          </span>
          <h3 id="cdt-login-title" className="font-display text-2xl font-bold text-ink dark:text-paper">
            {tab === 'login' ? 'Resume your journey' : 'Start your internship simulation'}
          </h3>
          <p className="mt-1.5 text-sm text-ink/55 dark:text-paper/55">
            {tab === 'login'
              ? 'Your seats, quiz scores and progress are exactly where you left them.'
              : 'One account, five milestones, real projects that make your resume sing.'}
          </p>
        </div>

        <Docs active={tab} onTab={setTab} />

        {tab === 'signup' && refCode && (
          <p className="mb-4 flex items-center gap-2.5 rounded-2xl border border-neon-deep/30 bg-neon-deep/10 px-4 py-3 text-xs font-semibold text-ink dark:border-neon/30 dark:bg-neon/10 dark:text-paper">
            <Gift size={14} className="shrink-0 text-neon-deep dark:text-neon" />
            Referral detected ({refCode}) — invite a friend to book and ₹50 lands in your wallet!
          </p>
        )}

        <form onSubmit={submit} className="flex flex-col gap-4">
          {tab === 'signup' && (
            <Field
              icon={<UserIcon size={15} />}
              label="Full name"
              value={form.name}
              onChange={set('name')}
              required
              autoFocus
            />
          )}
          <Field
            icon={<Mail size={15} />}
            type="email"
            label="Email address"
            value={form.email}
            onChange={set('email')}
            required
            autoFocus={tab === 'login'}
          />
          <div className="relative">
            <Field
              icon={<Lock size={15} />}
              label="Password"
              type={showPw ? 'text' : 'password'}
              value={form.password}
              onChange={set('password')}
              required
            />
            <button
              type="button"
              onClick={() => setShowPw((v) => !v)}
              className="absolute right-4 top-[49px] text-ink/40 hover:text-ink/70 dark:text-paper/40 dark:hover:text-paper/70"
              aria-label="Toggle password visibility"
            >
              {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>

          {error && (
            <p className="rounded-xl border border-coral-deep/30 bg-coral-deep/8 px-3.5 py-2.5 text-sm font-medium text-coral-deep dark:border-coral/30 dark:bg-coral/8 dark:text-coral" role="alert">
              {error}
            </p>
          )}

          <Button type="submit" variant="primary" size="lg" className="mt-1 w-full">
            {tab === 'login' ? 'Sign in' : 'Create free account'}
            <ArrowRight size={16} />
          </Button>

          <p className="text-center text-xs text-ink/45 dark:text-paper/45">
            Demo admin — use <button type="button" className="font-semibold text-ink dark:text-paper underline underline-offset-2" onClick={() => { setForm({ name: '', email: 'admin@codetern.dev', password: 'admin123' }); setTab('login') }}>admin@codetern.dev / admin123</button>
          </p>
        </form>
      </div>
    </Modal>
  )
}

function Field({ icon, label, ...props }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-ink/50 dark:text-paper/50">{label}</span>
      <div className="relative">
        <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-ink/35 dark:text-paper/35">{icon}</span>
        <input
          {...props}
          className="w-full rounded-2xl border border-ink/12 bg-white px-10 dark:border-paper/15 dark:bg-ink dark:text-paper py-3 text-sm text-ink dark:text-paper outline-none transition placeholder:text-ink/30 focus:border-cyan-snap/60 focus:ring-4 focus:ring-cyan-snap/10"
        />
      </div>
    </label>
  )
}