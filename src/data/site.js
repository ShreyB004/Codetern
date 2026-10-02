// Admin-editable site copy (RTDB siteContent/<section> overrides these).
export const SITE_DEFAULTS = {
  home: {
    badge: 'No weather apps · No todo lists',
    titleA: 'Stop practising.',
    titleB: 'Start shipping.',
    subtitle:
      'Codetern is a weekend engineering school. You reconstruct real systems from scratch, defend your choices in code review, and release alongside a team — the same cycle junior developers live through at work.',
    applyNote: 'Short form → Google Form → mentor approval → your LMS unlocks',
    showStats: true,
    showLoop: true,
    showWeek: true,
    showCourses: true,
    showCta: true,
    coursesTitle: 'Where will you dig in first?',
    coursesSub: 'Four tracks · one standard: done means deployed',
    featured: [
      { id: 'ai-llms', blurb: 'RAG, a micro-LLM, agents with tools.' },
      { id: 'web-dev', blurb: 'Interfaces with motion + a published extension.' },
      { id: 'databases', blurb: 'Model it, index it, then build the engine.' },
      { id: 'api-arch', blurb: 'Design, secure and ship a real API.' },
    ],
  },
  courses: {
    badge: '4 courses · no toy projects',
    title: 'Four deep ends. Pick one and jump in.',
    sub: 'Each track runs 5–6 weeks and ends with something live. Mentors review the code; a pod of peers reviews how you work.',
  },
  pricing: {
    badge: 'One payment · no subscription',
    title: 'Choose Pricing Plan',
    sub: 'One payment, no subscription. Starter keeps you moving with daily mentor messages; Builder and Pro add live weekend rooms, line-by-line reviews and a team pod.',
    foot: '7-day refund · join form first, Google Form second, admin approves.',
  },
  about: {
    badge: 'We hate tutorial hell',
    title: 'Classroom code gets you views. Production code gets you hired.',
    story:
      'Most courses stop at weather apps and todo lists. Codetern starts where they stop: rebuild a micro-LLM, design APIs that survive load, craft interfaces with motion, build your own database — all reviewed on GitHub and deployed live.\n\nThen you do it again inside a team simulation with sprints, standups and code owners. That second pass is the point: anyone can follow a tutorial alone; professionals ship together.',
  },
}

export function mergeSite(section, doc) {
  return { ...SITE_DEFAULTS[section], ...(doc || {}) }
}

export const PALETTES = {
  volt: { label: 'Volt (default)', neon: '#b4ff39', cyan: '#22d3ee', violet: '#7c5cff', mint: '#38ffb0' },
  lagoon: { label: 'Lagoon', neon: '#5eead4', cyan: '#38bdf8', violet: '#818cf8', mint: '#6ee7b7' },
  ember: { label: 'Ember', neon: '#fbbf24', cyan: '#fb7185', violet: '#c084fc', mint: '#4ade80' },
  mono: { label: 'Mono ink', neon: '#e7e5e4', cyan: '#a8a29e', violet: '#78716c', mint: '#d6d3d1' },
}

SITE_DEFAULTS.theme = { preset: 'volt', neon: '', cyan: '', violet: '', mint: '' }
SITE_DEFAULTS.motion = { intensity: 'full', floats: true }
SITE_DEFAULTS.quote = { text: 'I stopped watching tutorials the week I joined. Now I argue about cache invalidation in PR reviews — and win sometimes.', author: 'Builder · AI & LLMs track' }
SITE_DEFAULTS.week = {
  rows: [
    { d: 'Sat–Sun', t: 'Live build rooms on Meet', s: 'Code alongside mentors, ask anything' },
    { d: 'Weekdays', t: 'Async reviews + messages', s: 'PR feedback lands within 24 hours' },
    { d: 'Friday', t: 'Demo + ship it', s: 'Show the pod what you deployed' },
  ],
}
SITE_DEFAULTS.stats = {
  items: [
    ['4', 'focused courses'],
    ['24h', 'review turnaround'],
    ['5', 'shipped builds per course'],
    ['4–5', 'students per team pod'],
  ],
}
SITE_DEFAULTS.cta = {
  title: 'Bring two weekends. Leave with a deployed system.',
  sub: 'Applications take minutes and are reviewed by a human — usually within a day.',
}
SITE_DEFAULTS.faqs = {
  items: [
    { q: 'Is this an internship?', a: 'No — Codetern sells courses. You learn production code, ship builds, pass PR reviews and show verifiable work.' },
    { q: 'Do I build toy projects?', a: 'Never. Micro-LLM, custom database, production API, published extension — then repeat inside a team simulation.' },
    { q: 'How do PR reviews work?', a: 'Push to GitHub, request review. Mentors comment inline within 24h (4h on Pro 1:1). You iterate until shippable.' },
    { q: 'How does joining work?', a: 'Fill the Join form (2 min) → finish the Google Form → admin approves → sign in and your LMS unlocks.' },
  ],
}
SITE_DEFAULTS.footer = { tagline: 'Production-code courses with real stakes. Rebuild systems from scratch, pass GitHub PR reviews and ship live — no todo lists, no attendance certificates.' }
SITE_DEFAULTS.fees = {
  note: '3 monthly installments. LMS access pauses while any installment is pending and admin confirms.',
  installments: [
    { label: 'Installment 1 · admission', amount: '₹999', note: 'Due at approval' },
    { label: 'Installment 2 · mid-course', amount: '₹1000', note: 'Due week 4' },
    { label: 'Installment 3 · pre-certification', amount: '₹1000', note: 'Due before certificate' },
  ],
}
SITE_DEFAULTS.templates = {
  items: [
    { title: 'Fee reminder', body: 'Hi {name}, installment {amount} ({label}) is still pending. Please clear it to keep your LMS access active.' },
    { title: 'Meet link', body: 'Hi {name}, joining in 10 minutes — here’s the room: {link}. See you inside.' },
    { title: 'PR nudge', body: 'Hi {name}, your last submission is waiting on my review notes — check the PR queue and push the fixes.' },
  ],
}
