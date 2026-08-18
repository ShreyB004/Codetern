// Auth hardening tests — boot an isolated server (child process) on PORT 4010.
// Same Postgres and Redis as the dev server. Rate-limit counters are shared
// per IP+route across processes (the plugin and the app's Redis client), so
// this suite keeps auth traffic modest and starts with a 65s pre-roll sleep —
// guaranteed fresh 60s rate windows for any surrounding smoke/test runs.
// Usage: node --test test/auth.test.mjs  (from server/)
import 'dotenv/config'
import { test, before, after } from 'node:test'
import assert from 'node:assert/strict'
import { spawn } from 'node:child_process'
import { setTimeout as sleep } from 'node:timers/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import Redis from 'ioredis'

const { query, closePool } = await import('../src/db/pool.js')
const { verifyRefreshToken, hashSession } = await import('../src/lib/jwt.js')

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const BASE = 'http://127.0.0.1:4010/api'
const PORT = 4010

let child = null
let testRedis = null

const created = { emails: [], userIds: new Set(), cookies: [] }

function makeEmail(prefix) {
  const e = `auth-test-${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}@test.dev`
  created.emails.push(e)
  return e
}

async function req(method, pathname, { body, token, cookie, headers = {} } = {}) {
  const opts = { method, headers: { ...headers } }
  if (token) opts.headers.Authorization = `Bearer ${token}`
  if (cookie) opts.headers.Cookie = cookie
  if (body !== undefined) {
    opts.headers['Content-Type'] = 'application/json'
    opts.body = JSON.stringify(body)
  }
  const res = await fetch(`${BASE}${pathname}`, opts)
  const setCookies = typeof res.headers.getSetCookie === 'function' ? res.headers.getSetCookie() : []
  const cookies = []
  for (const sc of setCookies) {
    const m = /ct_refresh=([^;]+)/.exec(sc)
    if (m) {
      cookies.push(m[1])
      created.cookies.push(m[1])
    }
  }
  const text = await res.text()
  let json = null
  try { json = text ? JSON.parse(text) : null } catch { /* not json */ }
  return { status: res.status, json, cookies, text }
}

const cookieHeader = (cookies) => cookies.map((c) => `ct_refresh=${c}`).join('; ')

const mainPassword = 'password123'
let mainEmail = ''
let mainAccess = ''
let mainCookie = ''

before(async () => {
  mainEmail = makeEmail('main')
  child = spawn(process.execPath, ['src/index.js'], {
    cwd: ROOT,
    env: { ...process.env, PORT: String(PORT) },
    stdio: ['ignore', 'pipe', 'pipe'],
  })
  let bootErr = ''
  child.stderr.on('data', (d) => {
    bootErr += String(d)
  })
  let up = false
  for (let i = 0; i < 60; i += 1) {
    if (child.exitCode !== null) break
    try {
      const res = await fetch(`http://127.0.0.1:${PORT}/health/live`)
      if (res.ok) {
        up = true
        break
      }
    } catch { /* not up yet */ }
    await sleep(250)
  }
  assert.ok(up, `isolated server failed to boot on :${PORT} — ${bootErr.slice(-400)}`)
  testRedis = new Redis({ host: '127.0.0.1', port: 6379 })
  // Rate-limit windows: counters are shared per IP+route across processes, so
  // a suite run right after another suite/smoke run could inherit a nearly
  // full budget. Wait for any prior window to roll before issuing auth calls.
  await sleep(65_000)
})

after(async () => {
  for (const c of created.cookies) {
    try {
      const { userId, sessionId } = await verifyRefreshToken(c)
      created.userIds.add(userId)
      await testRedis.del(`session:${hashSession(sessionId)}`)
    } catch { /* expired/invalid cookie — nothing to clean */ }
  }
  for (const id of created.userIds) {
    await testRedis.del(`sessions:${id}`)
  }
  if (created.emails.length) {
    await query('DELETE FROM candidates WHERE email = ANY($1::text[])', [created.emails]).catch(() => {})
    await query('DELETE FROM users WHERE email = ANY($1::text[])', [created.emails]).catch(() => {})
  }
  if (child && child.exitCode === null) {
    child.kill('SIGTERM')
    await Promise.race([new Promise((r) => child.once('exit', r)), sleep(3000)])
  }
  try { await testRedis.quit() } catch { /* already closed */ }
  try { await closePool() } catch { /* already closed */ }
})

// ── tests ────────────────────────────────────────────────────────────────

