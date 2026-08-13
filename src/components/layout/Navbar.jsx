import { useEffect, useRef, useState } from 'react'
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom'
import { ArrowRight, ChevronDown, LayoutDashboard, Menu, ShieldCheck, Sparkles, X, Zap } from 'lucide-react'
import { cn } from '../../lib/utils.js'
import { useAuth } from '../../context/AppContext.jsx'
import { Button } from '../ui/Button.jsx'
import { ThemeToggle } from '../ui/ThemeToggle.jsx'
import { useLoginModal } from '../ui/LoginModal.jsx'
import { DomainIcon } from '../ui/Icon.jsx'
import { DOMAIN_COLORS, PROGRAMMES } from '../../data/programmes.js'
import { gsap } from '../../lib/gsap.js'

const LINKS = [
  { to: '/', label: 'Home' },
  { to: '/about', label: 'About' },
  { to: '/domains', label: 'Domains', dropdown: true },
  { to: '/portfolio', label: 'Projects' },
  { to: '/certification', label: 'Certification' },
  { to: '/contact', label: 'Contact' },
]

const DROPDOWN_TRACKS = ['mern', 'frontend', 'ai', 'dataeng', 'cyber', 'uiux']

function NavUnderline({ active = false }) {
  return (
    <span
      aria-hidden
      className={cn(
        'absolute -bottom-1 left-0 h-[2px] w-full origin-left rounded-full bg-gradient-to-r from-cyan-snap via-mint to-violet-deep transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]',
        active ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100 group-focus-visible:scale-x-100',
      )}
    />
  )
}

function DomainsDropdown({ open, onClose }) {
  const navigate = useNavigate()
  const openLogin = useLoginModal()

  const go = (path) => {
    onClose()
    navigate(path)
  }

  const goChallenge = () => {
    onClose()
    openLogin('signup')
  }

  return (
    <div
      id="domains-dropdown"
      className={cn(
        'absolute left-1/2 top-full z-50 w-[560px] -translate-x-1/2 pt-3 transition-all duration-400 ease-[cubic-bezier(0.16,1,0.3,1)]',
        open ? 'pointer-events-auto translate-y-0 opacity-100' : 'pointer-events-none -translate-y-2 opacity-0',
      )}
      inert={open ? undefined : ''}
    >
      <div className="overflow-hidden rounded-panel border border-ink/10 bg-white/95 shadow-float backdrop-blur-xl dark:border-paper/10 dark:bg-ink-soft/95">
        <div className="grid grid-cols-2 gap-1 p-3">
          {DROPDOWN_TRACKS.map((id, i) => {
            const p = PROGRAMMES.find((x) => x.id === id)
            const color = DOMAIN_COLORS[id]
            if (!p) return null
            return (
              <button
                key={id}
                onClick={() => go(`/domains?d=${id}`)}
                className={cn(
                  'group flex items-center gap-3 rounded-2xl px-3.5 py-3 text-left transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-0.5 focus-ring',
                  'hover:bg-ink/5 dark:hover:bg-paper/5',
                  open ? 'translate-y-0 opacity-100' : 'translate-y-2 opacity-0',
                )}
                style={{ transitionDelay: open ? `${120 + i * 55}ms` : '0ms' }}
              >
                <span
                  className={cn(
                    'grid h-10 w-10 shrink-0 place-items-center rounded-xl transition-transform duration-300 group-hover:scale-110',
                    'text-ink/80 dark:text-paper',
                  )}
                  style={{ background: color.bg }}
                >
                  <DomainIcon name={p.icon} size={18} />
                </span>
                <span className="min-w-0">
                  <span className="block truncate text-sm font-semibold text-ink dark:text-paper">{p.title}</span>
                  <span className="block truncate text-[11px] text-ink/60 dark:text-paper/60">{p.sub}</span>
                </span>
              </button>
            )
          })}
        </div>

        <div className="flex items-center justify-between gap-3 border-t border-ink/8 bg-ink/2 px-5 py-3 dark:border-paper/8 dark:bg-paper/5">
          <button
            onClick={() => go('/domains')}
            className="group inline-flex items-center gap-1.5 rounded-full text-sm font-semibold text-cyan-deep focus-ring transition-colors hover:text-cyan-deep/80 dark:text-cyan-snap dark:hover:text-cyan-snap/80"
          >
            All 14 tracks
            <ArrowRight size={14} className="transition-transform group-hover:translate-x-0.5" />
          </button>
          <button
            onClick={goChallenge}
            className="inline-flex items-center gap-1.5 rounded-full bg-neon px-4 py-1.5 text-xs font-bold text-ink transition hover:bg-neon/90 focus-ring-dark"
          >
            <Sparkles size={12} /> Start 5-step challenge
          </button>
        </div>
      </div>
    </div>
  )
}

