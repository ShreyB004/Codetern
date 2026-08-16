import 'dotenv/config'
import { readFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import path from 'node:path'
import pg from 'pg'
import bcrypt from 'bcryptjs'

const DIR = path.join(path.dirname(fileURLToPath(import.meta.url)), 'seed-data')

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  max: 2,
  connectionTimeoutMillis: 30_000,
  statement_timeout: 60_000,
})

const readJson = async (name) => JSON.parse(await readFile(path.join(DIR, name), 'utf8'))

// ── admin demo account (matches frontend seed so nothing breaks in dev) ──
const ADMIN = { id: 'admin-1', name: 'Platform Admin', email: 'admin@codetern.dev', password: 'admin123', role: 'admin', referralCode: 'ADMIN-1' }

// ── demo candidate roster (idempotent; admin table works out of the box) ──
const DEMO_CANDIDATES = [
  { id: 'c1', name: 'Aarav Mehta', email: 'aarav.mehta@codetern.dev', domain: 'mern', domainTitle: 'Full-Stack Development', step: 5, status: 'active', appliedAt: '2026-07-12', quizScore: 87, quizPassed: true, interviewScore: 82, referralCode: 'AARAV-7K2M', walletBalance: 100, booking: { domain: 'mern', duration: 3, at: '2026-07-12T09:00:00.000Z', payment: { method: 'upi', amount: 2430, txId: 'TXN81042551', at: '2026-07-12T09:00:00.000Z' } }, cert: { id: 'CDT-2026-1343', at: '2026-08-01' }, lor: { id: 'LOR-2026-4821', at: '2026-08-02', status: 'issued' }, interview: { score: 82, done: true }, history: [{ domain: 'web', domainTitle: 'Foundational Web Development', duration: 2, cert: { id: 'CDT-2026-0902', at: '2026-04-10' }, lor: { id: 'LOR-2026-1104', at: '2026-04-11' }, completedAt: '2026-04-11T10:00:00.000Z' }] },
  { id: 'c2', name: 'Sana Iqbal', email: 'sana.iqbal@codetern.dev', domain: 'frontend', domainTitle: 'Front-End Development', step: 4, status: 'active', appliedAt: '2026-07-18', quizScore: 92, quizPassed: true, referralCode: 'SANA-3XPQ', referredBy: 'c1', profile: { name: 'Sana Iqbal', email: 'sana.iqbal@codetern.dev', linkedin: 'linkedin.com/in/sana-iqbal', bio: 'Frontend enthusiast building design systems.', domain: 'frontend' }, booking: { domain: 'frontend', duration: 2, at: '2026-07-18' } },
  { id: 'c3', name: 'Devansh Rao', email: 'devansh.rao@codetern.dev', domain: 'backend', domainTitle: 'Back-End Engineering', step: 5, status: 'active', appliedAt: '2026-07-02', quizScore: 78, quizPassed: true, interviewScore: 74, referralCode: 'DEVAN-9WSH', profile: { name: 'Devansh Rao', email: 'devansh.rao@codetern.dev', linkedin: 'linkedin.com/in/devansh-rao', bio: 'API design and database internals.', domain: 'backend' }, booking: { domain: 'backend', duration: 3, at: '2026-07-02T11:00:00.000Z', payment: { method: 'card', amount: 2430, txId: 'TXN77291833', at: '2026-07-02T11:00:00.000Z' } }, interview: { score: 74, done: true }, cert: { id: 'CDT-2026-1355', at: '2026-07-10' } },
  { id: 'c4', name: 'Priya Nair', email: 'priya.nair@codetern.dev', domain: 'mobile', domainTitle: 'Mobile App Development', step: 3, status: 'retake', appliedAt: '2026-07-25', quizScore: 64, quizPassed: false, referralCode: 'PRIYA-4LKD', profile: { name: 'Priya Nair', email: 'priya.nair@codetern.dev', linkedin: 'linkedin.com/in/priya-nair', bio: 'Building cross-platform apps with Flutter.', domain: 'mobile' }, booking: { domain: 'mobile', duration: 3, at: '2026-07-25' } },
  { id: 'c5', name: 'Kabir Shah', email: 'kabir.shah@codetern.dev', domain: 'ai', domainTitle: 'AI & LLM Development', step: 5, status: 'active', appliedAt: '2026-06-20', quizScore: 95, quizPassed: true, interviewScore: 88, referralCode: 'KABIR-2FVT', referredBy: 'c1', profile: { name: 'Kabir Shah', email: 'kabir.shah@codetern.dev', linkedin: 'linkedin.com/in/kabir-shah', bio: 'Building LLM applications with RAG.', domain: 'ai' }, booking: { domain: 'ai', duration: 6, at: '2026-06-20T10:00:00.000Z', payment: { method: 'qr', amount: 5280, txId: 'TXN66018477', at: '2026-06-20T10:00:00.000Z' } }, interview: { score: 88, done: true }, cert: { id: 'CDT-2026-1343', at: '2026-07-28' }, lor: { id: 'LOR-2026-3917', at: '2026-07-29', status: 'issued' } },
  { id: 'c6', name: 'Riya Kapoor', email: 'riya.kapoor@codetern.dev', domain: null, domainTitle: null, step: 1, status: 'pending', appliedAt: '2026-07-28', referralCode: 'RIYA-6ZNE' },
]

