import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { Analytics } from '@vercel/analytics/react'
import App from './App.jsx'
import { Providers } from './context/Providers.jsx'
import { load } from './lib/store.js'
import { initSiteTheme } from './lib/siteTheme.js'
import './index.css'

// Admin-chosen palette + motion, before first paint (cached, then live).
try {
  initSiteTheme()
} catch { /* theme is best-effort */ }

// Scroll-jank guard: pause heavy background animations while scrolling,
// resume ~150ms after the user stops. Passive + rAF-throttled.
;(() => {
  try {
    let t = null
    let ticking = false
    const onScroll = () => {
      if (ticking) return
      ticking = true
      requestAnimationFrame(() => {
        document.documentElement.dataset.scrolling = '1'
        clearTimeout(t)
        t = setTimeout(() => {
          document.documentElement.dataset.scrolling = '0'
        }, 160)
        ticking = false
      })
    }
    window.addEventListener('scroll', onScroll, { passive: true })
  } catch { /* noop */ }
})()

// Apply theme before first paint to avoid a light-mode flash for dark users.
;(() => {
  try {
    const stored = load('theme:v1', null)
    const dark = stored ? stored === 'dark' : window.matchMedia('(prefers-color-scheme: dark)').matches
    document.documentElement.classList.toggle('dark', dark)
  } catch {
    /* noop */
  }
})()

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <Providers>
        <App />
      </Providers>
      <Analytics />
    </BrowserRouter>
  </React.StrictMode>,
)