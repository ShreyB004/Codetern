import { requireAuth } from '../auth/guards.js'
import { parse, signupSchema, loginSchema } from '../lib/validate.js'
import { hashPassword, verifyPassword, verifyPasswordDummy } from '../lib/passwords.js'
import { signAccessToken, verifyRefreshToken } from '../lib/jwt.js'
import { setRefreshCookie, clearRefreshCookie, readRefreshCookie } from '../lib/cookies.js'
import {
  newSessionId, saveSession, validateSession, destroySession, rotateSession, revokeFamily,
} from '../lib/sessions.js'
import { query, tx } from '../db/pool.js'
import { uid, referralCodeFor } from '../lib/ids.js'
import { badRequest, conflict, unauthorized } from '../lib/errors.js'

const REFERRAL_REWARD = 50

export async function authRoutes(app) {
  // ── signup ──────────────────────────────────────────────────────────
  app.post('/auth/signup', { config: { rateLimit: { max: 8, timeWindow: '1 minute' } } }, async (request, reply) => {
    const { name, email, password, referralCode } = parse(signupSchema, request.body || {})

    const id = uid('u')
    const code = referralCodeFor(name)
    const passwordHash = await hashPassword(password)
    const referred = referralCode
      ? (await query('SELECT id FROM candidates WHERE referral_code = $1', [referralCode]))?.rows?.[0] || null
      : null

    const created = await tx(async (client) => {
      const { rows } = await client.query(
        `INSERT INTO users (id, name, email, password_hash, role, referral_code)
         VALUES ($1, $2, $3, $4, 'student', $5)
         RETURNING id, name, email, role, referral_code AS "referralCode", created_at AS "createdAt"`,
        [id, name, email, passwordHash, code],
      )
      if (!rows[0]) throw conflict('Could not create the account.')
      await client.query(
        `INSERT INTO candidates
           (id, user_id, name, email, step, status, referral_code, referred_by, wallet_balance)
         VALUES ($1, $2, $3, $4, 1, 'pending', $5, $6, 0)`,
        [id, id, name, email, code, referred?.id || null],
      )
      return rows[0]
    })

    const sessionId = newSessionId()
    await saveSession(sessionId, created.id)
    const access = await signAccessToken(created)
    const refresh = await rotateSession(null, created.id).then((r) => r.token)
    await destroySession(sessionId)
    setRefreshCookie(reply, refresh)

    return reply.code(201).send({
      ok: true,
      referred: Boolean(referred),
      access,
      user: { id: created.id, name: created.name, email: created.email, role: created.role, referralCode: created.referralCode },
    })
  })

  // ── login ───────────────────────────────────────────────────────────
  app.post('/auth/login', { config: { rateLimit: { max: 10, timeWindow: '1 minute' } } }, async (request, reply) => {
    const { email, password } = parse(loginSchema, request.body || {})
    const { rows } = await query('SELECT * FROM users WHERE email = $1', [email])
    const user = rows[0]

    // Uniform failure path: unknown emails burn a real bcrypt compare so
    // timing cannot reveal whether an email exists, and both cases return
    // the exact same message.
    if (!user) {
      await verifyPasswordDummy(password)
      throw unauthorized('Invalid email or password.')
    }
    if (!(await verifyPassword(password, user.password_hash))) {
      throw unauthorized('Invalid email or password.')
    }

    const sessionId = newSessionId()
    await saveSession(sessionId, user.id)
    const access = await signAccessToken(user)
    const refresh = await rotateSession(null, user.id).then((r) => r.token)
    await destroySession(sessionId)
    setRefreshCookie(reply, refresh)

    return {
      ok: true,
      access,
      user: { id: user.id, name: user.name, email: user.email, role: user.role, referralCode: user.referral_code },
    }
  })

  // ── refresh (rotation on every use) ────────────────────────────────
  app.post('/auth/refresh', { config: { rateLimit: { max: 10, timeWindow: '1 minute' } } }, async (request, reply) => {
    const token = readRefreshCookie(request)
    if (!token) throw unauthorized('No refresh token provided.')

    const { userId, sessionId } = await verifyRefreshToken(token)
    const session = await validateSession(sessionId)
    if (!session) throw unauthorized('Session expired. Sign in again.')

    if (session.status === 'rotated') {
      // A rotated token was presented again → almost certainly theft.
      // Revoke every live refresh session of this user (token family).
      await revokeFamily(userId)
      throw unauthorized('Session expired. Sign in again.')
    }

    const { rows } = await query('SELECT id, name, email, role FROM users WHERE id = $1', [userId])
    if (!rows[0]) throw unauthorized('Account no longer exists.')
    const user = rows[0]

    const { token: next } = await rotateSession(sessionId, user.id)
    setRefreshCookie(reply, next)
    const access = await signAccessToken(user)

    return { ok: true, access, user: { id: user.id, name: user.name, email: user.email, role: user.role } }
  })

  // ── logout ─────────────────────────────────────────────────────────
  app.post('/auth/logout', { config: { rateLimit: { max: 10, timeWindow: '1 minute' } } }, async (request, reply) => {
    const token = readRefreshCookie(request)
    if (token) {
      try {
        const { sessionId } = await verifyRefreshToken(token)
        await destroySession(sessionId)
      } catch {
        // already invalid — logout is idempotent
      }
    }
    clearRefreshCookie(reply)
    return { ok: true }
  })

  // ── me ─────────────────────────────────────────────────────────────
  app.get('/auth/me', { preHandler: requireAuth }, async (request) => {
    const { rows } = await query(
      `SELECT id, name, email, role, referral_code AS "referralCode", created_at AS "createdAt" FROM users WHERE id = $1`,
      [request.user.id],
    )
    if (!rows[0]) throw unauthorized('Account no longer exists.')

    const { rows: candRows } = await query('SELECT * FROM candidates WHERE user_id = $1', [request.user.id])
    const candidate = candRows[0]
      ? {
          id: candRows[0].id, name: candRows[0].name, step: candRows[0].step, status: candRows[0].status,
          domain: candRows[0].domain, domainTitle: candRows[0].domain_title,
          quizScore: candRows[0].quiz_score, quizPassed: candRows[0].quiz_passed,
          interviewScore: candRows[0].interview_score, referralCode: candRows[0].referral_code,
        }
      : null

    return { user: rows[0], candidate, isAdmin: rows[0].role === 'admin' }
  })

  // ── uploads (authenticated file access for evidence screenshots) ──
  app.get('/files/:filename', { preHandler: requireAuth }, async (request, reply) => {
    const { filename } = request.params
    if (!filename || filename.includes('..') || /\//.test(filename)) throw badRequest('Invalid file name.')
    return reply.sendFile(filename)
  })
}