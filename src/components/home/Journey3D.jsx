import { useEffect, useRef, useState } from 'react'
import { ArrowRight, BrainCircuit, CalendarCheck, MoveHorizontal, Rocket, UserCheck, Video } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { gsap, ScrollTrigger } from '../../lib/gsap.js'
import { useAuth } from '../../context/AppContext.jsx'
import { useLoginModal } from '../ui/LoginModal.jsx'
import { cn } from '../../lib/utils.js'
import { StarfieldBackground } from '../ui/backgrounds/StarfieldBackground.jsx'

const MILESTONES = [
  { icon: UserCheck, step: '01', title: 'Profile & resume', desc: 'Your identity, resume and track on file — the internship officially begins.', color: '#b4ff39' },
  { icon: Rocket, step: '02', title: 'Live workspace', desc: 'Weekly sprints; a mentor curates your checklist and reviews every PR.', color: '#38ffb0' },
  { icon: CalendarCheck, step: '03', title: 'Production handoff', desc: 'Deploy with CI, tests and a mentor sign-off — your work goes live.', color: '#22d3ee' },
  { icon: BrainCircuit, step: '04', title: 'Final assessment', desc: 'Timed screening tuned per domain by your admin.', color: '#7c5cff' },
  { icon: Video, step: '05', title: 'Final interview', desc: 'AI-scored mock interview with a verified scorecard.', color: '#ff5c7a' },
]

const AUTO_DEG_PER_S = 14
const N = MILESTONES.length

/**
 * Journey3D — an orbiting internship timeline. Five milestone nodes revolve
 * around a glowing core; drag to spin with inertia, scroll to rotate the arc,
 * or let it orbit on its own. The front-most node drives the center label.
 */