async function seedProgrammes(client, programmes, seatPool) {
  programmes.forEach((p, i) => {
    p.durations.forEach(async () => {})
  })
  for (const [i, p] of programmes.entries()) {
    await client.query(
      `INSERT INTO programmes (id, title, sub, tagline, icon, color, durations, stack, outcomes, description, sort_order)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
       ON CONFLICT (id) DO UPDATE SET
         title = EXCLUDED.title, sub = EXCLUDED.sub, tagline = EXCLUDED.tagline,
         icon = EXCLUDED.icon, color = EXCLUDED.color, durations = EXCLUDED.durations,
         stack = EXCLUDED.stack, outcomes = EXCLUDED.outcomes,
         description = EXCLUDED.description, sort_order = EXCLUDED.sort_order`,
      [p.id, p.title, p.sub, p.tagline, p.icon, p.color, JSON.stringify(p.durations), JSON.stringify(p.stack), JSON.stringify(p.outcomes), p.description, i],
    )
    for (const d of p.durations) {
      const total = seatPool[d] ?? 24
      await client.query(
        `INSERT INTO seats (programme_id, duration, total)
         VALUES ($1,$2,$3)
         ON CONFLICT (programme_id, duration) DO UPDATE SET total = EXCLUDED.total
         WHERE seats.sold + seats.held <= EXCLUDED.total`,
        [p.id, d, total],
      )
    }
  }
}

async function seedJson(table, rows, idKey = null) {
  if (!rows) return
  for (const row of rows) {
    const entries = Object.entries(row).filter(([k, v]) => v !== undefined && v !== null)
    const cols = entries.map(([k]) => k).join(', ')
    const placeholders = entries.map((_, i) => `$${i + 1}`).join(', ')
    const values = entries.map(([, v]) => (typeof v === 'object' ? JSON.stringify(v) : v))
    const conflict = idKey ? `ON CONFLICT (${idKey}) DO NOTHING` : 'ON CONFLICT DO NOTHING'
    await pool.query(`INSERT INTO ${table} (${cols}) VALUES (${placeholders}) ${conflict}`, values)
  }
}

