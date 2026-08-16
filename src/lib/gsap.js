import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

// Shared easing / durations used across the design system.
export const EASE = gsap.parseEase('expo.out')

gsap.defaults({ ease: 'expo.out', overwrite: 'auto' })

export { gsap, ScrollTrigger }

// Register all reveal elements for a scope.
export function mountReveals(scope) {
  const targets = scope?.querySelectorAll ? Array.from(scope.querySelectorAll('[data-reveal]')) : []
  if (!targets.length) return () => {}

  // Hide initially so the scroll reveal is visible in both themes.
  gsap.set(targets, { opacity: 0, y: 26 })

  const st = targets.map((el, i) =>
    ScrollTrigger.create({
      trigger: el,
      start: 'top 78%',
      once: true,
      onEnter: () => {
        gsap.to(el, {
          opacity: 1,
          y: 0,
          duration: 0.7,
          delay: Math.min(i % 4, 3) * 0.06,
          ease: 'power3.out',
        })
      },
    }),
  )
  return () => st.forEach((t) => t.kill())
}

// Animate a container in (enter timeline) — used for page transitions & modals.
export function enterTl(root) {
  const q = (s) => Array.from(root.querySelectorAll(s))
  const tl = gsap.timeline({ defaults: { ease: EASE } })
  const enters = q('[data-enter]')
  const scales = q('[data-enter-scale]')
  if (enters.length) tl.fromTo(enters, { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 0.6, stagger: 0.07 }, 0)
  if (scales.length) tl.fromTo(scales, { opacity: 0, scale: 0.96 }, { opacity: 1, scale: 1, duration: 0.7 }, 0)
  return tl
}

export function fadeIn(root) {
  return gsap.fromTo(root, { opacity: 0 }, { opacity: 1, duration: 0.4, ease: 'power1.out' })
}