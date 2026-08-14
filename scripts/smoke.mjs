/* SSR smoke test: renders public, authenticated-student, and authenticated-admin routes. */
import { createServer } from 'vite'
import { renderToStaticMarkup } from 'react-dom/server'
import React from 'react'
import { MemoryRouter } from 'react-router-dom'

const server = await createServer({ server: { middlewareMode: true }, appType: 'custom' })
const { default: App } = await server.ssrLoadModule('/src/App.jsx')
const { Providers } = await server.ssrLoadModule('/src/context/Providers.jsx')

function storage(entries = {}) {
  const map = new Map(Object.entries(entries))
  return { getItem: (k) => (map.has(k) ? map.get(k) : null), setItem: (k, v) => map.set(k, String(v)) }
}

globalThis.window = {
  matchMedia: () => ({ matches: true }),
  addEventListener: () => {},
  removeEventListener: () => {},
}
window.scrollTo = () => {}
window.document = { documentElement: { addEventListener: () => {}, removeEventListener: () => {} } }

const baseCandidate = (id, name, extra = {}) => ({
  id,
  name,
  email: `${id}@codetern.dev`,
  domain: 'mern',
  domainTitle: 'Full-Stack Development',
  step: 1,
  quizScore: null,
  quizPassed: false,
  interviewScore: null,
  appliedAt: '2026-01-01',
  status: 'pending',
  profile: null,
  quiz: null,
  interview: null,
  booking: null,
  cert: null,
  workspace: null,
  ...extra,
})

const scenarios = [
  {
    name: 'public',
    storage: {},
    routes: [
      ['/', ['real work done', 'Codetern', 'Seat countdown']],
      ['/about', ['About Codetern', 'mentor network']],
      ['/domains', ['Fourteen ways', 'Career tracks']],
      ['/portfolio', ['Live project gallery', 'actually shipped']],
      ['/certification', ['Employer verification', 'unique ID']],
      ['/pricing', ['One flat batch price', 'Pick a domain', 'Book this batch', 'launch marker']],
      ['/contact', ['Talk to a', 'mentor']],
    ],
  },
  {
    name: 'student',
    storage: {
      'codetern:current:v2': JSON.stringify('u-smoke'),
      'codetern:users:v2': JSON.stringify([{ id: 'u-smoke', name: 'Smoke Tester', email: 'u-smoke@codetern.dev', password: 'x', role: 'student', createdAt: '2026-01-01' }]),
      'codetern:candidates:v2': JSON.stringify([baseCandidate('u-smoke', 'Smoke Tester')]),
    },
    routes: [['/dashboard', ['Welcome back', 'Book your seat', 'Choose your track domain']]],
  },
  {
    name: 'student-advanced',
    storage: {
      'codetern:current:v2': JSON.stringify('u-adv'),
      'codetern:users:v2': JSON.stringify([{ id: 'u-adv', name: 'Advanced Tester', email: 'u-adv@codetern.dev', password: 'x', role: 'student', createdAt: '2026-01-01' }]),
      'codetern:candidates:v2': JSON.stringify([
        baseCandidate('u-adv', 'Advanced Tester', {
          step: 5,
          quizScore: 87,
          quizPassed: true,
          interviewScore: 84,
          status: 'active',
          profile: { name: 'Advanced Tester', email: 'u-adv@codetern.dev', domain: 'mern', resumeName: 'r.pdf' },
          quiz: { bank: 'mern', score: 87, passed: true },
          interview: { score: 84, done: true },
          booking: { domain: 'mern', duration: 3 },
          cert: { id: 'CDT-2026-9999', at: '2026-07-01' },
        }),
      ]),
    },
    routes: [
      ['/dashboard', ['Welcome back', 'Certificate issued', 'Letter of Recommendation']],
      ['/certification', ['Employer verification', 'Not sure what to enter']],
    ],
  },
  {
    name: 'admin',
    storage: { 'codetern:current:v2': JSON.stringify('admin-1') },
    routes: [['/admin', ['Admin suite', 'Candidate Roster', 'Seat Controller']]],
  },
]

let failed = 0
let passed = 0
for (const scenario of scenarios) {
  globalThis.sessionStorage = storage({ 'cdt:seen': '1' })
  globalThis.localStorage = storage(scenario.storage)
  for (const [route, markers] of scenario.routes) {
    try {
      const html = renderToStaticMarkup(
        React.createElement(MemoryRouter, { initialEntries: [route] }, React.createElement(Providers, null, React.createElement(App))),
      )
      const missing = markers.filter((m) => !html.toLowerCase().includes(m.toLowerCase()))
      if (missing.length) throw new Error(`missing markers: ${missing.join(' | ')}`)
      passed++
      console.log(`PASS [${scenario.name}] ${route}  (${html.length} chars)`)
    } catch (err) {
      failed++
      console.error(`FAIL [${scenario.name}] ${route}  → ${err.message}`)
    }
  }
}

await server.close()
console.log(`\n${passed} passed, ${failed} failed`)
process.exit(failed ? 1 : 0)