test('signup validation failures → 400 (weak password, no digit, no letter, bad email)', async () => {
  const weak = await req('POST', '/auth/signup', { body: { name: 'Auth Tester', email: makeEmail('weak'), password: 'abc' } })
  assert.equal(weak.status, 400)
  assert.equal(weak.json.error.code, 'bad_request')

  const noDigit = await req('POST', '/auth/signup', { body: { name: 'Auth Tester', email: makeEmail('nodigit'), password: 'onlyletters' } })
  assert.equal(noDigit.status, 400)
  assert.match(noDigit.json.error.message, /number/i)

  const noLetter = await req('POST', '/auth/signup', { body: { name: 'Auth Tester', email: makeEmail('noletter'), password: '12345678' } })
  assert.equal(noLetter.status, 400)
  assert.match(noLetter.json.error.message, /letter/i)

  const badEmail = await req('POST', '/auth/signup', { body: { name: 'Auth Tester', email: 'not-an-email', password: 'password123' } })
  assert.equal(badEmail.status, 400)
  assert.equal(badEmail.json.error.code, 'bad_request')
})

test('signup ok → 201 with access + refresh cookie; duplicate email → 409', async () => {
  const signup = await req('POST', '/auth/signup', { body: { name: 'Auth Tester', email: mainEmail, password: mainPassword } })
  assert.equal(signup.status, 201)
  assert.ok(signup.json.access)
  assert.ok(signup.cookies[0])
  assert.equal(signup.json.user.role, 'student')
  created.userIds.add(signup.json.user.id)
  mainAccess = signup.json.access
  mainCookie = signup.cookies[0]

  const dup = await req('POST', '/auth/signup', { body: { name: 'Auth Tester', email: mainEmail, password: mainPassword } })
  assert.equal(dup.status, 409)
  assert.equal(dup.json.error.code, 'conflict')
})

test('login ok; wrong password and unknown email → 401 with identical message', async () => {
  const ok = await req('POST', '/auth/login', { body: { email: mainEmail, password: mainPassword } })
  assert.equal(ok.status, 200)
  assert.ok(ok.json.access)
  assert.equal(ok.json.user.email, mainEmail)

  const wrong = await req('POST', '/auth/login', { body: { email: mainEmail, password: 'definitely-wrong' } })
  assert.equal(wrong.status, 401)
  assert.equal(wrong.json.error.code, 'unauthorized')

  const unknown = await req('POST', '/auth/login', { body: { email: makeEmail('ghost'), password: 'whatever1' } })
  assert.equal(unknown.status, 401)
  assert.equal(unknown.json.error.code, 'unauthorized')
  assert.equal(unknown.json.error.message, wrong.json.error.message)
})

test('guards: /auth/me without token → 401; admin-only route as student → 403', async () => {
  const me = await req('GET', '/auth/me')
  assert.equal(me.status, 401)
  const meBad = await req('GET', '/auth/me', { token: 'not-a-real-token' })
  assert.equal(meBad.status, 401)

  const adminOnly = await req('GET', '/admin/candidates', { token: mainAccess })
  assert.equal(adminOnly.status, 403)
  assert.equal(adminOnly.json.error.code, 'forbidden')

  const adminLogin = await req('POST', '/auth/login', { body: { email: 'admin@codetern.dev', password: 'admin123' } })
  assert.equal(adminLogin.status, 200)
  created.userIds.add(adminLogin.json.user.id)
  const ok = await req('GET', '/admin/candidates', { token: adminLogin.json.access })
  assert.equal(ok.status, 200)
})

test('refresh rotation: replayed old cookie → family revoked; fresh logins still work', async () => {
  // second live session for the same user (cookie B)
  const loginB = await req('POST', '/auth/login', { body: { email: mainEmail, password: mainPassword } })
  assert.equal(loginB.status, 200)
  const cookieB = loginB.cookies[0]

  // rotate A → C
  const rot = await req('POST', '/auth/refresh', { cookie: cookieHeader([mainCookie]) })
  assert.equal(rot.status, 200)
  assert.ok(rot.json.access)
  const cookieC = rot.cookies[0]
  assert.notEqual(cookieC, mainCookie)

  // replay of the already-rotated A → reuse detected → 401
  const reuse = await req('POST', '/auth/refresh', { cookie: cookieHeader([mainCookie]) })
  assert.equal(reuse.status, 401)
  assert.equal(reuse.json.error.code, 'unauthorized')

  // family revocation: the other live session (B) and the just-issued (C) are dead
  const famB = await req('POST', '/auth/refresh', { cookie: cookieHeader([cookieB]) })
  assert.equal(famB.status, 401)
  const famC = await req('POST', '/auth/refresh', { cookie: cookieHeader([cookieC]) })
  assert.equal(famC.status, 401)

  // fresh logins are still allowed after family revocation
  const relogin = await req('POST', '/auth/login', { body: { email: mainEmail, password: mainPassword } })
  assert.equal(relogin.status, 200)
  const reloginRefresh = await req('POST', '/auth/refresh', { cookie: cookieHeader(relogin.cookies) })
  assert.equal(reloginRefresh.status, 200)
  assert.ok(reloginRefresh.json.access)
})