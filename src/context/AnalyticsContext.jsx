import { useEffect, useRef } from 'react'
import { useLocation } from 'react-router-dom'
import { track, trackDb, flushPageTiming, startPageTiming } from '../lib/analytics.js'

const SCROLL_DEPTHS = [25, 50, 75, 95]

/**
 * Heads-up, dependency-free marketing analytics:
 *  - page enters + time-on-page per route (GA4 + Firebase RTDB)
 *  - scroll-depth milestones
 *  - first-visible view of every [data-track-section] block
 * Everything degrades to no-ops when Firebase env config is absent.
 */
export function AnalyticsProvider({ children }) {
  const { pathname } = useLocation()
  const firedSections = useRef(new Set())

  // route enters / exit timing
  useEffect(() => {
    trackDb('page_enter', { path: pathname })
    startPageTiming(pathname)
    return flushPageTiming
  }, [pathname])

  // scroll depth
  useEffect(() => {
    const fired = new Set()
    const onScroll = () => {
      const h = document.documentElement
      const depth = ((window.scrollY + window.innerHeight) / h.scrollHeight) * 100
      SCROLL_DEPTHS.forEach((d) => {
        if (depth >= d && !fired.has(d)) {
          fired.add(d)
          track('scroll_depth', { depth: d })
        }
      })
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // first-visible section views
  useEffect(() => {
    const sections = document.querySelectorAll('[data-track-section]')
    if (!sections.length) return
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (!e.isIntersecting) return
          const name = e.target.getAttribute('data-track-section')
          if (!name || firedSections.current.has(name)) return
          firedSections.current.add(name)
          track('section_view', { section: name })
        })
      },
      { threshold: 0.25 },
    )
    sections.forEach((s) => io.observe(s))
    return () => io.disconnect()
  }, [pathname])

  // leave / unload → finalize the open page timer
  useEffect(() => {
    const flush = () => flushPageTiming()
    const onVis = () => {
      if (document.visibilityState === 'hidden') flush()
    }
    window.addEventListener('visibilitychange', onVis)
    window.addEventListener('pagehide', flush)
    return () => {
      window.removeEventListener('visibilitychange', onVis)
      window.removeEventListener('pagehide', flush)
    }
  }, [])

  return children
}