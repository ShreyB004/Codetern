import { verifyAccessToken } from '../lib/jwt.js'
import { query } from '../db/pool.js'
import { unauthorized, forbidden } from '../lib/errors.js'

async function loadUser(userId) {
  const { rows } = await query('SELECT id, name, email, role, referral_code AS "referralCode" FROM users WHERE id = $1', [userId])
  return rows[0] || null
}

export async function requireAuth(request) {
  const header = request.headers.authorization || ''
  const token = header.startsWith('Bearer ') ? header.slice(7) : null
  if (!token) throw unauthorized()

  const { userId, role } = await verifyAccessToken(token)
  const user = await loadUser(userId)
  if (!user) throw unauthorized('Account no longer exists.')

  request.user = user
  request.claims = { userId, role }
  return user
}

export async function requireAdmin(request) {
  const user = await requireAuth(request)
  if (user.role !== 'admin') throw forbidden()
  return user
}

// Optional auth: reads the token if present but never rejects.
export async function optionalAuth(request) {
  const header = request.headers.authorization || ''
  if (!header.startsWith('Bearer ')) return null
  try {
    const { userId } = await verifyAccessToken(header.slice(7))
    const user = await loadUser(userId)
    if (user) request.user = user
    return user
  } catch {
    return null
  }
}

export async function requireCandidate(request) {
  const user = await requireAuth(request)
  const { rows } = await query('SELECT * FROM candidates WHERE user_id = $1', [user.id])
  if (!rows[0]) throw unauthorized('No candidate profile exists for this account.')
  request.candidate = rows[0]
  return rows[0]
}