import { useEffect, useRef, useState } from 'react'
import { gsap } from '../../lib/gsap.js'

/**
 * Elegant intro preloader shown once on first visit.
 */
export function Preloader({ onDone }) {
  const [gone, setGone] = useState(false)
  const root = useRef(null)

  useEffect(() => {
    const tl = gsap.timeline({ onComplete: () => setGone(true) })
    tl.fromTo('.cdt-prel-logo', { scale: 0.6, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.6 })
      .fromTo('.cdt-prel-bar', { scaleX: 0 }, { scaleX: 1, duration: 0.9, ease: 'expo.out' }, 0.2)
      .to('.cdt-prel-inner', { yPercent: -100, duration: 0.6, ease: 'expo.inOut' }, '+=0.25')
      .set(root.current, { display: 'none' })
    return () => tl.kill()
  }, [])

  useEffect(() => {
    if (gone) onDone?.()
  }, [gone, onDone])

  return (
    <div ref={root} className="fixed inset-0 z-[200] flex items-center justify-center overflow-hidden bg-ink">
      <div className="cdt-prel-inner flex flex-col items-center">
        <p className="cdt-prel-logo font-display text-4xl font-bold tracking-tight text-white">
          Code<span className="text-cyan-snap">tern</span>
        </p>
        <div className="cdt-prel-bar mt-6 h-1 w-44 origin-left overflow-hidden rounded-full bg-white/10">
          <div className="h-full w-full origin-left scale-x-0 rounded-full bg-gradient-to-r from-cyan-snap to-neon" />
        </div>
        <p className="mt-4 text-xs font-medium uppercase tracking-[0.3em] text-white/40">Internship simulator</p>
      </div>
    </div>
  )
}