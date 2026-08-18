import { createContext, useCallback, useContext, useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import {
  ArrowRight,
  Eye,
  EyeOff,
  Gift,
  Lock,
  LogIn,
  Mail,
  ShieldCheck,
  Sparkles,
  Trophy,
  User as UserIcon,
  UserPlus,
  X,
  Zap,
} from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'
import { useAuth } from '../../context/AppContext.jsx'
import { useToast } from '../../context/ToastContext.jsx'
import { Modal } from './Modal.jsx'
import { Button } from './Button.jsx'
import { cn } from '../../lib/utils.js'

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

const BRAND_POINTS = [
  { icon: ShieldCheck, text: 'Employer-verifiable certificates with a unique ID' },
  { icon: Sparkles, text: 'AI screening + scored mock interviews' },
  { icon: Trophy, text: '58 companies already verify our alumni' },
]

function Tabs({ active, onTab }) {
  return (
    <div className="relative grid grid-cols-2 gap-1 rounded-2xl border border-ink/10 bg-ink/5 p-1 dark:border-paper/10 dark:bg-paper/10">
      {[
        { id: 'login', label: 'Sign in', icon: LogIn },
        { id: 'signup', label: 'Create account', icon: UserPlus },
      ].map(({ id, label, icon: Icon }) => {
        const isActive = active === id
        return (
          <button
            key={id}
            type="button"
            onClick={() => onTab(id)}
            aria-pressed={isActive}
            className={cn(
              'relative flex items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-semibold transition-colors duration-200',
              isActive ? 'text-ink dark:text-paper' : 'text-ink/50 hover:text-ink dark:text-paper/50 dark:hover:text-paper',
            )}
          >
            {isActive && (
              <motion.span
                layoutId="auth-tab"
                transition={{ type: 'spring', stiffness: 420, damping: 32 }}
                className="absolute inset-0 rounded-xl bg-white shadow-card dark:bg-ink"
              />
            )}
            <Icon size={14} className="relative z-10" />
            <span className="relative z-10">{label}</span>
          </button>
        )
      })}
    </div>
  )
}

function PasswordStrength({ password }) {
  const score = useMemo(() => {
    if (!password) return 0
    let s = 0
    if (password.length >= 6) s += 1
    if (password.length >= 10) s += 1
    if (/[A-Z]/.test(password) && /[a-z]/.test(password)) s += 1
    if (/\d/.test(password)) s += 1
    if (/[^A-Za-z0-9]/.test(password)) s += 1
    return Math.min(s, 4)
  }, [password])

  const meta = [
    '',
    'Weak',
    'Okay',
    'Solid',
    'Strong',
  ]

  const barColor = (i) => {
    if (i <= score) {
      if (score <= 1) return 'bg-coral-deep dark:bg-coral'
      if (score === 2) return 'bg-neon-deep dark:bg-neon'
      if (score === 3) return 'bg-cyan-deep dark:bg-cyan-snap'
      return 'bg-mint-deep dark:bg-mint'
    }
    return 'bg-ink/10 dark:bg-paper/10'
  }

  return (
    <div className="flex items-center gap-3">
      <div className="flex h-2 flex-1 gap-1.5">
        {[1, 2, 3, 4].map((i) => (
          <span key={i} className="relative h-full flex-1 overflow-hidden rounded-full bg-ink/10 dark:bg-paper/10">
            <motion.span
              className={cn('absolute inset-0 rounded-full', barColor(i))}
              initial={{ scaleX: 0 }}
              animate={{ scaleX: score >= i ? 1 : 0 }}
              transition={{ type: 'spring', stiffness: 320, damping: 26 }}
              style={{ transformOrigin: 'left' }}
            />
          </span>
        ))}
      </div>
      {password && (
        <motion.span
          key={score}
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          className={cn(
            'w-14 shrink-0 text-right text-[11px] font-bold',
            score === 1 && 'text-coral-deep dark:text-coral',
            score === 2 && 'text-neon-deep dark:text-neon',
            score === 3 && 'text-cyan-deep dark:text-cyan-snap',
            score === 4 && 'text-mint-deep dark:text-mint',
          )}
        >
          {meta[score]}
        </motion.span>
      )}
    </div>
  )
}

function LoginSignupModal({ mode, onClose }) {
  const [tab, setTab] = useState(mode)
  const [dir, setDir] = useState(0)
  const [showPw, setShowPw] = useState(false)
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const { login, signup } = useAuth()
  const { push } = useToast()
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const refCode = params.get('ref')
  const preselect = params.get('d')

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))

  const switchTab = (m) => {
    setDir(m === 'login' ? -1 : 1)
    setTab(m)
    setError('')
  }

  const submit = async (e) => {
    e.preventDefault()
    if (submitting) return
    setError('')
    const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())
    if (!emailOk) return setError('Enter a valid email address.')
    if (tab === 'signup') {
      // Mirrors the server's signup validation so errors surface inline.
      if (form.password.length < 8) return setError('Password must be at least 8 characters.')
      if (!/[a-zA-Z]/.test(form.password) || !/[0-9]/.test(form.password)) {
        return setError('Password must include at least one letter and one number.')
      }
    }
    setSubmitting(true)
    try {
      const res = tab === 'login' ? await login(form.email, form.password) : await signup(form.name, form.email, form.password, refCode)
      if (res.error) return setError(res.error)
      if (tab === 'signup' && refCode) {
        push(res.referred ? 'Referral applied — share your link and earn ₹50 per friend!' : 'Account created — let’s build', 'success')
      } else {
        push(tab === 'login' ? 'Welcome back to Codetern' : 'Account created — let’s build', 'success')
      }
      onClose()
      navigate(preselect ? `/dashboard?d=${preselect}` : '/dashboard')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Modal open onClose={onClose} size="lg" labelledBy="cdt-login-title">
      <div className="flex overflow-hidden">
        {/* ── brand rail ── */}
        <aside className="relative hidden w-60 shrink-0 flex-col justify-between overflow-hidden bg-gradient-to-br from-cyan-snap via-[#3b6cff] to-violet-deep p-6 text-white md:flex">
          {/* motion graphics stack */}
          <div className="pointer-events-none absolute inset-0" aria-hidden>
            <div className="cdt-aurora absolute inset-[-40%] opacity-30 mix-blend-screen"
              style={{ background: 'conic-gradient(from 120deg at 50% 30%, rgba(255,255,255,0.5), rgba(20,40,120,0.2), rgba(56,255,176,0.25), rgba(255,255,255,0.5))' }}
            />
            <div className="cdt-aurora-alt absolute inset-[-40%] opacity-25 mix-blend-screen"
              style={{ background: 'conic-gradient(from 300deg at 70% 75%, rgba(124,92,255,0.5), rgba(34,211,238,0.15), rgba(255,255,255,0.3), rgba(124,92,255,0.5))' }}
            />
            <div className="cdt-grid-mask absolute inset-0 opacity-60" />
            <span className="cdt-float absolute -left-10 top-24 h-36 w-36 rounded-full bg-white/20 blur-2xl" />
            <span className="cdt-float-slow cdt-float-delayed absolute -right-8 bottom-24 h-40 w-40 rounded-full bg-neon/25 blur-3xl" />
            <span className="cdt-float absolute left-8 bottom-10 h-20 w-20 rounded-full bg-cyan-snap/30 blur-xl" />
          </div>

          {/* logo */}
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="relative flex items-center gap-2.5"
          >
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-white/25 text-white backdrop-blur-md">
              <Zap size={18} strokeWidth={2.4} />
            </span>
            <span className="font-display text-lg font-bold">
              Code<span className="text-ink">tern</span>
            </span>
          </motion.div>

          {/* pitch */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.08, ease: 'easeOut' }}
            className="relative"
          >
            <span className="mb-3 inline-flex items-center gap-1.5 rounded-bubble border border-white/25 bg-white/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.16em] backdrop-blur-md">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-neon opacity-75" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-neon" />
              </span>
              Live cohort
            </span>
            <p className="font-display text-[1.55rem] font-extrabold leading-[1.15] tracking-tight">
              The internship simulator.
            </p>
            <p className="mt-2 text-xs leading-relaxed text-white/75">
              One account, five milestones — graduate with work employers can verify, not just courses they skip.
            </p>
          </motion.div>

          {/* points */}
          <motion.ul
            initial="hidden"
            animate="show"
            variants={{ show: { transition: { staggerChildren: 0.09, delayChildren: 0.15 } } }}
            className="relative mt-8 space-y-3"
          >
            {BRAND_POINTS.map(({ icon: Icon, text }) => (
              <motion.li
                key={text}
                variants={{ hidden: { opacity: 0, x: -12 }, show: { opacity: 1, x: 0, transition: { duration: 0.45, ease: 'easeOut' } } }}
                className="flex items-start gap-2.5 text-xs font-medium text-white/90"
              >
                <span className="grid h-6 w-6 shrink-0 place-items-center rounded-lg bg-white/15 text-white backdrop-blur-sm">
                  <Icon size={13} />
                </span>
                {text}
              </motion.li>
            ))}
          </motion.ul>

          {/* floating stat chip */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.35, ease: 'easeOut' }}
            className="relative flex items-center gap-3 rounded-2xl border border-white/20 bg-white/10 p-3 backdrop-blur-md"
          >
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-white/20 text-neon">
              <Trophy size={16} />
            </span>
            <div>
              <p className="font-display text-base font-extrabold leading-none">86%</p>
              <p className="text-[10px] text-white/70">interns placed within 90 days</p>
            </div>
          </motion.div>
        </aside>

        {/* ── form rail ── */}
        <div className="relative flex-1 p-6 sm:p-8">
          {/* soft glow orbs behind the form */}
          <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
            <span className="cdt-float-slow absolute -right-16 -top-16 h-40 w-40 rounded-full bg-cyan-deep/10 blur-3xl dark:bg-cyan-snap/10" />
            <span className="cdt-float cdt-float-delayed absolute -bottom-16 -left-10 h-40 w-40 rounded-full bg-violet-deep/10 blur-3xl" />
          </div>

          <button
            onClick={onClose}
            className="focus-ring absolute right-4 top-4 z-20 grid h-9 w-9 place-items-center rounded-full border border-ink/10 text-ink/50 transition hover:rotate-90 hover:bg-ink/5 hover:text-ink dark:border-paper/15 dark:text-paper/50 dark:hover:bg-paper/5 dark:hover:text-paper"
            aria-label="Close"
          >
            <X size={16} />
          </button>

          <div className="relative mb-6 pr-10">
            <motion.span
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="mb-3 inline-flex items-center gap-1.5 rounded-bubble border border-cyan-deep/30 bg-cyan-deep/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-cyan-deep dark:border-cyan-snap/30 dark:bg-cyan-snap/10 dark:text-cyan-snap"
            >
              <Sparkles size={11} />
              {tab === 'login' ? 'Welcome back' : 'Join Codetern'}
            </motion.span>
            <motion.h3
              id="cdt-login-title"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: 0.05 }}
              className="font-display text-2xl font-bold text-ink dark:text-paper"
            >
              {tab === 'login' ? 'Resume your journey' : (
                <>
                  Start your <span className="text-gradient-deep dark:text-gradient-snap">internship</span> simulation
                </>
              )}
            </motion.h3>
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: 0.1 }}
              className="mt-1.5 text-sm text-ink/55 dark:text-paper/55"
            >
              {tab === 'login'
                ? 'Your seats, quiz scores and progress are exactly where you left them.'
                : 'No credit card, no hidden fees — the entry bar is the only gate.'}
            </motion.p>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.14 }}
            className="relative mb-6"
          >
            <Tabs active={tab} onTab={switchTab} />
          </motion.div>

          {tab === 'signup' && refCode && (
            <motion.p
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="relative mb-4 flex items-center gap-2.5 rounded-2xl border border-neon-deep/30 bg-neon-deep/10 px-4 py-3 text-xs font-semibold text-ink dark:border-neon/30 dark:bg-neon/10 dark:text-paper"
            >
              <Gift size={14} className="shrink-0 text-neon-deep dark:text-neon" />
              Referral detected ({refCode}) — invite a friend to book and ₹50 lands in your wallet!
            </motion.p>
          )}

          {/* — fixed-height panel frame: both tabs stay mounted inside a constant
               parent so the modal never resizes when switching — */}
          <div className="relative h-[27rem]">
            {(['login', 'signup']).map((m) => {
              const active = tab === m
              return (
                <motion.form
                  key={m}
                  onSubmit={submit}
                  noValidate
                  inert={active ? undefined : ''}
                  aria-hidden={!active}
                  className={cn(
                    'absolute inset-0 flex flex-col gap-4',
                    !active && 'pointer-events-none',
                  )}
                  style={{ transformPerspective: 1100 }}
                  initial={false}
                  animate={
                    active
                      ? { x: 0, opacity: 1, rotateY: 0, scale: 1, filter: 'blur(0px)' }
                      : { x: dir * -60, opacity: 0, rotateY: dir * -22, scale: 0.94, filter: 'blur(6px)' }
                  }
                  transition={{ duration: 0.45, ease: [0.65, 0, 0.35, 1] }}
                >
                  {m === 'signup' && (
                    <Field
                      icon={<UserIcon size={15} />}
                      label="Full name"
                      value={form.name}
                      onChange={set('name')}
                      required
                      autoFocus={active}
                      autoComplete="name"
                    />
                  )}
                  <Field
                    icon={<Mail size={15} />}
                    type="email"
                    label="Email address"
                    value={form.email}
                    onChange={set('email')}
                    required
                    autoFocus={active && m === 'login'}
                    autoComplete="email"
                  />
                  <div className="relative">
                    <Field
                      icon={<Lock size={15} />}
                      label="Password"
                      type={showPw ? 'text' : 'password'}
                      value={form.password}
                      onChange={set('password')}
                      required
                      autoComplete={m === 'login' ? 'current-password' : 'new-password'}
                      trailing={
                        <button
                          type="button"
                          onClick={() => setShowPw((v) => !v)}
                          className="focus-ring absolute right-2 top-1/2 z-10 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-xl border border-transparent text-ink/40 transition-all duration-200 hover:border-ink/10 hover:bg-ink/5 hover:text-ink dark:text-paper/40 dark:hover:border-paper/15 dark:hover:bg-paper/10 dark:hover:text-paper"
                          aria-label={showPw ? 'Hide password' : 'Show password'}
                          aria-pressed={showPw}
                        >
                          <motion.span
                            key={showPw ? 'off' : 'on'}
                            initial={{ rotate: -90, opacity: 0 }}
                            animate={{ rotate: 0, opacity: 1 }}
                            transition={{ duration: 0.18 }}
                            className="grid place-items-center"
                          >
                            {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                          </motion.span>
                        </button>
                      }
                    />
                  </div>
                  {m === 'signup' && (
                    <div className="min-h-[2rem]">
                      <PasswordStrength password={form.password} />
                    </div>
                  )}

                  {/* error slot keeps a stable block for both panels */}
                  <div className="min-h-[2.75rem]">
                    <AnimatePresence mode="wait">
                      {error && (
                        <motion.p
                          key={error}
                          initial={{ opacity: 0, y: -6 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -4 }}
                          transition={{ duration: 0.2 }}
                          className="rounded-xl border border-coral-deep/30 bg-coral-deep/8 px-3.5 py-2.5 text-sm font-medium text-coral-deep dark:border-coral/30 dark:bg-coral/8 dark:text-coral"
                          role="alert"
                        >
                          {error}
                        </motion.p>
                      )}
                    </AnimatePresence>
                  </div>

                  <Button
                    type="submit"
                    variant="white"
                    size="lg"
                    disabled={submitting}
                    className="group/btn relative w-full whitespace-nowrap overflow-hidden rounded-2xl px-7 py-[1.15rem] bg-gradient-to-r from-cyan-snap via-violet-deep to-cyan-snap bg-[length:200%_100%] bg-left text-ink shadow-card transition-[background-position] duration-500 hover:bg-right hover:shadow-float disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <span
                      aria-hidden
                      className="pointer-events-none absolute inset-y-0 -left-1/2 w-1/3 -skew-x-12 bg-white/40 opacity-0 blur-sm transition-all duration-700 ease-out group-hover/btn:left-[120%] group-hover/btn:opacity-100"
                    />
                    <span className="min-w-[1.5rem]" aria-hidden />
                    {submitting ? 'One moment…' : m === 'login' ? 'Sign in' : 'Create free account'}
                    <ArrowRight size={16} />
                    <span className="min-w-[1.5rem]" aria-hidden />
                  </Button>

                  <div className="mt-auto flex items-center justify-center gap-1.5 border-t border-ink/8 pt-4 text-xs text-ink/45 dark:border-paper/10 dark:text-paper/45">
                    <ShieldCheck size={13} className="shrink-0 text-mint-deep dark:text-mint" />
                    <span className="text-ink/40 dark:text-paper/40">Demo admin —</span>
                    <button
                      type="button"
                      className="font-semibold text-ink underline underline-offset-2 transition-colors hover:text-cyan-deep dark:text-paper dark:hover:text-cyan-snap"
                      onClick={() => {
                        setForm({ name: '', email: 'admin@codetern.dev', password: 'admin123' })
                        switchTab('login')
                      }}
                    >
                      admin@codetern.dev / admin123
                    </button>
                  </div>
                </motion.form>
              )
            })}
          </div>
        </div>
      </div>
    </Modal>
  )
}

function Field({ icon, label, trailing, ...props }) {
  return (
    <label className="block text-left">
      <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-ink/50 dark:text-paper/50">{label}</span>
      <div className="group relative">
        <span className="pointer-events-none absolute left-3.5 top-1/2 z-[1] -translate-y-1/2 text-ink/35 transition-colors duration-300 group-focus-within:text-cyan-deep dark:text-paper/35 dark:group-focus-within:text-cyan-snap">
          {icon}
        </span>
        <input
          {...props}
          className={cn(
            'peer w-full rounded-2xl border bg-white py-3 pl-10 text-sm text-ink outline-none transition-all duration-300 placeholder:text-ink/30 dark:border-paper/15 dark:bg-ink dark:text-paper dark:placeholder:text-paper/30',
            'focus:border-cyan-snap/60 focus:shadow-[0_0_0_4px_rgba(34,211,238,0.12)] focus:dark:border-cyan-snap/60',
            trailing ? 'pr-12' : 'pr-4',
          )}
        />
        <span className="cdt-underline" aria-hidden />
        {trailing}
      </div>
    </label>
  )
}