export function Journey3D() {
  const stage = useRef(null)
  const nodes = useRef([])
  const orbitEl = useRef(null)
  const cometEl = useRef(null)
  const coreLabel = useRef(null)

  const reduced = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches

  const angle = useRef(0)
  const vel = useRef(0)
  const down = useRef(false)
  const lastX = useRef(null)
  const tween = useRef(null)
  const dims = useRef({ rx: 300, ry: 110 })
  const progress = useRef(0)

  const [active, setActive] = useState(0)
  const [dragging, setDragging] = useState(false)
  const { isAuthenticated } = useAuth()
  const openLogin = useLoginModal()
  const navigate = useNavigate()

  const layout = () => {
    const w = stage.current?.clientWidth || 720
    const rx = Math.max(150, Math.min(330, w / 2 - 48))
    const ry = Math.max(68, rx * 0.36)
    dims.current = { rx, ry }
    const px = `${rx * 2}px`
    const py = `${ry * 2}px`
    if (orbitEl.current) {
      orbitEl.current.style.width = px
      orbitEl.current.style.height = py
    }
    if (cometEl.current) {
      cometEl.current.style.width = px
      cometEl.current.style.height = py
    }
  }

  const render = () => {
    const { rx, ry } = dims.current
    let frontIdx = 0
    let best = -Infinity
    for (let i = 0; i < N; i++) {
      const el = nodes.current[i]
      if (!el) continue
      const deg = angle.current + (i * 360) / N
      const rad = (deg * Math.PI) / 180
      const depth = (Math.cos(rad) + 1) / 2 // 0 back → 1 front
      el.style.transform = `translate3d(${Math.sin(rad) * rx}px, ${-Math.cos(rad) * ry}px, 0) translate(-50%, -50%) scale(${0.66 + depth * 0.6})`
      el.style.opacity = 0.28 + depth * 0.72
      el.style.zIndex = Math.round(depth * 10)
      if (Math.cos(rad) > best) {
        best = Math.cos(rad)
        frontIdx = i
      }
    }
    if (cometEl.current) cometEl.current.style.transform = `rotate(${angle.current}deg)`
    setActive((prev) => (prev === frontIdx ? prev : frontIdx))
  }

  useEffect(() => {
    layout()
    window.addEventListener('resize', layout)

    if (reduced) {
      render()
      return () => window.removeEventListener('resize', layout)
    }

    const ticker = gsap.ticker.add((_t, delta) => {
      if (down.current) return
      angle.current = (angle.current + (AUTO_DEG_PER_S * delta) / 1000 + progress.current * 0.12) % 360
      render()
    })

    const st = ScrollTrigger.create({
      trigger: stage.current,
      start: 'top bottom',
      end: 'bottom top',
      scrub: 1.5,
      onUpdate: (self) => {
        progress.current = self.progress
      },
    })

    render()

    return () => {
      window.removeEventListener('resize', layout)
      gsap.ticker.remove(ticker)
      st.kill()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reduced])

  // center label swap animation
  useEffect(() => {
    const el = coreLabel.current
    if (!el || reduced) return
    gsap.fromTo(el, { opacity: 0, y: 10, scale: 0.98 }, { opacity: 1, y: 0, scale: 1, duration: 0.45, ease: 'power3.out' })
  }, [active, reduced])

  const onPointerDown = (e) => {
    if (reduced) return
    tween.current?.kill()
    down.current = true
    lastX.current = e.clientX
    vel.current = 0
    setDragging(true)
    e.currentTarget.setPointerCapture?.(e.pointerId)
  }

  const onPointerMove = (e) => {
    if (!down.current) return
    const dx = e.clientX - (lastX.current ?? e.clientX)
    lastX.current = e.clientX
    vel.current = dx * 0.25
    angle.current = (angle.current - dx * 0.25) % 360
    render()
  }

  const onPointerUp = () => {
    if (!down.current) return
    down.current = false
    setDragging(false)
    const obj = { v: vel.current }
    tween.current = gsap.to(obj, {
      v: 0,
      duration: 0.8,
      ease: 'power3.out',
      onUpdate: () => {
        angle.current = (angle.current + obj.v) % 360
        render()
      },
    })
  }

  const jumpTo = (i) => {
    const target = (i * 360) / N
    const current = ((angle.current % 360) + 360) % 360
    const delta = (((target - current + 540) % 360) + 360) % 360 - 180
    tween.current?.kill()
    down.current = false
    const obj = { a: 0, last: 0 }
    tween.current = gsap.to(obj, {
      a: delta,
      duration: 0.9,
      ease: 'power4.out',
      onUpdate: () => {
        angle.current = (angle.current + (obj.a - obj.last)) % 360
        obj.last = obj.a
        render()
      },
    })
  }

  const go = () => (isAuthenticated ? navigate('/dashboard') : openLogin('signup'))
  const current = MILESTONES[active]
  const ActiveIcon = current.icon

  return (
    <section className="relative overflow-hidden bg-paper py-24 text-ink dark:bg-ink dark:text-paper">
      <div className="grid-lines absolute inset-0 opacity-15" />
      <StarfieldBackground count={110} speed={0.6} className="opacity-50" />

      <div className="relative mx-auto grid max-w-7xl items-center gap-14 px-5 lg:grid-cols-2 lg:px-8">
        {/* copy */}
        <div data-enter>
          <span className="mb-5 inline-flex items-center gap-2 rounded-bubble border border-neon-deep/40 bg-neon-deep/10 px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-neon-deep dark:border-neon/40 dark:bg-neon/10 dark:text-neon">
            Your 3-month orbit
          </span>
          <h2 className="font-display text-balance text-4xl font-extrabold leading-[1.05] tracking-tight sm:text-5xl">
            Five milestones.
            <br />
            One internship <span className="text-gradient-deep dark:text-gradient-snap">that ships.</span>
          </h2>
          <p className="mt-5 max-w-lg text-base leading-relaxed text-ink/60 dark:text-paper/60">
            An internship unfolds like an orbit — profile, sprint, production, assessment, interview. Drag the ring to
            spin it, scroll to shift the arc, or let it revolve and watch each stage drift into focus.
          </p>

          {/* active milestone card */}
          <div
            key={active}
            ref={coreLabel}
            className="mt-7 overflow-hidden rounded-panel border border-ink/10 bg-white p-5 shadow-card dark:border-paper/10 dark:bg-ink-soft"
          >
            <div className="flex items-center gap-3">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl" style={{ background: `${current.color}22`, color: current.color }}>
                <ActiveIcon size={18} />
              </span>
              <div className="min-w-0">
                <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: current.color }}>
                  Milestone {current.step}
                </p>
                <p className="font-display text-base font-bold">{current.title}</p>
              </div>
              <span className="ml-auto font-display text-3xl font-extrabold text-ink/10 dark:text-paper/10">{current.step}</span>
            </div>
            <p className="mt-2.5 text-sm leading-relaxed text-ink/60 dark:text-paper/55">{current.desc}</p>
          </div>

          {/* milestone chips */}
          <div className="mt-6 flex flex-wrap gap-2">
            {MILESTONES.map((m, i) => (
              <button
                key={m.step}
                onClick={() => jumpTo(i)}
                aria-pressed={active === i}
                className={cn(
                  'focus-ring flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold transition-all duration-300',
                  active === i
                    ? 'shadow-card'
                    : 'border-ink/12 bg-ink/5 text-ink/60 hover:border-ink/30 hover:text-ink dark:border-white/12 dark:bg-paper/5 dark:text-paper/60 dark:hover:border-white/30 dark:hover:text-paper',
                )}
                style={active === i ? { background: m.color, color: 'var(--color-ink)' } : undefined}
              >
                <span className="grid h-4 w-4 place-items-center rounded-full text-[9px] font-black" style={{ background: m.color, color: 'var(--color-ink)' }}>
                  {m.step[1]}
                </span>
                {m.title}
              </button>
            ))}
          </div>

          <button
            onClick={go}
            className="group mt-9 inline-flex items-center gap-2 rounded-full bg-neon px-7 py-3.5 text-sm font-bold text-ink shadow-float transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_24px_60px_-20px_rgba(180,255,57,0.5)] focus-ring-dark"
          >
            Start my journey
            <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
          </button>
        </div>

        {/* orbit stage */}
        <div data-enter-scale>
          <div className="relative mx-auto aspect-square w-full max-w-[520px] select-none">
            <div
              ref={stage}
              onPointerDown={onPointerDown}
              onPointerMove={onPointerMove}
              onPointerUp={onPointerUp}
              onPointerCancel={onPointerUp}
              onPointerLeave={onPointerUp}
              className={cn(
                'absolute inset-0 touch-pan-y will-change-transform',
                dragging ? 'cursor-grabbing' : 'cursor-grab',
              )}
              role="group"
              aria-label="Drag to spin the internship milestones orbit"
            >
              {/* dashed orbit path */}
              <div
                ref={orbitEl}
                className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-[50%] border border-dashed border-ink/15 dark:border-paper/15"
                aria-hidden
              />
              {/* comet head racing along the orbit */}
              <div ref={cometEl} className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2" aria-hidden>
                <span
                  className="absolute left-1/2 top-0 h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full"
                  style={{ background: 'var(--color-neon)', boxShadow: '0 0 16px 5px rgba(180,255,57,0.5)' }}
                />
              </div>

              {/* glowing core */}
              <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
                <span className="absolute left-1/2 top-1/2 h-44 w-44 -translate-x-1/2 -translate-y-1/2 animate-pulse rounded-full blur-2xl" style={{ background: `${current.color}26` }} />
                <span
                  className="absolute -inset-6 rounded-full border border-dashed opacity-40"
                  style={{ borderColor: current.color }}
                />
                <span
                  className="relative grid h-20 w-20 place-items-center rounded-full shadow-float"
                  style={{
                    background: `radial-gradient(circle at 32% 28%, ${current.color}, ${current.color}55 45%, rgba(11,14,26,0.92) 115%)`,
                  }}
                >
                  <ActiveIcon size={30} className="text-ink" strokeWidth={2.2} />
                </span>
              </div>

              {/* orbiting nodes */}
              {MILESTONES.map((m, i) => {
                const NodeIcon = m.icon
                return (
                  <div
                    key={m.step}
                    ref={(el) => { nodes.current[i] = el }}
                    className="absolute left-1/2 top-1/2"
                  >
                    <div className="relative grid h-12 w-12 place-items-center">
                      <span
                        className="absolute inset-0 rounded-full blur-md"
                        style={{ background: m.color, opacity: 0.5 }}
                      />
                      <span
                        className="relative grid h-12 w-12 place-items-center rounded-full border-2"
                        style={{ background: 'rgba(11,14,26,0.92)', borderColor: m.color, boxShadow: `0 0 18px -2px ${m.color}99` }}
                      >
                        <NodeIcon size={17} style={{ color: m.color }} />
                        <span className="absolute -bottom-1.5 -right-1.5 grid h-5 w-5 place-items-center rounded-full text-[9px] font-black" style={{ background: m.color, color: 'var(--color-ink)' }}>
                          {m.step[1]}
                        </span>
                      </span>
                    </div>
                  </div>
                )
              })}

              {/* drag hint */}
              <span className="pointer-events-none absolute bottom-2 left-1/2 flex -translate-x-1/2 items-center gap-1.5 rounded-bubble border border-ink/10 bg-ink/5 px-3 py-1 text-[10px] font-semibold uppercase tracking-widest text-ink/50 backdrop-blur-sm dark:border-white/10 dark:bg-white/5 dark:text-paper/50">
                <MoveHorizontal size={11} /> Drag to spin
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}