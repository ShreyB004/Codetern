import { randomBytes } from 'node:crypto'
import redis from '../db/redis.js'
import { hashSession, refreshTtlSeconds, signRefreshToken } from './jwt.js'

export function newSessionId() {
  return randomBytes(32).toString('hex')
}

export async function saveSession(sessionId, userId, ttlSeconds = refreshTtlSeconds()) {
  const key = `session:${hashSession(sessionId)}`
  await redis.set(key, userId, 'EX', ttlSeconds)
  return key
}

export async function validateSession(sessionId) {
  const key = `session:${hashSession(sessionId)}`
  const userId = await redis.get(key)
  if (!userId) return null
  return { userId, key }
}

export async function destroySession(sessionId) {
  if (!sessionId) return
  const key = `session:${hashSession(sessionId)}`
  await redis.del(key)
}

export async function rotateSession(oldSessionId, userId) {
  const next = newSessionId()
  const key = await saveSession(next, userId)
  const token = await signRefreshToken({ id: userId }, next, new Date(Date.now() + refreshTtlSeconds() * 1000))
  if (oldSessionId) await destroySession(oldSessionId)
  return { token, key }
}