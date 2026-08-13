import { useEffect, useRef } from 'react'
import { useLocation } from 'react-router-dom'
import { enterTl } from '../../lib/gsap.js'

/**
 * Page transition wrapper — runs a GSAP enter timeline on mount,
 * and scrolls to top on route change (without layout shift).
 */
export function Page({ children, className = '' }) {
  const root = useRef(null)
  const { pathname } = useLocation()

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' })
    const tl = enterTl(root.current)
    return () => tl.kill()
  }, [pathname])

  return (
    <main ref={root} className={`relative min-h-screen bg-paper dark:bg-ink dark:text-paper ${className}`}>
      {children}
    </main>
  )
}