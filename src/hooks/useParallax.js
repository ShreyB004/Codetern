import { useEffect, useRef } from 'react'
import { gsap, ScrollTrigger } from '../lib/gsap.js'

/**
 * Parallax: the element translates at `speed` (0.05–0.4) relative to scroll.
 * speed positive = moves slower than scroll (background feel).
 */
export function useParallax(speed = 0.12) {
  const ref = useRef(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const st = ScrollTrigger.create({
      trigger: el,
      start: 'top bottom',
      end: 'bottom top',
      scrub: true,
      onUpdate: (self) => {
        gsap.set(el, { y: self.progress * speed * 1000 * -1 })
      },
    })

    return () => st.kill()
  }, [speed])

  return ref
}

/**
 * Idle floating physics for decorative cards — layered bob + gentle rotation.
 */
export function useFloat({ amplitude = 10, duration = 3.2, delay = 0 } = {}) {
  const ref = useRef(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const tl = gsap.timeline({ repeat: -1, yoyo: true, delay })
    tl.to(el, { y: amplitude, duration: duration * 0.6, ease: 'sine.inOut' })
      .to(el, { rotation: 1.6, duration: duration * 0.4, ease: 'sine.inOut' }, 0)
      .to(el, { rotation: -1.6, duration: duration * 0.4, ease: 'sine.inOut' }, '<')

    return () => tl.kill()
  }, [amplitude, duration, delay])

  return ref
}