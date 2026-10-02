import { useEffect, useRef, useState } from 'react'
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom'
import { ArrowRight, ArrowUpRight, BookOpen, Home, Info, Mail, Tag, User, LayoutDashboard, MessagesSquare, LogOut } from 'lucide-react'
import { cn } from '../../lib/utils.js'
import { Button } from '../ui/Button.jsx'
import { ThemeToggle } from '../ui/ThemeToggle.jsx'
import { useAuth } from '../../context/AuthContext.jsx'

const LINKS = [
  { to: '/', label: 'Home', icon: Home },
  { to: '/courses', label: 'Courses', icon: BookOpen },
  { to: '/pricing', label: 'Pricing', icon: Tag },
  { to: '/about', label: 'About', icon: Info },
  { to: '/contact', label: 'Contact', icon: Mail },
]

function AuthButtons({ mobile = false }) {
  const { user, isAdmin, loading, signOut } = useAuth()
  const navigate = useNavigate()
  // hooks first — always in the same order (Rules of Hooks)
  const [menu, setMenu] = useState(false)
  const menuRef = useRef(null)

  useEffect(() => {
    if (!menu || mobile || loading || !user) return
    const onDoc = (e) => {
      if (!menuRef.current?.contains(e.target)) setMenu(false)
    }
    document.addEventListener('mousedown', onDoc)
    return () => document.removeEventListener('mousedown', onDoc)
  }, [menu, mobile, loading, user])

  if (loading) {
    return (
      <div className={cn('flex items-center gap-2', mobile && 'w-full')} aria-label="Checking login">
        <span className={cn('animate-pulse rounded-full bg-ink/10 dark:bg-paper/10', mobile ? 'h-9 flex-1' : 'h-9 w-24')} />
        <span className={cn('animate-pulse rounded-full bg-ink/10 dark:bg-paper/10', mobile ? 'h-9 flex-1' : 'h-9 w-24')} />
      </div>
    )
  }
  if (!user) {
    return (
      <div className={cn('flex items-center gap-2', mobile && 'w-full')}>
        <Link to="/login" className={mobile ? 'flex-1' : ''}>
          <Button size="sm" className={mobile ? 'w-full' : ''}>
            Sign in <ArrowRight size={15} />
          </Button>
        </Link>
        <Link to="/join" className={mobile ? 'flex-1' : ''}>
          <Button size="sm" variant="neon" className={mobile ? 'w-full' : ''}>
            Join now
          </Button>
        </Link>
      </div>
    )
  }
  if (mobile) {
    return (
      <div className="flex w-full items-center gap-2">
        <Link to="/profile" className="flex-1">
          <Button size="sm" variant="secondary" className="w-full border border-ink/10 bg-ink/5 dark:border-paper/15 dark:bg-paper/10">
            <User size={14} /> Profile
          </Button>
        </Link>
        <Link to={isAdmin ? '/admin' : '/dashboard'} className="flex-1">
          <Button size="sm" className="w-full">
            {isAdmin ? 'Admin panel' : 'My learning'}
          </Button>
        </Link>
      </div>
    )
  }

  const items = isAdmin
    ? [{ to: '/admin', label: 'Admin panel', Icon: LayoutDashboard }, { to: '/profile', label: 'Profile', Icon: User }]
    : [
        { to: '/profile', label: 'Profile', Icon: User },
        { to: '/dashboard', label: 'My learning', Icon: LayoutDashboard },
        { to: '/messages', label: 'Messages', Icon: MessagesSquare },
      ]

  return (
    <div ref={menuRef} className="relative flex items-center gap-2">
      <Link to={isAdmin ? '/admin' : '/dashboard'}>
        <Button size="sm" variant="secondary" className="border border-ink/10 bg-ink/5 dark:border-paper/15 dark:bg-paper/10">
          {isAdmin ? 'Admin panel' : 'My learning'} <ArrowUpRight size={14} />
        </Button>
      </Link>
      <button
        onClick={() => setMenu((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={menu}
        title={user.email || ''}
        className="grid h-9 w-9 shrink-0 place-items-center overflow-hidden rounded-full border border-ink/10 bg-white text-sm font-bold transition hover:scale-105 dark:border-paper/15 dark:bg-ink-soft"
      >
        {user.photoURL ? <img src={user.photoURL} alt="" className="h-full w-full object-cover" /> : (user.displayName || user.email || 'S').slice(0, 1).toUpperCase()}
      </button>
      <div className={cn(
        'absolute right-0 top-full z-50 mt-2 w-60 origin-top-right overflow-hidden rounded-2xl border border-ink/10 bg-white p-1.5 shadow-float transition-all duration-200 dark:border-paper/15 dark:bg-ink-soft',
        menu ? 'visible scale-100 opacity-100' : 'invisible scale-95 opacity-0',
      )}>
        <div className="flex items-center gap-2.5 rounded-xl bg-paper px-3 py-2.5 dark:bg-ink">
          <span className="grid h-9 w-9 shrink-0 place-items-center overflow-hidden rounded-full bg-ink text-sm font-bold text-white dark:bg-paper dark:text-ink">
            {user.photoURL ? <img src={user.photoURL} alt="" className="h-full w-full object-cover" /> : (user.displayName || 'S').slice(0, 1).toUpperCase()}
          </span>
          <span className="min-w-0">
            <span className="block truncate text-sm font-bold">{user.displayName || 'Student'}</span>
            <span className="block truncate text-[11px] opacity-50">{user.email}</span>
          </span>
        </div>
        <nav className="mt-1 grid gap-0.5" aria-label="Account">
          {items.map(({ to, label, Icon }) => (
            <Link key={to} to={to} onClick={() => setMenu(false)}
              className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-bold transition hover:bg-ink/5 dark:hover:bg-paper/10">
              <Icon size={15} className="opacity-50" /> {label}
            </Link>
          ))}
          <button
            onClick={() => { setMenu(false); signOut().then(() => navigate('/')) }}
            className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-left text-sm font-bold text-rose-600 transition hover:bg-rose-500/10 dark:text-rose-400"
          >
            <LogOut size={15} className="opacity-70" /> Sign out
          </button>
        </nav>
      </div>
    </div>
  )
}

export function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)
  const { pathname } = useLocation()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => setOpen(false), [pathname])

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [open ])

  return (
    <header className="fixed inset-x-0 top-0 z-50">
      <div className="mx-auto max-w-5xl px-3 sm:px-5">
        <div className={cn(
          'relative z-50 mt-3 flex h-14 items-center justify-between gap-3 rounded-full border px-3 transition-all duration-500 sm:px-4 lg:mt-4',
          'border-ink/10 bg-white/80 text-ink backdrop-blur-xl dark:border-paper/10 dark:bg-ink-soft/80 dark:text-paper',
          scrolled ? 'shadow-float' : 'shadow-card',
        )}>
          <Link to="/" className="group flex items-center gap-2 rounded-full px-1" aria-label="Codetern home">
            <img src="/favicon.png" alt="Codetern logo" className="h-8 w-8 rounded-lg object-contain transition group-hover:rotate-6 group-hover:scale-105" />
            <span className="font-display text-lg font-bold tracking-tight">
              Code<span className="text-cyan-deep dark:text-cyan-snap">tern</span>
            </span>
          </Link>

          <nav className="hidden items-center gap-0.5 lg:flex" aria-label="Primary">
            {LINKS.map((l) => (
              <NavLink key={l.to} to={l.to}
                className={({ isActive }) => cn(
                  'group relative rounded-full px-4 py-2 text-sm font-semibold transition',
                  isActive ? 'bg-ink text-white dark:bg-paper dark:text-ink' : 'text-ink/65 hover:bg-ink/5 hover:text-ink dark:text-paper/65 dark:hover:bg-paper/10 dark:hover:text-paper',
                )}>
                {l.label}
              </NavLink>
            ))}
          </nav>

          <div className="hidden items-center gap-2 lg:flex">
            <ThemeToggle />
            <AuthButtons />
          </div>

          <button
            className="grid h-10 w-10 place-items-center rounded-full border border-ink/10 transition hover:bg-ink/5 lg:hidden dark:border-paper/15 dark:hover:bg-paper/10"
            onClick={() => setOpen((v) => !v)}
            aria-label={open ? 'Close menu' : 'Open menu'}
            aria-expanded={open}
          >
            <span className={cn('absolute h-[2px] w-4 rounded-full bg-current transition-all', open ? 'rotate-45' : '-translate-y-[4px]')} />
            <span className={cn('absolute h-[2px] w-4 rounded-full bg-current transition-all', open ? '-rotate-45' : 'translate-y-[4px]')} />
          </button>
        </div>
      </div>

      <div className={cn(
        'fixed inset-x-0 top-0 -z-0 overflow-hidden bg-paper/95 backdrop-blur-xl transition-all duration-500 lg:hidden dark:bg-ink/95',
        open ? 'h-[100dvh] opacity-100' : 'pointer-events-none h-0 opacity-0',
      )}>
        <div className="flex h-full flex-col overflow-y-auto px-6 pb-10 pt-24">
          <nav className="grid gap-1.5" aria-label="Mobile">
            {LINKS.map((l, i) => (
              <NavLink key={l.to} to={l.to} onClick={() => setOpen(false)}
                style={{ transitionDelay: open ? `${80 + i * 50}ms` : '0ms' }}
                className={({ isActive }) => cn(
                  'flex items-center justify-between rounded-2xl px-4 py-3.5 text-base font-bold transition-all duration-500',
                  open ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0',
                  isActive ? 'bg-ink text-white dark:bg-paper dark:text-ink' : 'bg-ink/5 dark:bg-paper/5',
                )}>
                <span className="flex items-center gap-3"><l.icon size={16} />{l.label}</span>
                <ArrowRight size={16} className="opacity-50" />
              </NavLink>
            ))}
          </nav>
          <div className="mt-auto flex items-center gap-2 pt-8">
            <ThemeToggle />
            <AuthButtons mobile />
          </div>
        </div>
      </div>
    </header>
  )
}
