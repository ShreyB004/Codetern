import { requireAdmin } from '../auth/guards.js'
import { query, tx } from '../db/pool.js'
import { parse, idParamSchema } from '../lib/validate.js'
import { badRequest, notFound, conflict } from '../lib/errors.js'
import { overrideSeat, scaleSeats, ensureSeat, getSeatMap } from '../lib/seats.js'
import { getPricing, batchPrice } from '../lib/pricing.js'
import { adminCreditCandidate } from '../lib/wallet.js'
import { uid } from '../lib/ids.js'
import { z } from 'zod'

const domainSchema = z.object({
  id: z.string().trim().min(1).max(40),
  title: z.string().trim().min(1).max(120),
  sub: z.string().trim().max(120).optional().default(''),
  tagline: z.string().trim().max(200).optional().default(''),
  icon: z.string().trim().max(40).optional().default('Code2'),
  color: z.string().trim().max(40).optional().default('mern'),
  durations: z.array(z.number().int().min(1).max(6)).optional(),
  stack: z.array(z.string()).optional(),
  outcomes: z.array(z.string()).optional(),
  description: z.string().max(2000).optional().default(''),
})

const quizSchema = z.object({
  domain: z.string().trim().min(1).max(40),
  minutes: z.number().int().min(1).max(120),
  questions: z
    .array(
      z.object({
        q: z.string().min(1),
        options: z.array(z.string()).min(2).max(6),
        answer: z.number().int().min(0),
        why: z.string().optional().nullable(),
        enabled: z.boolean().optional(),
      }),
    )
    .min(1),
})

const mediaSchema = z.object({
  id: z.string().trim().optional(),
  name: z.string().trim().min(1).max(160),
  kind: z.string().trim().max(20).optional().default('image'),
  slot: z.string().trim().max(60).optional().default('home-hero'),
  width: z.number().int().positive().optional().nullable(),
  height: z.number().int().positive().optional().nullable(),
  gradient: z.string().max(300).optional().nullable(),
  url: z.string().url().optional().nullable(),
})

const seatPatchSchema = z.object({
  total: z.number().int().min(0).optional(),
  sold: z.number().int().min(0).optional(),
  held: z.number().int().min(0).optional(),
})

const scaleSchema = z.object({ factor: z.number().positive() })

const creditSchema = z.object({
  amount: z.number().int().min(1).max(100000),
  reason: z.string().trim().min(1).max(300),
})

