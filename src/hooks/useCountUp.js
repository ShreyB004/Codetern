import { useEffect, useRef, useState } from 'react'
import { gsap } from '../lib/gsap.js'

/**
 * Animated count-up that triggers when the element scrolls into view.
 * Returns a ref to attach to the target element and the current value.
 */
export function useCountUp(target, { duration = 1.6, triggerOnView = true } = {}) {
  const ref = useRef(null)
  const [value, setValue] = useState(0)
  const started = useRef(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const run = () => {
      if (started.current) return
      started.current = true
      const obj = { v: 0 }
      gsap.to(obj, {
        v: target,
        duration,
        ease: 'expo.out',
        onUpdate: () => setValue(Math.round(obj.v)),
      })
    }

    if (!triggerOnView) {
      run()
      return
    }

    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) run()
        })
      },
      { threshold: 0.4 },
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [target, duration, triggerOnView])

  return { ref, value }
}

/**
 * Generic ticking numeric display for live counters (no viewport gating).
 */
export function useLiveNumber(target, { duration = 1.2 } = {}) {
  const [value, setValue] = useState(target)
  useEffect(() => {
    const obj = { v: value }
    gsap.to(obj, { v: target, duration, ease: 'power2.out', onUpdate: () => setValue(Math.round(obj.v)) })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [target])
  return value
}