try {
  const programmes = await readJson('programmes.json')
  const seatPool = await readJson('seat-pool.json')
  const quiz = await readJson('quiz.json')
  const workspace = await readJson('workspace.json')
  const workspaceDefault = await readJson('workspace-default.json')
  const media = await readJson('media.json')

  const client = await pool.connect()
  try {
    await client.query('BEGIN')
    await seedProgrammes(client, programmes, seatPool)

    for (const [domain, bank] of Object.entries(quiz)) {
      await client.query(
        `INSERT INTO quiz_banks (domain, minutes, questions) VALUES ($1,$2,$3)
         ON CONFLICT (domain) DO UPDATE SET minutes = EXCLUDED.minutes, questions = EXCLUDED.questions`,
        [domain, bank.minutes, JSON.stringify(bank.questions)],
      )
    }

    for (const [domain, ws] of Object.entries(workspace)) {
      await client.query(
        `INSERT INTO workspace_defaults (domain, tasks, resources) VALUES ($1,$2,$3)
         ON CONFLICT (domain) DO UPDATE SET tasks = EXCLUDED.tasks, resources = EXCLUDED.resources`,
        [domain, JSON.stringify(ws.tasks), JSON.stringify(ws.resources)],
      )
    }
    await client.query(
      `INSERT INTO workspace_defaults (domain, tasks, resources) VALUES ('__default__',$1,$2)
       ON CONFLICT (domain) DO UPDATE SET tasks = EXCLUDED.tasks, resources = EXCLUDED.resources`,
      [JSON.stringify(workspaceDefault.tasks), JSON.stringify(workspaceDefault.resources)],
    )

    // admin user — upsert, keep existing password hash if the user already exists
    const adminHash = await bcrypt.hash(ADMIN.password, 10)
    await client.query(
      `INSERT INTO users (id, name, email, password_hash, role, referral_code) VALUES ($1,$2,$3,$4,$5,$6)
       ON CONFLICT (email) DO UPDATE SET name = EXCLUDED.name, role = EXCLUDED.role`,
      [ADMIN.id, ADMIN.name, ADMIN.email, adminHash, ADMIN.role, ADMIN.referralCode],
    )

    // demo candidates (no user accounts — they back the admin roster only)
    const keyMap = {
      id: 'id', name: 'name', email: 'email', domain: 'domain', domainTitle: 'domain_title',
      step: 'step', status: 'status', appliedAt: 'applied_at', quizScore: 'quiz_score',
      quizPassed: 'quiz_passed', interviewScore: 'interview_score', referralCode: 'referral_code',
      referredBy: 'referred_by', walletBalance: 'wallet_balance', profile: 'profile',
      booking: 'booking', quiz: 'quiz', interview: 'interview', cert: 'cert', lor: 'lor', history: 'history',
    }
    for (const c of DEMO_CANDIDATES) {
      // Only include columns with a value — nullable and defaulted columns
      // fall back to their defaults instead of forcing NULL.
      const pairs = Object.entries(keyMap).filter(([src]) => c[src] !== undefined && c[src] !== null)
      const cols = pairs.map(([, col]) => col)
      const values = pairs.map(([src, col]) => (typeof c[src] === 'object' ? JSON.stringify(c[src]) : c[src]))
      await client.query(
        `INSERT INTO candidates (${cols.join(',')}) VALUES (${cols.map((_, i) => `$${i + 1}`).join(',')})
         ON CONFLICT (id) DO UPDATE SET
           name = EXCLUDED.name, email = EXCLUDED.email, domain = EXCLUDED.domain,
           domain_title = EXCLUDED.domain_title, step = EXCLUDED.step, status = EXCLUDED.status,
           quiz_score = EXCLUDED.quiz_score, quiz_passed = EXCLUDED.quiz_passed,
           interview_score = EXCLUDED.interview_score, wallet_balance = EXCLUDED.wallet_balance`,
        values,
      )
    }
    // wallet transaction for c1 so the refer-credit audit trail demos correctly
    await client.query(
      `INSERT INTO wallet_transactions (id, candidate_id, amount, reason, source_type, source_id)
       VALUES ('t-seed-c1', 'c1', 100, 'Referral rewards (seeded demo)', 'seed', 'seed-c1')
       ON CONFLICT DO NOTHING`,
    )

    await client.query('COMMIT')
  } catch (err) {
    await client.query('ROLLBACK')
    throw err
  } finally {
    client.release()
  }

  console.log(`seed complete: ${programmes.length} programmes, ${Object.keys(quiz).length} quiz banks, ${media.length} media, admin + ${DEMO_CANDIDATES.length} demo candidates`)
  await pool.end()
} catch (err) {
  console.error('seed failed:', err.message)
  await pool.end().catch(() => {})
  process.exitCode = 1
}