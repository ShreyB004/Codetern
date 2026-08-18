import { useEffect, useRef } from 'react'
import { mountReveals } from '../lib/gsap.js'

/**
 * Scroll-reveal helper. Attach `data-reveal` to children of the container.
 */
export function useRevealScope() {
  const ref = useRef(null)

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      ref.current?.querySelectorAll('[data-reveal]').forEach((el) => el.classList.add('is-visible'))
      return
    }
    const cleanup = mountReveals(ref.current)
    return cleanup
  }, [])

  return ref
}