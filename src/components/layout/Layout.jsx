import { useEffect, useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { Navbar } from './Navbar.jsx'
import { Footer } from './Footer.jsx'
import { Preloader } from './Preloader.jsx'
import { StickyCTA } from './StickyCTA.jsx'
import { GrainOverlay } from '../ui/GrainOverlay.jsx'

export function PublicLayout() {
  const { pathname } = useLocation()
  const [showPreloader, setShowPreloader] = useState(() => !sessionStorage.getItem('cdt:seen'))

  useEffect(() => {
    if (showPreloader) sessionStorage.setItem('cdt:seen', '1')
  }, [showPreloader])

  return (
    <div className="relative flex min-h-screen flex-col">
      {showPreloader && <Preloader onDone={() => setShowPreloader(false)} />}
      <Navbar />
      <div className="flex-1 pt-[72px] lg:pt-[92px]" key={pathname}>
        <Outlet />
      </div>
      <Footer />
      <StickyCTA />
      <GrainOverlay />
    </div>
  )
}