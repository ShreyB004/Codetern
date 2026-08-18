import { randomBytes } from 'node:crypto'
import redis from '../db/redis.js'
import { hashSession, refreshTtlSeconds, signRefreshToken } from './jwt.js'

const ROTATED = '__rotated__'

const sessionKey = (sessionId) => `session:${hashSession(sessionId)}`
const userSetKey = (userId) => `sessions:${userId}`

export function newSessionId() {
  return randomBytes(32).toString('hex')
}

export async function saveSession(sessionId, userId, ttlSeconds = refreshTtlSeconds()) {
  const hash = hashSession(sessionId)
  const key = sessionKey(sessionId)
  const multi = redis.multi()
  multi.set(key, userId, 'EX', ttlSeconds)
  multi.sadd(userSetKey(userId), hash)
  multi.expire(userSetKey(userId), ttlSeconds)
  await multi.exec()
  await pruneUserSet(userId)
  return key
}

export async function validateSession(sessionId) {
  if (!sessionId) return null
  const key = sessionKey(sessionId)
  const value = await redis.get(key)
  if (!value) return null
  if (value === ROTATED) return { status: 'rotated', key }
  return { userId: value, key, status: 'active' }
}

export async function destroySession(sessionId) {
  if (!sessionId) return
  const key = sessionKey(sessionId)
  const value = await redis.get(key)
  if (!value) return
  const multi = redis.multi()
  multi.del(key)
  if (value !== ROTATED) multi.srem(userSetKey(value), hashSession(sessionId))
  await multi.exec()
}

export async function rotateSession(oldSessionId, userId) {
  const next = newSessionId()
  const ttlSeconds = refreshTtlSeconds()
  const hash = hashSession(next)
  const key = sessionKey(next)
  const multi = redis.multi()
  multi.set(key, userId, 'EX', ttlSeconds)
  multi.sadd(userSetKey(userId), hash)
  multi.expire(userSetKey(userId), ttlSeconds)
  if (oldSessionId) {
    // Tombstone, not delete: a replayed old token stays detectable so the
    // refresh handler can flag it as reuse. Plain SET keeps the old TTL.
    multi.set(sessionKey(oldSessionId), ROTATED)
    multi.srem(userSetKey(userId), hashSession(oldSessionId))
  }
  await multi.exec()
  const token = await signRefreshToken({ id: userId }, next, new Date(Date.now() + ttlSeconds * 1000))
  return { token, key }
}

// Reuse of a rotated token is treated as theft: every live refresh session
// of this user (the whole token family) is revoked with one pass.
export async function revokeFamily(userId) {
  const setKey = userSetKey(userId)
  const hashes = await redis.smembers(setKey)
  const multi = redis.multi()
  for (const hash of hashes) multi.del(`session:${hash}`)
  multi.del(setKey)
  await multi.exec()
}

// Cheap lazy prune: drop recorded session hashes whose key already expired.
// Only runs when the user's session set grows past the threshold, and only
// on login/signup/rotation paths (mirrors the DB "prune expired tokens" job).
async function pruneUserSet(userId, threshold = 20) {
  const setKey = userSetKey(userId)
  const size = await redis.scard(setKey)
  if (size < threshold) return
  const hashes = await redis.smembers(setKey)
  const alive = await redis.pipeline(hashes.map((h) => ['exists', `session:${h}`])).exec()
  const dead = hashes.filter((_, i) => (alive[i] ? Number(alive[i][1] || 0) : 1) === 0)
  if (dead.length) await redis.srem(setKey, ...dead)
}