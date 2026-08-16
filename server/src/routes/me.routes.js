import { requireAuth } from '../auth/guards.js'
import { query } from '../db/pool.js'
import { parse, profileSchema } from '../lib/validate.js'
import { badRequest, notFound, forbidden } from '../lib/errors.js'
import { scoreQuiz } from '../lib/quiz.js'
import { scoreInterview, fetchInterviewQuestions } from '../lib/interview.js'
import { certId, lorId } from '../lib/ids.js'
import { getSeat } from '../lib/seats.js'
import { getWallet } from '../lib/wallet.js'

const LOR_UNLOCK_MS = 24 * 60 * 60 * 1000

async function domainTitle(domain) {
  if (!domain) return null
  const { rows } = await query('SELECT title FROM programmes WHERE id = $1', [domain])
  return rows[0]?.title || null
}

export async function meRoutes(app) {
  // all routes here require a signed-in user with a candidate row
  app.addHook('preHandler', requireAuth)

  app.get('/me', async (request) => {
    const { rows } = await query('SELECT * FROM candidates WHERE user_id = $1', [request.user.id])
    if (!rows[0]) throw notFound('Candidate profile not found.')
    return { candidate: rows[0] }
  })

  // ── profile (journey step 2) ──────────────────────────────────────
  app.put('/me/profile', async (request) => {
    const data = parse(profileSchema, request.body || {})
    const { rows } = await query(
      `UPDATE candidates SET profile = COALESCE($2, profile), domain = COALESCE($3, domain),
         domain_title = COALESCE($4, domain_title), step = GREATEST(step, 2), status = 'active'
       WHERE user_id = $1 RETURNING *`,
      [request.user.id, data, data.domain || null, data.domain ? await domainTitle(data.domain) : null],
    )
    if (!rows[0]) throw notFound('Candidate profile not found.')
    return { candidate: rows[0] }
  })

  // ── workspace (journey step 3) ────────────────────────────────────
  app.put('/me/workspace', async (request) => {
    const { workspace } = request.body || {}
    if (!workspace || typeof workspace !== 'object') throw badRequest('workspace is required.')
    const { rows } = await query(
      `UPDATE candidates SET workspace = $2,
         step = CASE WHEN $3 THEN GREATEST(step, 3) ELSE step END
       WHERE user_id = $1 RETURNING *`,
      [request.user.id, workspace, Boolean(workspace.tasks?.length && workspace.tasks.every((t) => t.done))],
    )
    if (!rows[0]) throw notFound('Candidate profile not found.')
    return { candidate: rows[0] }
  })

  // ── task evidence: student submits work → admin reviews ───────────
  app.post('/me/workspace/tasks/:index/submit', async (request) => {
    const index = Number(request.params.index)
    const { evidence } = request.body || {}
    if (!Number.isInteger(index) || index < 0) throw badRequest('Invalid task index.')
    if (!evidence || typeof evidence !== 'object') throw badRequest('evidence is required.')

    const { rows } = await query('SELECT * FROM candidates WHERE user_id = $1', [request.user.id])
    if (!rows[0]) throw notFound('Candidate profile not found.')
    const ws = rows[0].workspace
    if (!ws?.tasks || !ws.tasks[index]) throw badRequest('Task index out of range.')

    const tasks = ws.tasks.map((t, i) =>
      i === index ? { ...t, done: false, status: 'pending', evidence: { ...evidence, at: new Date().toISOString() }, review: null } : t,
    )
    const next = { ...ws, tasks }
    await query('UPDATE candidates SET workspace = $2 WHERE id = $1', [rows[0].id, next])
    return { workspace: next }
  })

  // ── quiz (journey step 4) — the server scores it, never the client ─
  app.post('/me/quiz', async (request) => {
    const { domain, answers } = request.body || {}
    if (!domain) throw badRequest('domain is required.')
    const result = await scoreQuiz(domain, answers)

    const { rows } = await query(
      `UPDATE candidates SET quiz = $2, quiz_score = $3, quiz_passed = $4,
         step = CASE WHEN $4 THEN GREATEST(step, 4) ELSE step END
       WHERE user_id = $1 RETURNING *`,
      [request.user.id, { bank: domain, score: result.score, passed: result.passed, at: new Date().toISOString() }, result.score, result.passed],
    )
    if (!rows[0]) throw notFound('Candidate profile not found.')

    // A failed attempt keeps visibility of what was missed (without answers)
    return { result: { ...result, detailed: undefined }, candidate: rows[0] }
  })

  // ── interview (journey step 5) — AI scored (with deterministic fallback)
  app.get('/me/interview/questions', async () => ({ questions: await fetchInterviewQuestions() }))

  app.post('/me/interview', async (request) => {
    const { answers } = request.body || {}
    if (!Array.isArray(answers)) throw badRequest('answers must be an array.')
    const { score, feedback, source } = await scoreInterview(answers)

    const { rows } = await query(
      `UPDATE candidates SET interview = $2, interview_score = $3, step = GREATEST(step, 5)
       WHERE user_id = $1 RETURNING *`,
      [request.user.id, { score, done: true, source, at: new Date().toISOString() }, score],
    )
    if (!rows[0]) throw notFound('Candidate profile not found.')
    return { score, feedback, source }
  })

  // ── certificate ───────────────────────────────────────────────────
  app.post('/me/cert', async (request) => {
    const { rows } = await query('SELECT * FROM candidates WHERE user_id = $1', [request.user.id])
    if (!rows[0]) throw notFound('Candidate profile not found.')
    const c = rows[0]

    if (c.cert) return { cert: c.cert } // idempotent
    if (!c.quiz_passed) throw forbidden('Pass the assessment before claiming a certificate.')

    const id = certId()
    const cert = { id, at: new Date().toISOString() }
    await query('UPDATE candidates SET cert = $2 WHERE id = $1', [c.id, cert])
    return { cert }
  })

  // ── LOR — unlocks 24h after the cert is issued ────────────────────
  app.post('/me/lor', async (request) => {
    const { rows } = await query('SELECT * FROM candidates WHERE user_id = $1', [request.user.id])
    if (!rows[0]) throw notFound('Candidate profile not found.')
    const c = rows[0]
    if (!c.cert) throw forbidden('Claim your certificate first.')
    if (Date.now() - new Date(c.cert.at).getTime() < LOR_UNLOCK_MS) throw forbidden('LOR unlocks 24 hours after your certificate is issued.')
    if (c.lor) return { lor: c.lor } // idempotent

    const lor = { id: lorId(), at: new Date().toISOString(), status: 'issued' }
    await query('UPDATE candidates SET lor = $2 WHERE id = $1', [c.id, lor])
    return { lor }
  })

  // ── graduate: archive finished internship, reset to step 1 ────────
  app.post('/me/graduate', async (request) => {
    const { rows } = await query('SELECT * FROM candidates WHERE user_id = $1', [request.user.id])
    if (!rows[0]) throw notFound('Candidate profile not found.')
    const c = rows[0]

    if (!c.cert) throw forbidden('Complete your internship (claim the certificate) before graduating.')

    const entry = {
      domain: c.domain,
      domainTitle: c.domain_title,
      duration: c.booking?.duration || null,
      cert: c.cert,
      lor: c.lor,
      completedAt: new Date().toISOString(),
    }
    await query(
      `UPDATE candidates SET
         history = $2, domain = NULL, domain_title = NULL, step = 1, status = 'pending',
         quiz = NULL, interview = NULL, cert = NULL, lor = NULL, booking = NULL, workspace = NULL,
         quiz_score = NULL, quiz_passed = false, interview_score = NULL
       WHERE id = $1 RETURNING *`,
      [c.id, [...(c.history || []), entry]],
    )
    return { entry }
  })

  // ── wallet ────────────────────────────────────────────────────────
  app.get('/me/wallet', async (request) => {
    const { rows } = await query('SELECT id FROM candidates WHERE user_id = $1', [request.user.id])
    if (!rows[0]) throw notFound('Candidate profile not found.')
    return getWallet(rows[0].id)
  })

  // ── seat hold / release (pre-payment reservation) ─────────────────
  app.post('/me/seats/hold', async (request) => {
    const { domain, duration } = request.body || {}
    if (!domain || !duration) throw badRequest('domain and duration are required.')
    const seat = await getSeat(domain, Number(duration))
    if (!seat) throw notFound('No such seat cell.')
    if (seat.remaining <= 0) throw badRequest('No seats available for this domain and duration.')

    // Enforced at payment time; a hold simply records intent w/ TTL in Redis.
    const { rows } = await query(
      `UPDATE seats SET held = held + 1 WHERE programme_id = $1 AND duration = $2 AND total - sold - held > 0 RETURNING *`,
      [domain, Number(duration)],
    )
    if (!rows[0]) throw badRequest('No seats available for this domain and duration.')
    return { hold: { domain, duration, remaining: rows[0].total - rows[0].sold - rows[0].held } }
  })

  app.post('/me/seats/release', async (request) => {
    const { domain, duration } = request.body || {}
    if (!domain || !duration) throw badRequest('domain and duration are required.')
    await query('UPDATE seats SET held = GREATEST(held - 1, 0) WHERE programme_id = $1 AND duration = $2 AND held > 0', [domain, Number(duration)])
    return { ok: true }
  })
}