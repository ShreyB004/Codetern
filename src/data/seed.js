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
// Journey order 2026: 1 book → 2 profile → 3 workspace → 4 assessment → 5 interview
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
      booking: { domain: 'mern', duration: 3, at: '2026-07-12', payment: { method: 'upi', amount: 2430, txId: 'TXN81042551', at: '2026-07-12T09:00:00.000Z' } },
      cert: { id: 'CDT-2026-1343', at: '2026-08-01' },
      lor: { id: 'LOR-2026-4821', at: '2026-08-02', status: 'issued' },
      interview: { score: 82, done: true },
      history: [
        { domain: 'web', domainTitle: 'Foundational Web Development', duration: 2, cert: { id: 'CDT-2026-0902', at: '2026-04-10' }, lor: { id: 'LOR-2026-1104', at: '2026-04-11' }, completedAt: '2026-04-11T10:00:00.000Z' },
      ],
      referralCode: 'AARAV-7K2M',
      wallet: { balance: 100, transactions: [
        { id: 't-c1-1', amount: 50, reason: 'Referral reward — Sana Iqbal booked a seat', at: '2026-07-18T10:00:00.000Z' },
        { id: 't-c1-2', amount: 50, reason: 'Referral reward — Kabir Shah booked a seat', at: '2026-06-20T10:00:00.000Z' },
      ] },
    },
    {
      id: 'c2',
      name: 'Sana Iqbal',
      email: 'sana.iqbal@codetern.dev',
      domain: 'frontend',
      domainTitle: 'Front-End Development',
      step: 4,
      quizScore: 92,
      quizPassed: true,
      interviewScore: null,
      appliedAt: '2026-07-18',
      status: 'active',
      booking: { domain: 'frontend', duration: 2, at: '2026-07-18' },
      profile: { name: 'Sana Iqbal', email: 'sana.iqbal@codetern.dev', linkedin: 'linkedin.com/in/sana-iqbal', bio: 'Frontend enthusiast building design systems.', domain: 'frontend' },
      referralCode: 'SANA-3XPQ',
      referredBy: 'c1',
      wallet: { balance: 0, transactions: [] },
    },
    {
      id: 'c3',
      name: 'Devansh Rao',
      email: 'devansh.rao@codetern.dev',
      domain: 'backend',
      domainTitle: 'Back-End Engineering',
      step: 5,
      quizScore: 78,
      quizPassed: true,
      interviewScore: 74,
      appliedAt: '2026-07-02',
      status: 'active',
      booking: { domain: 'backend', duration: 3, at: '2026-07-02', payment: { method: 'card', amount: 2430, txId: 'TXN77291833', at: '2026-07-02T11:00:00.000Z' } },
      profile: { name: 'Devansh Rao', email: 'devansh.rao@codetern.dev', linkedin: 'linkedin.com/in/devansh-rao', bio: 'API design and database internals.', domain: 'backend' },
      interview: { score: 74, done: true },
      cert: { id: 'CDT-2026-1355', at: '2026-07-10' },
      referralCode: 'DEVAN-9WSH',
      wallet: { balance: 0, transactions: [] },
    },
    {
      id: 'c4',
      name: 'Priya Nair',
      email: 'priya.nair@codetern.dev',
      domain: 'mobile',
      domainTitle: 'Mobile App Development',
      step: 3,
      quizScore: 64,
      quizPassed: false,
      interviewScore: null,
      appliedAt: '2026-07-25',
      status: 'retake',
      booking: { domain: 'mobile', duration: 3, at: '2026-07-25' },
      profile: { name: 'Priya Nair', email: 'priya.nair@codetern.dev', linkedin: 'linkedin.com/in/priya-nair', bio: 'Building cross-platform apps with Flutter.', domain: 'mobile' },
      referralCode: 'PRIYA-4LKD',
      wallet: { balance: 0, transactions: [] },
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
      booking: { domain: 'ai', duration: 6, at: '2026-06-20', payment: { method: 'qr', amount: 5280, txId: 'TXN66018477', at: '2026-06-20T10:00:00.000Z' } },
      cert: { id: 'CDT-2026-1343', at: '2026-07-28' },
      lor: { id: 'LOR-2026-3917', at: '2026-07-29', status: 'issued' },
      interview: { score: 88, done: true },
      referralCode: 'KABIR-2FVT',
      referredBy: 'c1',
      wallet: { balance: 0, transactions: [] },
    },
    {
      id: 'c6',
      name: 'Riya Kapoor',
      email: 'riya.kapoor@codetern.dev',
      domain: null,
      domainTitle: null,
      step: 1,
      quizScore: null,
      quizPassed: false,
      interviewScore: null,
      appliedAt: '2026-07-28',
      status: 'pending',
      referralCode: 'RIYA-6ZNE',
      wallet: { balance: 0, transactions: [] },
    },
  ]
}

// ── Consent + hints for generated certs
export const CERT_SAMPLE_ID = 'CDT-2026-1343'
