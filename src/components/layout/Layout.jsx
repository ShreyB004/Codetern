import { Outlet, useLocation } from 'react-router-dom'
import { Navbar } from './Navbar.jsx'
import { Footer } from './Footer.jsx'
import { StickyCTA } from './StickyCTA.jsx'

export function PublicLayout() {
  const { pathname } = useLocation()
  const bare = pathname.startsWith('/dashboard') || pathname.startsWith('/learn') || pathname.startsWith('/admin') || pathname.startsWith('/reviews')

  return (
    <div className="relative flex min-h-screen flex-col">
      <Navbar />
      <div className="flex-1 pt-[72px] lg:pt-[92px]" key={pathname}>
        <Outlet />
      </div>
      {!bare && <Footer />}
      {!bare && <StickyCTA />}
    </div>
  )
}
