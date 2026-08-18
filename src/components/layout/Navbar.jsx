import { useEffect, useRef, useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { ArrowRight, BadgeCheck, Home, Info, Mail, Tag } from 'lucide-react'
import { cn } from '../../lib/utils.js'
import { Button } from '../ui/Button.jsx'
import { ThemeToggle } from '../ui/ThemeToggle.jsx'
import { openRegistration } from '../../lib/analytics.js'
import { gsap } from '../../lib/gsap.js'

const LINKS = [
  { to: '/', label: 'Home', icon: Home },
  { to: '/about', label: 'About', icon: Info },
  { to: '/certification', label: 'Certification', icon: BadgeCheck },
  { to: '/pricing', label: 'Pricing', icon: Tag },
  { to: '/contact', label: 'Contact', icon: Mail },
]

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

export function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [hidden, setHidden] = useState(false)
  const [progress, setProgress] = useState(0)
  const [open, setOpen] = useState(false)
  const root = useRef(null)
  const lastY = useRef(0)
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

  // escape closes drawer
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') {
        setOpen(false)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

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
            <span className="relative h-9 w-9 place-items-center rounded-xl bg-[#eee] text-cyan-snap shadow-card transition-all duration-300 group-hover:scale-105 dark:bg-ink-soft dark:text-neon">
              <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width={45}
                  height={35}
                  preserveAspectRatio="none"
                  viewBox="0 0 1632 1256"
                >
                  <path
                    fill="#1A253F"
                    d="M692.354 199.421c7.536-.947 31.099-.512 39.313-.507l76.797.034c38.577-.134 77.155-.066 115.731.206 45.804-.003 101.315-4.559 139.935 25.491 59.7 45.854 108.24 107.264 163.26 157.704 44.4 40.706 48.49 56.152 67.6 113.502-30.66 13.93-73.94 34.132-104.72 46.09-5.03-20.729-11.6-43.245-22.99-61.42-6.85-10.932-18.48-20.893-27.54-30.109-16.62-16.893-33.17-33.667-50.05-50.291-16.85-16.589-32.88-34.011-49.79-50.505-14.58-14.226-32.14-29.633-51.803-36.014-23.521-7.632-91.582-4.591-119.111-4.595-39.531-.256-79.063-.278-118.593-.066-31.351.382-58.097-.879-84.927 18.564-28.771 20.85-51.433 48.778-76.77 73.446-30.716 28.579-59.464 60.923-89.469 89.822-34.537 33.263-40.634 61.661-40.042 109.099.853 68.338-.264 137.789.71 206.234.277 19.468 1.013 40.607 9.506 58.55 15.681 32.708 46.633 57.742 72.011 83.094l71.865 71.36c28.797 28.36 47.509 60.02 91.43 66.42 16.542 2.41 32.851 1.38 49.475 1.9 26.877.85 53.696-.03 80.568-.38 28.561-.26 57.653.13 86.133.18 37.186.07 62.589 3.44 94.397-19.92 28.59-20.99 48.4-47.05 73.46-71.498l64.63-63.617c8.69-8.457 23.91-21.325 31.13-29.988 8.97 9.587 21.74 18.493 32.07 27.055 17.24 14.305 34.33 31.832 53.5 43.226-9.84 9.527-19.27 20.255-29.05 29.992l-104.04 103.02c-22.87 22.81-50.69 54.75-77.62 71.32-44.92 27.63-106.743 19.77-157.517 20.32-48.38.82-96.769 1.04-145.155.65-31.545-.14-67.208 1.03-97.967-5.11-46.117-9.19-76.968-47.59-108.379-78.98a5255.426 5255.426 0 0 1-95.468-96.16c-20.215-20.67-63.896-60.592-78.714-82.608a155.904 155.904 0 0 1-26.612-74.948c-1.064-13.865-.583-31.378-.872-45.606a7045.35 7045.35 0 0 1-.7-127.653l-.026-86.542c-.003-29.084-1.062-55.094 4.511-83.938 10.185-52.714 43.967-80.033 80.456-115.804l75.745-74.649 54.377-54.33c42.546-42.794 65.942-67.393 129.315-72.041z"
                  />
                  <path
                    fill="#9fa4f6"
                    d="m1318.04 606.248 1.06.379c2.15 6.758-17.43 187.881-19.46 208.369l-11.95 126.529c-35.22-26.604-79.76-61.719-113.66-90.485-8.71 9.371-20.63 20.462-29.92 29.663l-60.04 59.648c-26.76 26.719-52.53 56.157-82.54 78.969-32.676 24.84-68.856 21.68-107.387 21.68l-90.201-.03-52.58.24c-34.678.22-56.727 2.66-78.637-29.63-13.861-23.715-9.662-55.439 10.433-74.302 10.847-10.183 25.396-16.71 40.461-15.734 9.431.611 19.294 4.363 28.425 6.887 7.668 2.12 15.363 3.033 23.226 3.13 41.06.507 82.118.257 123.177.177 9.402-.017 19.014-.665 28.102-3.199 28.655-10.113 48.026-37.176 69.64-57.208 30.011-29.189 58.391-59.592 88.781-88.079-30.83-22.597-70.6-54.441-101.61-74.797 22.64-9.027 61.22-19.607 85.56-26.736l101.24-30.534c45.89-13.635 102.19-33.83 147.88-44.937zM765.602 363.419c8.937-1.277 53.205-.891 63.353-.614 31.132.847 71.939-1.776 101.923 2.187a148.813 148.813 0 0 1 40.486 11.137 149.109 149.109 0 0 1 32.876 19.291c18.71 14.447 38.38 35.69 55.2 52.371 21.43 21.258 44.72 41.594 62.43 66.06 11.16 15.429 17.27 30.681 24.29 48.238-21.96 10.754-44.17 19.6-66.77 28.885-2.19-8.168-4.56-14.154-8.42-21.64a100.724 100.724 0 0 0-12.59-19.099c-9.65-11.427-27.7-28.107-38.88-39.458-19.22-18.772-37.211-38.558-57.921-55.725-19.89-17.41-48.738-21.539-74.878-19.552-40.706 3.095-120.042-8.222-154.781 9.847a107.241 107.241 0 0 0-20.185 13.474c-10.418 8.866-28.795 27.379-38.082 37.643-24.638 27.231-67.644 58.084-78.59 93.245-6.841 20.601-4.747 72.851-4.387 96.226 2.359 54.73-12.127 100.206 33.159 141.698 24.351 22.311 47.38 47.929 71.492 69.926-27.278 11.848-39.985 23.294-51.869 50.773-28.55-28.987-61.277-57.348-87.656-88.021-41.278-47.995-37.545-109.426-37.453-168.616.101-64.734-7.58-129.248 39.557-181.489 17.81-19.821 37.672-37.983 56.116-57.249 50.249-51.543 76.533-83.418 151.58-89.538z"
                  />
                </svg>
            </span>
            <span className="font-display text-xl font-bold tracking-tight text-ink dark:text-paper">
              Code<span className="text-cyan-snap">tern</span>
            </span>
          </Link>

          {/* desktop links */}
          <nav className="hidden items-center gap-1 lg:flex" aria-label="Primary">
            {LINKS.map((l) => (
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
            ))}
          </nav>

          {/* desktop actions */}
          <div className="hidden items-center gap-2.5 lg:flex" data-nav-enter>
            <ThemeToggle />
            <Button size="sm" magnetic onClick={() => openRegistration('navbar')}>
              Register
              <ArrowRight size={15} />
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
                    <l.icon size={13} />
                  </span>
                  {l.label}
                </span>
                <ArrowRight size={16} className="text-ink/50 transition-transform duration-300 group-hover:translate-x-1 dark:text-paper/50" />
              </NavLink>
            ))}
          </nav>

          <div className="mt-auto flex items-center gap-2.5 pt-8">
            <ThemeToggle />
            <Button
              size="sm"
              className="flex-1"
              onClick={() => {
                setOpen(false)
                openRegistration('navbar-mobile')
              }}
            >
              Register for the next cohort
              <ArrowRight size={15} />
            </Button>
          </div>
        </div>
      </div>
    </header>
  )
}