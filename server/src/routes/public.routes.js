import { query } from '../db/pool.js'
import { getSeatMap } from '../lib/seats.js'
import { optionalAuth } from '../auth/guards.js'
import { notFound } from '../lib/errors.js'
import { parse, idParamSchema } from '../lib/validate.js'
import { z } from 'zod'

const domainParamSchema = z.object({ domain: z.string().trim().min(1).max(40) })

export async function publicRoutes(app) {
  app.get('/programmes', async () => {
    const { rows } = await query('SELECT * FROM programmes ORDER BY sort_order, id')
    const seats = await getSeatMap()
    return {
      programmes: rows.map((p) => ({
        id: p.id,
        title: p.title,
        sub: p.sub,
        tagline: p.tagline,
        icon: p.icon,
        color: p.color,
        durations: p.durations,
        stack: p.stack,
        outcomes: p.outcomes,
        description: p.description,
        seats: seats[p.id] || {},
      })),
    }
  })

  app.get('/programmes/:id', async (request) => {
    const { id } = parse(idParamSchema, request.params)
    const { rows } = await query('SELECT * FROM programmes WHERE id = $1', [id])
    if (!rows[0]) throw notFound('Programme not found.')
    const seats = await getSeatMap()
    return { programme: { ...rows[0], seats: seats[rows[0].id] || {} } }
  })

  app.get('/seats', async () => ({ seats: await getSeatMap() }))

  // Quiz questions for the student UI — answers and explanations are NEVER
  // exposed publicly; the server scores submissions.
  app.get('/quiz/:domain', async (request) => {
    const { domain } = parse(domainParamSchema, request.params)
    const { rows } = await query('SELECT minutes, questions FROM quiz_banks WHERE domain = $1', [domain])
    if (!rows[0]) throw notFound('No question bank exists for this domain.')
    const questions = rows[0].questions
      .filter((q) => q.enabled !== false)
      .map(({ answer, why, enabled, ...q }) => q)
    return { domain, minutes: rows[0].minutes, questions }
  })

  // Full candidate JSON (used after login to hydrate the dashboard)
  app.get('/me/candidate', { preHandler: optionalAuth }, async (request, reply) => {
    if (!request.user) return reply.code(401).send({ error: { code: 'unauthorized', message: 'Authentication required.' } })
    const { rows } = await query('SELECT * FROM candidates WHERE user_id = $1', [request.user.id])
    if (!rows[0]) return reply.code(404).send({ error: { code: 'not_found', message: 'Candidate not found.' } })
    return reply.send({ candidate: rows[0] })
  })
}