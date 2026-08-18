import { analyticsPromise, db } from './firebase.js'
import { getDatabase, ref, push } from 'firebase/database'
import { logEvent } from 'firebase/analytics'

// Registration funnel: every "Register" CTA funnels here. Swap in a different
// form (Tally/Google Forms/Typeform) via VITE_REGISTRATION_URL.
export const REGISTRATION_URL =
  (import.meta.env.VITE_REGISTRATION_URL || '').trim() || 'https://forms.gle/QGGDFFewL4rfHZuT9'

// ── attribution ──────────────────────────────────────────────────────────
const SOCIAL = ['instagram.com', 'linkedin.com', 'youtube.com', 'facebook.com', 'twitter.com', 'x.com', 'whatsapp.com', 't.me', 'wa.me']
const SEARCH = ['google', 'bing', 'yahoo', 'duckduckgo', 'brave']

export function trafficSource() {
  let via = 'direct'
  let domain = null
  try {
    const { hostname } = new URL(document.referrer)
    domain = hostname.replace(/^www\./, '')
    if (SEARCH.some((s) => hostname.includes(s))) via = 'search'
    else if (SOCIAL.some((s) => hostname.includes(s))) via = 'social'
    else via = 'referral'
  } catch {
    /* no referrer */
  }

  const p = new URLSearchParams(window.location.search)
  return {
    via,
    referrer: domain || null,
    source: p.get('utm_source') || (via === 'direct' ? null : domain || via),
    medium: p.get('utm_medium') || (via === 'direct' ? null : via),
    campaign: p.get('utm_campaign') || null,
  }
}

// ── audience / device ────────────────────────────────────────────────────
export function deviceInfo() {
  const ua = navigator.userAgent
  const coarse = window.matchMedia('(pointer: coarse)').matches
  const device = /iPad|Tablet/.test(ua) || (coarse && /Macintosh/.test(ua)) ? 'tablet' : coarse ? 'mobile' : 'desktop'
  const os = /Windows/.test(ua) ? 'Windows' : /Android/.test(ua) ? 'Android' : /iPhone|iPad/.test(ua) ? 'iOS' : /Macintosh/.test(ua) ? 'macOS' : /Linux/.test(ua) ? 'Linux' : 'Other'
  const browser = /Edg\//.test(ua) ? 'Edge' : /Chrome\//.test(ua) ? 'Chrome' : /Firefox\//.test(ua) ? 'Firefox' : /Safari/.test(ua) ? 'Safari' : 'Other'
  return {
    device,
    os,
    browser,
    screen: `${window.screen.width}x${window.screen.height}`,
    viewport: `${window.innerWidth}x${window.innerHeight}`,
  }
}

// ── session identity (stable across soft reloads) ───────────────────────
export function sessionId() {
  try {
    let id = sessionStorage.getItem('cdt:sid')
    if (!id) {
      id = (crypto.randomUUID?.() || `${Date.now()}-${Math.random().toString(36).slice(2)}`)
      sessionStorage.setItem('cdt:sid', id)
    }
    return id
  } catch {
    return 'anon'
  }
}

// ── GA4 + realtime sinks (both silent no-ops when Firebase is absent) ────
function gaSink() {
  return analyticsPromise.then((a) => a)
}

export async function trackGa(name, params = {}) {
  const a = await gaSink()
  if (!a) return
  try {
    logEvent(a, name, params)
  } catch {
    /* noop */
  }
}

export async function trackDb(name, params = {}) {
  if (!db) return
  try {
    const events = ref(getDatabase(), `events/${sessionId()}`)
    push(events, {
      name,
      ts: Date.now(),
      page: window.location.pathname,
      ...trafficSource(),
      ...deviceInfo(),
      ...params,
    })
  } catch {
    /* noop */
  }
}

export function track(name, params = {}) {
  trackGa(name, params)
  trackDb(name, params)
}

// ── registration CTA — the one conversion this site feeds ───────────────
export function openRegistration(placement) {
  track('register_click', { placement })
  if (typeof window !== 'undefined') {
    window.open(REGISTRATION_URL, '_blank', 'noopener,noreferrer')
  }
}

// ── visit timing (browser-tab accurate, cross-checked with GA sessions) ──
const PAGE_START = { path: null, at: 0 }

export function startPageTiming(path) {
  PAGE_START.path = path
  PAGE_START.at = Date.now()
}

export function flushPageTiming() {
  const { path, at } = PAGE_START
  if (!path) return
  const sec = Math.round((Date.now() - at) / 1000)
  if (sec >= 3) track('time_on_page', { page: path, duration_sec: sec })
  PAGE_START.path = null
}