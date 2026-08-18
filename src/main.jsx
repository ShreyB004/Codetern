import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { Analytics } from '@vercel/analytics/react'
import App from './App.jsx'
import { Providers } from './context/Providers.jsx'
import { load } from './lib/store.js'
import './index.css'

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