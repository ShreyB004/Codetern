import { PROGRAMMES, DURATIONS } from './programmes.js'

// ── Seat state builder: { [domainId]: { [dur]: { total, remaining } } }
export function buildSeatMap() {
  const map = {}
  PROGRAMMES.forEach((p) => {
    map[p.id] = {}
    p.durations.forEach((d) => {
      const total = [1, 2, 3, 6].includes(d) ? [45, 32, 24, 12][[1, 2, 3, 6].indexOf(d)] : 24
      const remaining = Math.max(1, Math.round(total * 0.62) + ((p.id.length + d) % 4))
      map[p.id][d] = { total, remaining }
    })
  })
  return map
}

// ── Media / asset manager initial state
export const DEFAULT_MEDIA = [
  {
    id: 'm1',
    name: 'hero-work.jpg',
    kind: 'image',
    slot: 'home-hero',
    width: 1600,
    height: 900,
    gradient: 'linear-gradient(135deg,#0b0e1a 0%,#11152a 55%,#22d3ee 160%)',
  },
  {
    id: 'm2',
    name: 'realwork-setup.svg',
    kind: 'svg',
    slot: 'home-realwork',
    width: 1440,
    height: 760,
    gradient: 'linear-gradient(135deg,#7c5cff 0%,#11152a 60%,#22d3ee 170%)',
  },
  {
    id: 'm3',
    name: 'cert-badge.svg',
    kind: 'svg',
    slot: 'cert-hero',
    width: 900,
    height: 500,
    gradient: 'linear-gradient(135deg,#b4ff39 0%,#11152a 65%)',
  },
]

// ── Seed candidate roster (admin table)
export function buildCandidateSeed() {
  return [
    {
      id: 'c1',
      name: 'Aarav Mehta',
      email: 'aarav.mehta@codetern.dev',
      domain: 'mern',
      domainTitle: 'Full-Stack Development',
      step: 5,
      quizScore: 87,
      quizPassed: true,
      interviewScore: 82,
      appliedAt: '2026-07-12',
      status: 'active',
      booking: { domain: 'mern', duration: 3, at: '2026-07-12' },
      cert: { id: 'CDT-2026-1343', at: '2026-08-01' },
    },
    {
      id: 'c2',
      name: 'Sana Iqbal',
      email: 'sana.iqbal@codetern.dev',
      domain: 'frontend',
      domainTitle: 'Front-End Development',
      step: 3,
      quizScore: 92,
      quizPassed: true,
      interviewScore: null,
      appliedAt: '2026-07-18',
      status: 'active',
    },
    {
      id: 'c3',
      name: 'Devansh Rao',
      email: 'devansh.rao@codetern.dev',
      domain: 'backend',
      domainTitle: 'Back-End Engineering',
      step: 4,
      quizScore: 78,
      quizPassed: true,
      interviewScore: 74,
      appliedAt: '2026-07-02',
      status: 'active',
    },
    {
      id: 'c4',
      name: 'Priya Nair',
      email: 'priya.nair@codetern.dev',
      domain: 'mobile',
      domainTitle: 'Mobile App Development',
      step: 2,
      quizScore: 64,
      quizPassed: false,
      interviewScore: null,
      appliedAt: '2026-07-25',
      status: 'retake',
    },
    {
      id: 'c5',
      name: 'Kabir Shah',
      email: 'kabir.shah@codetern.dev',
      domain: 'ai',
      domainTitle: 'AI & LLM Development',
      step: 5,
      quizScore: 95,
      quizPassed: true,
      interviewScore: 88,
      appliedAt: '2026-06-20',
      status: 'active',
    },
    {
      id: 'c6',
      name: 'Riya Kapoor',
      email: 'riya.kapoor@codetern.dev',
      domain: 'cyber',
      domainTitle: 'Cybersecurity',
      step: 1,
      quizScore: null,
      quizPassed: false,
      interviewScore: null,
      appliedAt: '2026-07-28',
      status: 'pending',
    },
  ]
}

// ── Consent + hints for generated certs
export const CERT_SAMPLE_ID = 'CDT-2026-1343'