export function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [hidden, setHidden] = useState(false)
  const [progress, setProgress] = useState(0)
  const [open, setOpen] = useState(false)
  const [dropdown, setDropdown] = useState(false)
  const root = useRef(null)
  const lastY = useRef(0)
  const { isAuthenticated, isAdmin } = useAuth()
  const navigate = useNavigate()
  const openLogin = useLoginModal()
  const { pathname } = useLocation()

  useEffect(() => {
    let hidden = false
    const onScroll = () => {
      const y = window.scrollY
      setScrolled(y > 24)
      const doc = document.documentElement
      const max = doc.scrollHeight - window.innerHeight
      setProgress(max > 0 ? Math.min(1, y / max) : 0)

      // reveal on scroll up, hide on scroll down (only after some scroll)
      if (y > 140) {
        if (y > lastY.current + 4 && !hidden) {
          hidden = true
          setHidden(true)
        } else if (y < lastY.current - 4 && hidden) {
          hidden = false
          setHidden(false)
        }
      } else {
        hidden = false
        setHidden(false)
      }
      lastY.current = y
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // close menus on navigation
  useEffect(() => {
    setOpen(false)
    setDropdown(false)
  }, [pathname])

  // entrance stagger (skips reduced-motion)
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const ctx = gsap.context(() => {
      gsap.fromTo(
        '[data-nav-enter]',
        { y: -14, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.6, stagger: 0.05, ease: 'expo.out', delay: 0.1 },
      )
      gsap.fromTo(
        root.current,
        { y: -18, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.6, ease: 'expo.out', delay: 0.05 },
      )
    }, root)
    return () => ctx.revert()
  }, [])

  // lock body scroll while the drawer is open
  useEffect(() => {
    if (!open) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [open])

  // escape closes dropdown + drawer
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') {
        setDropdown(false)
        setOpen(false)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  const go = () => (isAuthenticated ? navigate('/dashboard') : openLogin('signup'))

  // The pill is always frosted glass with theme-aware ink/paper text — the
  // contrast never depends on what scrolls underneath. `scrolled` only lifts
  // the pill (shadow + slightly stronger fill) once the page has moved.
  const solid = scrolled || open

  return (
    <header
      ref={root}
      className={cn(
        'fixed inset-x-0 top-0 z-50 transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]',
        hidden && !open && '-translate-y-full',
      )}
    >
      {/* scroll progress — runs across the full top edge */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 z-10 h-[3px] origin-left bg-gradient-to-r from-cyan-snap via-mint to-violet-deep opacity-80"
        style={{ transform: `scaleX(${progress})` }}
      />

      <div className="mx-auto max-w-[1400px] px-3 sm:px-5">
        {/* floating glass pill */}
        <div
          className={cn(
            'relative z-50 mt-3 flex h-14 items-center justify-between gap-4 rounded-full border px-4 transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] sm:px-5 lg:mt-5 lg:h-16 lg:gap-6',
            'border-ink/10 bg-white/75 backdrop-blur-xl dark:border-paper/10 dark:bg-ink-soft/75',
            solid ? 'shadow-float bg-white/85 dark:bg-ink-soft/85' : 'shadow-card',
          )}
        >
          <Link to="/" data-nav-enter className="group flex items-center gap-2.5 rounded-full focus-ring">
            <span className="relative grid h-9 w-9 place-items-center rounded-xl bg-ink text-cyan-snap shadow-card transition-all duration-300 group-hover:rotate-12 group-hover:scale-105 dark:bg-ink-soft dark:text-neon">
              <Zap size={18} strokeWidth={2.4} />
            </span>
            <span className="font-display text-xl font-bold tracking-tight text-ink dark:text-paper">
              Code<span className="text-cyan-snap">tern</span>
            </span>
          </Link>

          {/* desktop links */}
          <nav className="hidden items-center gap-1 lg:flex" aria-label="Primary">
            {LINKS.map((l) =>
              l.dropdown ? (
                <div key={l.to} className="group relative" onMouseEnter={() => setDropdown(true)} onMouseLeave={() => setDropdown(false)}>
                  <NavLink
                    to={l.to}
                    data-nav-enter
                    onClick={() => setDropdown((v) => !v)}
                    aria-haspopup="menu"
                    aria-expanded={dropdown}
                    aria-controls="domains-dropdown"
                    className={({ isActive }) =>
                      cn(
                        'group/link relative flex items-center gap-1 rounded-full px-4 py-2 text-sm font-medium transition-colors duration-300 focus-ring',
                        isActive ? 'text-ink dark:text-paper' : 'text-ink/70 hover:text-ink dark:text-paper/70 dark:hover:text-paper',
                      )
                    }
                  >
                    {({ isActive }) => (
                      <>
                        {l.label}
                        <ChevronDown size={14} className={cn('transition-transform duration-300', dropdown && 'rotate-180')} />
                        <NavUnderline active={isActive} />
                      </>
                    )}
                  </NavLink>
                  <DomainsDropdown open={dropdown} onClose={() => setDropdown(false)} />
                </div>
              ) : (
                <NavLink
                  key={l.to}
                  to={l.to}
                  data-nav-enter
                  className={({ isActive }) =>
                    cn(
                      'group relative rounded-full px-4 py-2 text-sm font-medium transition-colors duration-300 focus-ring',
                      isActive ? 'text-ink dark:text-paper' : 'text-ink/70 hover:text-ink dark:text-paper/70 dark:hover:text-paper',
                    )
                  }
                >
                  {({ isActive }) => (
                    <>
                      {l.label}
                      <NavUnderline active={isActive} />
                    </>
                  )}
                </NavLink>
              ),
            )}
          </nav>

          {/* desktop actions */}
          <div className="hidden items-center gap-2.5 lg:flex" data-nav-enter>
            <ThemeToggle />
            {isAuthenticated ? (
              <Button size="sm" variant="ghost" magnetic={false} onClick={() => navigate(isAdmin ? '/admin' : '/dashboard')}>
                {isAdmin ? <ShieldCheck size={15} /> : <LayoutDashboard size={15} />}
                {isAdmin ? 'Admin' : 'Dashboard'}
              </Button>
            ) : (
              <Button size="sm" variant="ghost" magnetic={false} onClick={() => openLogin('login')}>
                Sign in
              </Button>
            )}
            <Button size="sm" magnetic onClick={go}>
              {isAuthenticated ? 'Continue' : 'Get started'}
            </Button>
          </div>

          {/* mobile toggle */}
          <button
            data-nav-enter
            className={cn(
              'relative grid h-11 w-11 place-items-center rounded-full border transition-colors duration-300 focus-ring lg:hidden',
              'border-ink/10 text-ink dark:border-paper/15 dark:text-paper',
              solid ? 'bg-ink/5 dark:bg-paper/10' : '',
            )}
            onClick={() => setOpen((v) => !v)}
            aria-label={open ? 'Close menu' : 'Open menu'}
            aria-expanded={open}
            aria-controls="mobile-drawer"
          >
            <span
              className={cn(
                'absolute h-[2px] w-4.5 rounded-full bg-current transition-all duration-300',
                open ? 'translate-y-0 rotate-45' : '-translate-y-[5px]',
              )}
            />
            <span
              className={cn(
                'absolute h-[2px] w-4.5 rounded-full bg-current transition-all duration-300',
                open ? 'translate-y-0 -rotate-45' : 'translate-y-[5px]',
              )}
            />
          </button>
        </div>
      </div>

      {/* mobile drawer */}
      <div
        id="mobile-drawer"
        className={cn(
          'fixed inset-x-0 top-0 z-40 overflow-hidden transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] lg:hidden',
          'border-b border-ink/8 bg-paper/95 backdrop-blur-xl dark:border-paper/10 dark:bg-ink/95',
        )}
        inert={open ? undefined : ''}
        style={{
          paddingTop: open ? '5.5rem' : '0rem',
          height: open ? '100vh' : '0px',
          opacity: open ? 1 : 0,
          pointerEvents: open ? 'auto' : 'none',
        }}
      >
        <div className="flex h-full flex-col overflow-y-auto px-6 pb-10 pt-6">
          <nav className="flex flex-col gap-1" aria-label="Mobile">
            {LINKS.map((l, i) => (
              <NavLink
                key={l.to}
                to={l.to}
                onClick={() => setOpen(false)}
                style={{
                  transitionDelay: open ? `${100 + i * 55}ms` : '0ms',
                }}
                className={({ isActive }) =>
                  cn(
                    'group flex items-center justify-between rounded-2xl px-4 py-3.5 text-base font-semibold transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] focus-ring',
                    open ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0',
                    isActive
                      ? 'bg-ink/8 text-ink dark:bg-paper/10 dark:text-paper'
                      : 'text-ink/80 hover:bg-ink/5 hover:text-ink dark:text-paper/80 dark:hover:bg-paper/5 dark:hover:text-paper',
                  )
                }
              >
                <span className="flex items-center gap-3">
                  <span className="grid h-7 w-7 place-items-center rounded-lg bg-cyan-snap/10 text-cyan-deep dark:bg-cyan-snap/10 dark:text-cyan-snap">
                    <Sparkles size={13} />
                  </span>
                  {l.label}
                </span>
                <ArrowRight size={16} className="text-ink/50 transition-transform duration-300 group-hover:translate-x-1 dark:text-paper/50" />
              </NavLink>
            ))}
          </nav>

          <div className="mt-auto flex gap-2.5 pt-8">
            <ThemeToggle />
            <div className="flex flex-1 gap-2.5">
              <Button size="sm" variant="ghost" className="flex-1" onClick={() => { setOpen(false); openLogin('login') }}>
                Sign in
              </Button>
              <Button
                size="sm"
                className="flex-1"
                onClick={() => {
                  setOpen(false)
                  isAuthenticated ? navigate('/dashboard') : openLogin('signup')
                }}
              >
                {isAuthenticated ? 'Continue' : 'Get started'}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}