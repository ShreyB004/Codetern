/* SSR smoke test (no browser, no network):
   - App-level routes that render without lazy suspension (/, guards, 404
     is covered separately) render through <App />.
   - Lazy public pages are loaded explicitly and rendered directly inside
     router + providers.
   - Failing case = throw during render OR missing copy markers. */
import { createServer } from 'vite'
import { renderToStaticMarkup } from 'react-dom/server'
import React from 'react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'

const server = await createServer({ server: { middlewareMode: true }, appType: 'custom' })
const { default: App } = await server.ssrLoadModule('/src/App.jsx')
const { Providers } = await server.ssrLoadModule('/src/context/Providers.jsx')

function storage(entries = {}) {
  const map = new Map(Object.entries(entries))
  return {
    getItem: (k) => (map.has(k) ? map.get(k) : null),
    setItem: (k, v) => map.set(k, String(v)),
    removeItem: (k) => map.delete(k),
  }
}

globalThis.window = {
  matchMedia: () => ({ matches: false, addEventListener: () => {}, removeEventListener: () => {} }),
  addEventListener: () => {},
  removeEventListener: () => {},
  scrollTo: () => {},
  location: { origin: 'http://localhost', pathname: '/' },
}
globalThis.sessionStorage = storage({ 'cdt:seen': '1' })
globalThis.localStorage = storage({})

const shell = (route, children) =>
  renderToStaticMarkup(
    React.createElement(MemoryRouter, { initialEntries: [route] }, React.createElement(Providers, null, children)),
  )

const checks = [
  // through the real <App /> (guards + home render before any suspension)
  ['app:/', () => shell('/', React.createElement(App)), ['stop practising', 'start shipping']],
  ['app:/dashboard', () => shell('/dashboard', React.createElement(App)), ['checking your login']],
  ['app:/admin', () => shell('/admin', React.createElement(App)), ['checking admin access']],
  // lazy pages rendered directly (markers in CMS-default copy)
  ['page:/courses', async () => shell('/courses', React.createElement(await page('/src/pages/CoursesPage.jsx'))), ['four deep ends', 'ai &amp; llms']],
  ['page:/pricing', async () => shell('/pricing', React.createElement(await page('/src/pages/PricingPage.jsx'))), ['choose pricing plan']],
  ['page:/about', async () => shell('/about', React.createElement(await page('/src/pages/AboutPage.jsx'))), ['classroom code gets you views']],
  ['page:/contact', async () => shell('/contact', React.createElement(await page('/src/pages/ContactPage.jsx'))), ['talk to a mentor']],
  ['page:/login', async () => shell('/login', React.createElement(await page('/src/pages/LoginPage.jsx'))), ['sign in to codetern']],
  ['page:/join', async () => shell('/join', React.createElement(await page('/src/pages/JoinPage.jsx'))), ['join codetern in 2 steps']],
  ['page:/privacy', async () => shell('/privacy', React.createElement(await page('/src/pages/PrivacyPage.jsx'))), ['privacy policy']],
  ['page:/terms', async () => shell('/terms', React.createElement(await page('/src/pages/TermsPage.jsx'))), ['terms of service']],
  ['page:404', async () => shell('/no-such-page-xyz', React.createElement(await page('/src/pages/NotFound.jsx'))), ['doesn\u2019t exist']],
]

async function page(path) {
  const mod = await server.ssrLoadModule(path)
  return mod.default
}

let failed = 0
let passed = 0
for (const [name, render, markers] of checks) {
  try {
    const html = await render()
    const missing = markers.filter((m) => !html.toLowerCase().includes(m.toLowerCase()))
    if (missing.length) throw new Error(`missing markers: ${missing.join(' | ')}`)
    passed++
    console.log(`PASS ${name}  (${html.length} chars)`)
  } catch (err) {
    failed++
    console.error(`FAIL ${name}  → ${err.message.split('\n')[0]}`)
  }
}

await server.close()
console.log(`\n${passed} passed, ${failed} failed`)
process.exit(failed ? 1 : 0)
