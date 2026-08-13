import { useEffect, useRef, useState } from 'react'
import { ArrowRight, BrainCircuit, CalendarCheck, MoveHorizontal, Rocket, UserCheck, Video } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { gsap } from '../../lib/gsap.js'
import { useAuth } from '../../context/AppContext.jsx'
import { useLoginModal } from '../ui/LoginModal.jsx'
import { cn } from '../../lib/utils.js'
import { StarfieldBackground } from '../ui/backgrounds/StarfieldBackground.jsx'

const MILESTONES = [
  { icon: CalendarCheck, step: '01', title: 'Book your seat', desc: 'Pick a track and batch while live seats last.', color: '#22d3ee', z: 0 },
  { icon: UserCheck, step: '02', title: 'Profile & resume', desc: 'Your identity, resume and track on file.', color: '#b4ff39', z: 90 },
  { icon: Rocket, step: '03', title: 'Live workspace', desc: 'Ship real tasks with a mentor curating your checklist.', color: '#38ffb0', z: 180 },
  { icon: BrainCircuit, step: '04', title: 'Final assessment', desc: 'Timed screening tuned per domain by your admin.', color: '#7c5cff', z: 270 },
  { icon: Video, step: '05', title: 'Final interview', desc: 'AI-scored mock interview with a verified scorecard.', color: '#ff5c7a', z: 360 },
]

const clamp = gsap.utils.clamp(-170, 170)

/**
 * Journey3D — five milestones on a 3D ring that spins with scroll
 * (ScrollTrigger scrub) AND with direct drag. Dragging the stage
 * rotates the ring freely (with inertia on release); scrolling adds
 * its own rotation on top, so both controls compose.
 */
