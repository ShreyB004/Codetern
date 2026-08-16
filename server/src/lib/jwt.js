import { SignJWT, jwtVerify } from 'jose'
import { createHash } from 'node:crypto'
import { env } from '../env.js'
import { unauthorized } from './errors.js'

const enc = new TextEncoder()
const accessKey = () => enc.encode(env.JWT_SECRET)
const refreshKey = () => enc.encode(env.JWT_REFRESH_SECRET)

export async function signAccessToken(user) {
  return new SignJWT({ role: user.role, name: user.name })
    .setProtectedHeader({ alg: 'HS256' })
    .setSubject(user.id)
    .setIssuedAt()
    .setExpirationTime(env.JWT_ACCESS_TTL)
    .sign(accessKey())
}

export async function signRefreshToken(user, sessionId, expiresAt) {
  return new SignJWT({ sid: sessionId })
    .setProtectedHeader({ alg: 'HS256' })
    .setSubject(user.id)
    .setIssuedAt()
    .setExpirationTime(expiresAt)
    .sign(refreshKey())
}

export async function verifyAccessToken(token) {
  try {
    const { payload } = await jwtVerify(token, accessKey(), { algorithms: ['HS256'] })
    return { userId: payload.sub, role: payload.role }
  } catch {
    throw unauthorized('Session expired or invalid. Sign in again.')
  }
}

export async function verifyRefreshToken(token) {
  try {
    const { payload } = await jwtVerify(token, refreshKey(), { algorithms: ['HS256'] })
    return { userId: payload.sub, sessionId: payload.sid }
  } catch {
    throw unauthorized('Session expired. Sign in again.')
  }
}

// Rotating refresh sessions are stored (hashed) in Redis so logout and
// rotation can invalidate stolen tokens.
export const hashSession = (raw) => createHash('sha256').update(raw).digest('hex')

export const refreshTtlSeconds = () => {
  const match = /^(\d+)([smhd])$/.exec(env.JWT_REFRESH_TTL)
  if (!match) return 7 * 24 * 3600
  const n = Number(match[1])
  const unit = { s: n, m: n * 60, h: n * 3600, d: n * 86400 }[match[2]]
  return unit ?? 7 * 24 * 3600
}