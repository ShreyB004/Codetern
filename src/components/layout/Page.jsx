import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

export function Page({ children, className = '' }) {
  const { pathname } = useLocation()

  useEffect(() => {
    window.scrollTo({ top: 0 })
  }, [pathname])

  return (
    <main className={`relative min-h-screen bg-paper text-ink dark:bg-ink dark:text-paper ${className}`}>
      <div key={pathname} className="page-enter">
        {children}
      </div>
    </main>
  )
}