export function Journey3D() {
  const stage = useRef(null)
  const ring = useRef(null)
  const cards = useRef([])

  const baseRot = useRef(-34)      // scroll contribution, degrees
  const dragRot = useRef(0)        // user drag contribution, degrees
  const down = useRef(false)
  const lastX = useRef(null)
  const vel = useRef(0)
  const tween = useRef(null)

  const [dragging, setDragging] = useState(false)
  const { isAuthenticated } = useAuth()
  const openLogin = useLoginModal()
  const navigate = useNavigate()

  const applyRotation = () => {
    if (ring.current) gsap.set(ring.current, { rotationY: baseRot.current + dragRot.current })
  }

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const ctx = gsap.context(() => {
      // scroll spins the stage around the Y axis (base) and tilts it down
      gsap.to(stage.current, {
        rotateX: 6,
        ease: 'none',
        scrollTrigger: {
          trigger: stage.current,
          start: 'top bottom',
          end: 'bottom top',
          scrub: 1.2,
          onUpdate: (self) => {
            baseRot.current = gsap.utils.interpolate(-34, 34, self.progress)
            applyRotation()
          },
        },
      })
      // each card also drifts forward/back on its own axis
      cards.current.forEach((el, i) => {
        gsap.fromTo(
          el,
          { translateZ: i % 2 === 0 ? 40 : 130 },
          {
            translateZ: i % 2 === 0 ? 130 : 40,
            y: i % 2 === 0 ? 26 : -26,
            ease: 'none',
            scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom top', scrub: 1 },
          },
        )
      })
    }, stage)
    return () => ctx.revert()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const onPointerDown = (e) => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
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
    dragRot.current = clamp(dragRot.current + dx * 0.4)
    vel.current = dx * 0.4
    applyRotation()
  }

  const onPointerUp = () => {
    if (!down.current) return
    down.current = false
    setDragging(false)
    const obj = { v: dragRot.current }
    const target = clamp(dragRot.current + vel.current * 9)
    tween.current = gsap.to(obj, {
      v: target,
      duration: 0.7,
      ease: 'power3.out',
      onUpdate: () => {
        dragRot.current = obj.v
        applyRotation()
      },
    })
  }

  const go = () => (isAuthenticated ? navigate('/dashboard') : openLogin('signup'))

  return (
    <section className="relative overflow-hidden bg-ink py-24 text-white">
      <div className="grid-lines absolute inset-0 opacity-15" />
      <StarfieldBackground count={90} speed={0.7} className="opacity-45" />
      <div className="cdt-blob pointer-events-none absolute left-[-10%] top-1/3 h-96 w-96 rounded-full bg-violet-deep/20 blur-[130px]" />
      <div className="cdt-blob pointer-events-none absolute right-[-10%] top-1/4 h-96 w-96 rounded-full bg-cyan-snap/15 blur-[130px]" style={{ animationDelay: '-8s' }} />

      <div className="relative mx-auto grid max-w-7xl items-center gap-16 px-5 lg:grid-cols-2 lg:px-8">
        {/* copy */}
        <div data-enter>
          <span className="mb-5 inline-block rounded-bubble border border-neon/40 bg-neon/10 px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-neon">
            A journey in 3D
          </span>
          <h2 className="font-display text-balance text-4xl font-extrabold leading-[1.05] tracking-tight sm:text-5xl">
            Five milestones.
            <br />
            One <span className="text-gradient-snap">real internship.</span>
          </h2>
          <p className="mt-5 max-w-lg text-base leading-relaxed text-white/60">
            Scroll the stage — and drag it to spin the ring. Each milestone floats at its own depth, exactly like the
            journey: book your seat first, then profile, live workspace, assessment and interview.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            {MILESTONES.map((m) => (
              <span key={m.step} className="flex items-center gap-1.5 rounded-bubble border border-white/12 bg-white/5 px-3.5 py-1.5 text-xs font-semibold text-white/75">
                <span className="grid h-4 w-4 place-items-center rounded-full text-[9px] font-black text-ink" style={{ background: m.color }}>
                  {m.step[1]}
                </span>
                {m.title}
              </span>
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

        {/* 3D stage — draggable */}
        <div style={{ perspective: '1400px' }} className="relative h-[420px] select-none sm:h-[480px]" data-enter-scale>
          <div
            ref={stage}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerCancel={onPointerUp}
            onPointerLeave={onPointerUp}
            className={cn(
              'absolute inset-0 grid touch-pan-y place-items-center will-change-transform',
              dragging ? 'cursor-grabbing' : 'cursor-grab',
            )}
            style={{ transformStyle: 'preserve-3d' }}
            role="group"
            aria-label="Drag to spin the 3D journey milestones"
          >
            <div ref={ring} className="relative grid h-full w-full place-items-center" style={{ transformStyle: 'preserve-3d' }}>
              {MILESTONES.map((m, i) => {
                const Icon = m.icon
                const angle = (i / MILESTONES.length) * 360
                return (
                  <div
                    key={m.step}
                    className="absolute"
                    style={{
                      transformStyle: 'preserve-3d',
                      transform: `rotateY(${angle}deg) translateZ(200px)`,
                    }}
                  >
                    <div
                      ref={(el) => { cards.current[i] = el }}
                      className="w-[240px] rounded-2xl border border-white/12 bg-ink-soft/90 p-5 shadow-float backdrop-blur-md will-change-transform sm:w-[270px]"
                      style={{ transformStyle: 'preserve-3d' }}
                    >
                      <div className="flex items-center gap-3">
                        <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl" style={{ background: `${m.color}22`, color: m.color }}>
                          <Icon size={19} />
                        </span>
                        <div>
                          <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: m.color }}>
                            Milestone {m.step}
                          </p>
                          <p className="font-display text-base font-bold text-white">{m.title}</p>
                        </div>
                      </div>
                      <p className="mt-3 text-xs leading-relaxed text-white/50">{m.desc}</p>
                      <div className="mt-4 h-1 w-full overflow-hidden rounded-full bg-white/10">
                        <div className="h-full rounded-full" style={{ width: `${(i + 1) * 20}%`, background: m.color }} />
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* drag hint */}
            <span className="pointer-events-none absolute bottom-1 left-1/2 flex -translate-x-1/2 items-center gap-1.5 rounded-bubble border border-white/10 bg-white/5 px-3 py-1 text-[10px] font-semibold uppercase tracking-widest text-white/40 backdrop-blur-sm">
              <MoveHorizontal size={11} /> Drag to spin
            </span>
          </div>
        </div>
      </div>
    </section>
  )
}