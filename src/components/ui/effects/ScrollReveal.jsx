import { useLayoutEffect, useRef } from 'react'
import { gsap } from '../../../lib/gsap.js'
import { cn } from '../../../lib/utils.js'
import './ScrollReveal.css'

/**
 * ScrollReveal — masked, word-by-word scroll reveal (editorial studio pattern).
 * Every word rises out of an overflow mask with a calm stagger as the text
 * enters the viewport (yPercent 115 → 0, power3.out, ~0.05s stagger, once).
 *
 * Children must be plain text (or a single text-bearing element).
 * `colors`: pass 'transparent' to keep a word in the inherited text color.
 * `stagger`: optional explicit stagger (defaults to a subtle auto value).
 *
 * Heaviness: driven by IntersectionObserver instead of ScrollTrigger so the
 * reveal always fires even for elements already in view when a route mounts
 * (ScrollTrigger start/postions can miss on client-side navigation), plus a
 * short fallback timeout so the masked text can never stay hidden or
 * overlapped by its own translated pre-state.
 *
 * Accessibility: the container carries the full text as an aria-label while
 * split words are aria-hidden; prefers-reduced-motion users get static text.
 */
export function ScrollReveal({ children, as = 'h2', className, colors = ['transparent'], stagger }) {
  const containerRef = useRef(null)
  const Tag = as

  useLayoutEffect(() => {
    const el = containerRef.current
    if (!el) return undefined
    const words = Array.from(el.querySelectorAll('.sr-word'))
    if (!words.length) return undefined

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      gsap.set(words, { yPercent: 0 })
      return undefined
    }

    let started = false
    const start = () => {
      if (started) return
      started = true
      gsap.to(words, {
        yPercent: 0,
        stagger: stagger ?? Math.min(0.05, 0.55 / words.length),
        duration: 0.8,
        ease: 'power3.out',
        clearProps: 'transform',
      })
    }

    // Baseline state — words sit just below the mask, hidden until revealed.
    gsap.set(words, { yPercent: 115 })

    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) start()
      },
      { threshold: 0.15, rootMargin: '0px 0px -12% 0px' },
    )
    io.observe(el)

    // Safety net: if anything went wrong (observer unsupported, weird layout),
    // never leave the heading clipped — reveal it after a short grace period.
    const fallback = window.setTimeout(start, 2500)

    return () => {
      io.disconnect()
      window.clearTimeout(fallback)
    }
  }, [stagger])

  const splitWords = (text) =>
    String(text)
      .split(' ')
      .filter(Boolean)
      .map((word, i) => (
        <span key={`${word}-${i}`} className="sr-mask" aria-hidden="true">
          <span
            className="sr-word"
            style={{ color: colors[i % colors.length] === 'transparent' ? 'inherit' : colors[i % colors.length] }}
          >
            {word}
          </span>
          {'\u00A0'}
        </span>
      ))

  const text = typeof children === 'string' ? children : children?.props?.children

  return (
    <Tag ref={containerRef} aria-label={String(text)} className={cn('scroll-reveal', className)}>
      {splitWords(text)}
    </Tag>
  )
}