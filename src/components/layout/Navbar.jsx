import { useEffect, useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { LayoutDashboard, Menu, ShieldCheck, X, Zap } from 'lucide-react'
import { cn } from '../../lib/utils.js'
import { useAuth } from '../../context/AppContext.jsx'
import { Button } from '../ui/Button.jsx'
import { useLoginModal } from '../ui/LoginModal.jsx'

const LINKS = [
  { to: '/', label: 'Home' },
  { to: '/about', label: 'About' },
  { to: '/domains', label: 'Domains' },
  { to: '/portfolio', label: 'Projects' },
  { to: '/certification', label: 'Certification' },
  { to: '/contact', label: 'Contact' },
]

export function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)
  const { isAuthenticated, isAdmin } = useAuth()
  const navigate = useNavigate()
  const openLogin = useLoginModal()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => setOpen(false), [])

  return (
    <header
      className={cn(
        'fixed inset-x-0 top-0 z-50 transition-all duration-500',
        scrolled ? 'glass shadow-card' : 'bg-transparent',
      )}
    >
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 lg:px-8">
        <Link to="/" className="group flex items-center gap-2.5">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-ink text-cyan-snap transition-transform duration-300 group-hover:rotate-6">
            <Zap size={18} strokeWidth={2.4} />
          </span>
          <span className="font-display text-xl font-bold tracking-tight text-ink">
            Code<span className="text-cyan-snap">tern</span>
          </span>
        </Link>

        <div className="hidden items-center gap-1 lg:flex">
          {LINKS.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              className={({ isActive }) =>
                cn(
                  'rounded-full px-4 py-2 text-sm font-medium transition-colors',
                  isActive ? 'bg-ink/8 text-ink' : 'text-ink/60 hover:bg-ink/5 hover:text-ink',
                )
              }
            >
              {l.label}
            </NavLink>
          ))}
        </div>

        <div className="hidden items-center gap-2.5 lg:flex">
          {isAuthenticated ? (
            <>
              <Button
                size="sm"
                variant="ghost"
                magnetic={false}
                onClick={() => navigate(isAdmin ? '/admin' : '/dashboard')}
              >
                {isAdmin ? <ShieldCheck size={15} /> : <LayoutDashboard size={15} />}
                {isAdmin ? 'Admin' : 'Dashboard'}
              </Button>
            </>
          ) : (
            <Button size="sm" variant="ghost" magnetic={false} onClick={() => openLogin('login')}>
              Sign in
            </Button>
          )}
          <Button size="sm" magnetic onClick={() => (isAuthenticated ? navigate('/dashboard') : openLogin('signup'))}>
            {isAuthenticated ? 'Continue' : 'Get started'}
          </Button>
        </div>

        <button
          className="grid h-10 w-10 place-items-center rounded-xl border border-ink/10 text-ink lg:hidden"
          onClick={() => setOpen((v) => !v)}
          aria-label="Toggle menu"
        >
          {open ? <X size={18} /> : <Menu size={18} />}
        </button>
      </nav>

      {/* Mobile drawer */}
      <div
        className={cn(
          'overflow-hidden border-b border-ink/10 bg-paper/95 backdrop-blur-md transition-all duration-400 lg:hidden',
          open ? 'max-h-[480px] opacity-100' : 'max-h-0 opacity-0',
        )}
      >
        <div className="flex flex-col gap-1 px-5 py-4">
          {LINKS.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              onClick={() => setOpen(false)}
              className={({ isActive }) =>
                cn(
                  'rounded-xl px-4 py-3 text-sm font-medium',
                  isActive ? 'bg-ink/8 text-ink' : 'text-ink/65 hover:bg-ink/5',
                )
              }
            >
              {l.label}
            </NavLink>
          ))}
          <div className="mt-3 flex gap-2">
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
              Get started
            </Button>
          </div>
        </div>
      </div>
    </header>
  )
}