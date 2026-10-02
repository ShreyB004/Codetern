import { PALETTES } from '../data/site.js'
import { subscribeDoc } from './rtdb.js'

// Applies admin-chosen palette + motion intensity as CSS overrides.
// Cached in localStorage for instant first paint, then live-synced.
const VARS = { neon: '--color-neon', cyan: '--color-cyan-snap', violet: '--color-violet-deep', mint: '--color-mint' }

function applyTheme(doc) {
  const root = document.documentElement
  const preset = PALETTES[doc?.preset] || PALETTES.volt
  Object.entries(VARS).forEach(([key, cssVar]) => {
    const custom = (doc?.[key] || '').trim()
    root.style.setProperty(cssVar, custom || preset[key])
  })
}

function applyMotion(doc) {
  const root = document.documentElement
  root.dataset.anim = doc?.intensity || 'full'
  root.dataset.floats = doc?.floats === false ? 'off' : 'on'
}

function cached(key, fallback) {
  try {
    const raw = localStorage.getItem(key)
    if (raw) return JSON.parse(raw)
  } catch { /* noop */ }
  return fallback
}

export function initSiteTheme() {
  applyTheme(cached('cdt:theme', null))
  applyMotion(cached('cdt:motion', null))
  const save = (k, v) => {
    try { localStorage.setItem(k, JSON.stringify(v)) } catch { /* noop */ }
  }
  subscribeDoc('siteContent/theme', (doc) => {
    if (!doc) return
    save('cdt:theme', doc)
    applyTheme(doc)
  })
  subscribeDoc('siteContent/motion', (doc) => {
    if (!doc) return
    save('cdt:motion', doc)
    applyMotion(doc)
  })
}