export async function adminRoutes(app) {
  app.addHook('preHandler', requireAdmin)

  // ── candidates ──────────────────────────────────────────────────────
  app.get('/admin/candidates', async () => {
    const { rows } = await query('SELECT * FROM candidates ORDER BY created_at DESC')
    return { candidates: rows }
  })

  app.get('/admin/candidates/:id', async (request) => {
    const { id } = parse(idParamSchema, request.params)
    const { rows } = await query('SELECT * FROM candidates WHERE id = $1', [id])
    if (!rows[0]) throw notFound('Candidate not found.')
    return { candidate: rows[0] }
  })

  app.patch('/admin/candidates/:id', async (request) => {
    const { id } = parse(idParamSchema, request.params)
    const body = request.body || {}
    const allowed = new Set(['name', 'email', 'domain', 'domainTitle', 'step', 'status', 'quizScore', 'quizPassed', 'interviewScore'])
    const patch = {}
    for (const key of Object.keys(body)) {
      if (allowed.has(key)) patch[key] = body[key]
    }
    if (Object.keys(patch).length === 0) throw badRequest('No editable fields provided.')

    const colMap = { name: 'name', email: 'email', domain: 'domain', domainTitle: 'domain_title', step: 'step', status: 'status', quizScore: 'quiz_score', quizPassed: 'quiz_passed', interviewScore: 'interview_score' }
    const sets = []
    const params = [id]
    let i = 2
    for (const [key, value] of Object.entries(patch)) {
      sets.push(`${colMap[key]} = $${i}`)
      params.push(value)
      i += 1
    }
    const { rows } = await query(`UPDATE candidates SET ${sets.join(', ')} WHERE id = $1 RETURNING *`, params)
    if (!rows[0]) throw notFound('Candidate not found.')
    return { candidate: rows[0] }
  })

  app.delete('/admin/candidates/:id', async (request) => {
    const { id } = parse(idParamSchema, request.params)
    const { rows } = await query('DELETE FROM candidates WHERE id = $1 RETURNING id', [id])
    if (!rows[0]) throw notFound('Candidate not found.')
    return { ok: true }
  })

  // Admin reviews submitted task evidence
  app.post('/admin/candidates/:id/workspace/tasks/:index/review', async (request) => {
    const { id } = parse(idParamSchema, request.params)
    const index = Number(request.params.index)
    const { verdict, note } = request.body || {}
    if (!Number.isInteger(index) || index < 0) throw badRequest('Invalid task index.')
    if (!['approve', 'reject'].includes(verdict)) throw badRequest('verdict must be "approve" or "reject".')

    const { rows } = await query('SELECT * FROM candidates WHERE id = $1', [id])
    if (!rows[0]) throw notFound('Candidate not found.')
    const ws = rows[0].workspace
    if (!ws?.tasks || !ws.tasks[index]) throw badRequest('Task index out of range.')

    const approved = verdict === 'approve'
    const tasks = ws.tasks.map((t, i) =>
      i === index ? { ...t, done: approved, status: approved ? 'approved' : 'revision', review: { verdict, note: note || '', at: new Date().toISOString() } } : t,
    )
    const allDone = tasks.length > 0 && tasks.every((t) => t.done)
    await query('UPDATE candidates SET workspace = $2, step = GREATEST(step, $3) WHERE id = $1', [id, { ...ws, tasks }, allDone ? 3 : rows[0].step])
    return { ok: true, workspace: { ...ws, tasks } }
  })

  // Admin override of the workspace JSON (rare, full control)
  app.put('/admin/candidates/:id/workspace', async (request) => {
    const { id } = parse(idParamSchema, request.params)
    const { workspace } = request.body || {}
    if (!workspace || typeof workspace !== 'object') throw badRequest('workspace is required.')
    const { rows } = await query('UPDATE candidates SET workspace = $2 WHERE id = $1 RETURNING *', [id, workspace])
    if (!rows[0]) throw notFound('Candidate not found.')
    return { candidate: rows[0] }
  })

  // Wallet credit (support/compensation)
  app.post('/admin/candidates/:id/wallet/credit', async (request) => {
    const { id } = parse(idParamSchema, request.params)
    const { amount, reason } = parse(creditSchema, request.body || {})
    const credited = await adminCreditCandidate(id, amount, reason)
    if (!credited) throw notFound('Candidate not found.')
    const { rows } = await query('SELECT * FROM candidates WHERE id = $1', [id])
    return { ok: true, balance: rows[0].wallet_balance }
  })

  // ── programmes (domains) ────────────────────────────────────────────
  app.post('/admin/programmes', async (request) => {
    const data = parse(domainSchema, request.body || {})
    const { rows } = await query('SELECT 1 FROM programmes WHERE id = $1', [data.id])
    if (rows[0]) throw conflict('A programme with this id already exists.')

    const created = await tx(async (client) => {
      const r = await client.query(
        `INSERT INTO programmes (id, title, sub, tagline, icon, color, durations, stack, outcomes, description)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING *`,
        [data.id, data.title, data.sub, data.tagline, data.icon, data.color, JSON.stringify(data.durations || []), JSON.stringify(data.stack || []), JSON.stringify(data.outcomes || []), data.description],
      )
      for (const d of data.durations || []) {
        await client.query('INSERT INTO seats (programme_id, duration, total) VALUES ($1,$2,24) ON CONFLICT DO NOTHING', [data.id, d])
      }
      return r.rows
    })
    return { programme: created[0] }
  })

  app.put('/admin/programmes/:id', async (request) => {
    const { id } = parse(idParamSchema, request.params)
    const data = parse(domainSchema.omit({ id: true }), request.body || {})
    const rows = await tx(async (client) => {
      const r = await client.query(
        `UPDATE programmes SET title=$2, sub=$3, tagline=$4, icon=$5, color=$6, durations=$7, stack=$8, outcomes=$9, description=$10
         WHERE id = $1 RETURNING *`,
        [id, data.title, data.sub, data.tagline, data.icon, data.color, JSON.stringify(data.durations || []), JSON.stringify(data.stack || []), JSON.stringify(data.outcomes || []), data.description],
      )
      if (r.rows[0]) {
        for (const d of data.durations || []) {
          await client.query('INSERT INTO seats (programme_id, duration, total) VALUES ($1,$2,24) ON CONFLICT DO NOTHING', [id, d])
        }
      }
      return r.rows
    })
    if (!rows[0]) throw notFound('Programme not found.')
    return { programme: rows[0] }
  })

  app.delete('/admin/programmes/:id', async (request) => {
    const { id } = parse(idParamSchema, request.params)
    const { rows } = await query('DELETE FROM programmes WHERE id = $1 RETURNING id', [id])
    if (!rows[0]) throw notFound('Programme not found.')
    return { ok: true }
  })

  // ── quiz banks ─────────────────────────────────────────────────────
  app.get('/admin/quiz', async () => {
    const { rows } = await query('SELECT * FROM quiz_banks ORDER BY domain')
    const banks = {}
    for (const r of rows) banks[r.domain] = { minutes: r.minutes, questions: r.questions }
    return { quizBanks: banks }
  })

  app.put('/admin/quiz/:domain', async (request) => {
    const { domain } = request.params
    const data = parse(quizSchema, { domain, ...(request.body || {}) })
    await query(
      `INSERT INTO quiz_banks (domain, minutes, questions) VALUES ($1,$2,$3)
       ON CONFLICT (domain) DO UPDATE SET minutes = EXCLUDED.minutes, questions = EXCLUDED.questions`,
      [domain, data.minutes, JSON.stringify(data.questions)],
    )
    return { ok: true }
  })

  app.patch('/admin/quiz/:domain/questions/:index', async (request) => {
    const { domain } = request.params
    const index = Number(request.params.index)
    const { enabled } = request.body || {}
    if (typeof enabled !== 'boolean') throw badRequest('enabled (boolean) is required.')

    const { rows } = await query('SELECT questions FROM quiz_banks WHERE domain = $1', [domain])
    if (!rows[0]) throw notFound('Quiz bank not found.')
    const questions = [...rows[0].questions]
    if (!questions[index]) throw notFound('Question index out of range.')
    questions[index] = { ...questions[index], enabled }

    await query('UPDATE quiz_banks SET questions = $2 WHERE domain = $1', [domain, JSON.stringify(questions)])
    return { ok: true }
  })

  app.delete('/admin/quiz/:domain/questions/:index', async (request) => {
    const { domain } = request.params
    const index = Number(request.params.index)
    const { rows } = await query('SELECT questions FROM quiz_banks WHERE domain = $1', [domain])
    if (!rows[0]) throw notFound('Quiz bank not found.')
    const questions = rows[0].questions.filter((_, i) => i !== index)
    await query('UPDATE quiz_banks SET questions = $2 WHERE domain = $1', [domain, JSON.stringify(questions)])
    return { ok: true }
  })

  // ── workspace defaults ──────────────────────────────────────────────
  app.get('/admin/workspace-defaults', async () => {
    const { rows } = await query('SELECT * FROM workspace_defaults ORDER BY domain')
    return { workspaceDefaults: rows.map((r) => ({ domain: r.domain, tasks: r.tasks, resources: r.resources })) }
  })

  app.put('/admin/workspace-defaults/:domain', async (request) => {
    const { domain } = request.params
    const { tasks, resources } = request.body || {}
    if (!Array.isArray(tasks) || !Array.isArray(resources)) throw badRequest('tasks and resources arrays are required.')
    await query(
      `INSERT INTO workspace_defaults (domain, tasks, resources) VALUES ($1,$2,$3)
       ON CONFLICT (domain) DO UPDATE SET tasks = EXCLUDED.tasks, resources = EXCLUDED.resources`,
      [domain, JSON.stringify(tasks), JSON.stringify(resources)],
    )
    return { ok: true }
  })

  // ── seats controller (mirrors SeatsContext) ─────────────────────────
  app.get('/admin/seats', async () => ({ seats: await getSeatMap() }))

  app.put('/admin/seats/:domain/:duration', async (request) => {
    const { domain, duration } = request.params
    const data = parse(seatPatchSchema, request.body || {})
    const seat = await overrideSeat(domain, Number(duration), data)
    return { seat: { ...seat, remaining: Math.max(0, seat.total - seat.sold - seat.held) } }
  })

  app.post('/admin/seats/scale', async (request) => {
    const { factor } = parse(scaleSchema, request.body || {})
    const count = await scaleSeats(factor)
    return { ok: true, updatedCells: count }
  })

  app.post('/admin/seats/ensure', async (request) => {
    const { domain, duration } = request.body || {}
    if (!domain || !duration) throw badRequest('domain and duration are required.')
    const seat = await ensureSeat(domain, Number(duration))
    return { seat }
  })

  // ── pricing (static config exposure) ────────────────────────────────
  app.get('/admin/pricing', async () => ({ pricing: await getPricing() }))

  // ── media (asset manager) ───────────────────────────────────────────
  app.get('/admin/media', async () => {
    const { rows } = await query('SELECT * FROM media ORDER BY created_at DESC')
    return { media: rows }
  })

  app.post('/admin/media', async (request) => {
    const data = parse(mediaSchema, request.body || {})
    const id = data.id || uid('m')
    const { rows } = await query(
      `INSERT INTO media (id, name, kind, slot, width, height, gradient, url) VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *`,
      [id, data.name, data.kind, data.slot, data.width ?? null, data.height ?? null, data.gradient ?? null, data.url ?? null],
    )
    return { media: rows[0] }
  })

  app.put('/admin/media/:id', async (request) => {
    const { id } = parse(idParamSchema, request.params)
    const data = parse(mediaSchema.omit({ id: true }), request.body || {})
    const { rows } = await query(
      `UPDATE media SET name=$2, kind=$3, slot=$4, width=$5, height=$6, gradient=$7, url=$8 WHERE id = $1 RETURNING *`,
      [id, data.name, data.kind, data.slot, data.width ?? null, data.height ?? null, data.gradient ?? null, data.url ?? null],
    )
    if (!rows[0]) throw notFound('Media item not found.')
    return { media: rows[0] }
  })

  app.delete('/admin/media/:id', async (request) => {
    const { id } = parse(idParamSchema, request.params)
    const { rows } = await query('DELETE FROM media WHERE id = $1 RETURNING id', [id])
    if (!rows[0]) throw notFound('Media item not found.')
    return { ok: true }
  })
}