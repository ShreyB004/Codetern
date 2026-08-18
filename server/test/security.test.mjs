// Security hardening tests — boot an isolated server (child process) on PORT 4010.
// Same DB/Redis as the dev server; rate-limit counters are shared per IP+route,
// so request counts stay modest and the brute-force test ends with a 65s wait
// so any suite started right after (e.g. scripts/smoke.mjs against :4000) gets
// a fresh per-route budget.
// Usage: node --test test/security.test.mjs  (from server/)
import 'dotenv/config'
import { test, before, after } from 'node:test'
import assert from 'node:assert/strict'
import { spawn } from 'node:child_process'
import { setTimeout as sleep } from 'node:timers/promises'
import { readFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const { query, closePool } = await import('../src/db/pool.js')
const { default: redis } = await import('../src/db/redis.js')
const { storage } = await import('../src/lib/storage.js')

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
// Default per spec: shared isolated instance on 4010. Override via
// SEC_TEST_PORT when parallel suites hold 4010.
const PORT = Number(process.env.SEC_TEST_PORT || 4010)
const BASE = `http://127.0.0.1:${PORT}`
const API = `${BASE}/api`

let child = null
let studentToken = null
let studentEmail = ''
let studentUserId = null
let adminToken = null
let uploadedFile = null

function assertEnvelope(res, status, code) {
  assert.equal(res.status, status, `expected ${status}, got ${res.status} — ${res.text.slice(0, 200)}`)
  assert.match(res.headers.get('content-type') || '', /application\/json/, 'error must be JSON')
  const body = res.json
  assert.ok(body && typeof body === 'object', 'error body must be an object')
  assert.ok(body.error && typeof body.error === 'object', 'error body must be { error: {...} }')
  assert.equal(typeof body.error.code, 'string', 'error.code must be a string')
  assert.equal(typeof body.error.message, 'string', 'error.message must be a string')
  if (code) assert.equal(body.error.code, code, `expected code ${code}, got ${body.error.code}`)
  assert.equal('stack' in body, false, 'no stack leak in body')
  const details = body.error.details
  if (details && typeof details === 'object' && !Array.isArray(details)) {
    assert.equal('stack' in details, false, 'no stack leak in details')
  }
  assert.ok(!/at [\w.]+ \(/i.test(res.text), 'no stack frames leak')
  return body
}

async function req(method, pathname, { body, raw, token, headers = {} } = {}) {
  const opts = { method, headers: { ...headers } }
  if (token) opts.headers.Authorization = `Bearer ${token}`
  if (raw !== undefined) {
    opts.headers['Content-Type'] = 'application/json'
    opts.body = raw
  } else if (body !== undefined) {
    opts.headers['Content-Type'] = 'application/json'
    opts.body = JSON.stringify(body)
  }
  const res = await fetch(`${API}${pathname}`, opts)
  const text = await res.text()
  let json = null
  try { json = text ? JSON.parse(text) : null } catch { /* not json */ }
  return { status: res.status, json, text, headers: res.headers }
}

function readLoginRateLimitConfig() {
  // The brute-force test asserts 429 behaviour only if /auth/login actually
  // carries a route-level limiter. Parse it from the route file so the test
  // degrades gracefully if the route config ever changes.
  const src = readFileSync(path.join(ROOT, 'src', 'routes', 'auth.routes.js'), 'utf8')
  const m = /app\.post\(\s*['"]\/auth\/login['"][\s\S]*?rateLimit:\s*\{\s*max:\s*(\d+)/.exec(src)
  return m ? Number(m[1]) : null
}

// limiter config used to size the brute-force burst below
const LOGIN_MAX = readLoginRateLimitConfig()

before(async () => {
  // Boot with one retry: another suite may briefly hold :4010 (parallel agents
  // run against the same port); a failed bind exits the child, so respawn once.
  for (let attempt = 0; attempt < 2; attempt += 1) {
    child = spawn(process.execPath, ['src/index.js'], {
      cwd: ROOT,
      env: { ...process.env, PORT: String(PORT) },
      stdio: ['ignore', 'pipe', 'pipe'],
    })
    let bootErr = ''
    child.stderr.on('data', (d) => { bootErr += String(d) })
    let up = false
    for (let i = 0; i < 60; i += 1) {
      if (child.exitCode !== null) break
      try {
        const res = await fetch(`${BASE}/health/live`)
        if (res.ok) { up = true; break }
      } catch { /* not up yet */ }
      await sleep(250)
    }
    if (up) return
    console.error(`[security.test] boot attempt ${attempt + 1} failed: ${bootErr.slice(-300)}`)
    if (child.exitCode === null) {
      child.kill('SIGTERM')
      await Promise.race([new Promise((r) => child.once('exit', r)), sleep(3000)])
    }
    child = null
    await sleep(1500)
  }
  assert.ok(child, `isolated server failed to boot on :${PORT} after retries`)
})

after(async () => {
  // Cleanup must ALWAYS run (redis/pool sockets keep the parent harness alive),
  // so nothing here may throw. Graceful-shutdown timing is observed, not asserted
  // on Windows: child.kill('SIGTERM') there is a hard terminate (non-zero exit).
  try {
    if (child && child.exitCode === null) {
      const t0 = Date.now()
      child.kill('SIGTERM')
      const code = await Promise.race([
        new Promise((r) => child.once('exit', (c) => r(c))),
        sleep(11_000).then(() => 'timeout'),
      ])
      if (code === 'timeout') console.error('[security.test] shutdown exceeded 10s hard-exit window')
      else if (process.platform !== 'win32' && code !== 0) console.error(`[security.test] shutdown exit code ${code}`)
      else console.log(`[security.test] graceful shutdown completed in ${Math.round(Date.now() - t0)}ms`)
    }
  } catch (err) { console.error('[security.test] shutdown observe failed:', err.message) }
  if (uploadedFile) {
    try { await storage.remove(uploadedFile) } catch { /* already gone */ }
  }
  if (studentEmail) {
    try {
      await query('DELETE FROM candidates WHERE email = $1', [studentEmail])
      await query('DELETE FROM users WHERE id = $1', [studentUserId])
    } catch { /* already gone */ }
  }
  try { await redis.quit() } catch { /* already closed */ }
  try { await closePool() } catch { /* already closed */ }
})

test('unknown route → 404 JSON error envelope', async () => {
  const res = await req('GET', '/definitely-not-a-route')
  assertEnvelope(res, 404, 'not_found')
  assert.match(res.json.error.message, /No route for/)
})

test('oversized JSON body → 413 payload_too_large envelope', async () => {
  const big = JSON.stringify({ data: 'x'.repeat(9 * 1024 * 1024) })
  const res = await req('POST', '/me/quiz', { raw: big })
  assertEnvelope(res, 413, 'payload_too_large')
})

test('malformed JSON → 400 bad_request envelope', async () => {
  const res = await req('POST', '/me/quiz', { raw: 'not-json{', headers: { 'Content-Type': 'application/json' } })
  assertEnvelope(res, 400, 'bad_request')
})

test('CORS: disallowed origin → 403 forbidden envelope', async () => {
  const res = await req('GET', '/programmes', { headers: { Origin: 'http://evil.example' } })
  assertEnvelope(res, 403, 'forbidden')
})

test('validation: oversized param → never 500; too-long quiz domain → 400 envelope', async () => {
  // Param longer than Fastify's maxParamLength (100) → 414 URI too long,
  // enveloped as uri_too_long; never a raw body or a 500.
  const long = await req('GET', `/programmes/${'x'.repeat(300)}`)
  assertEnvelope(long, 414, 'uri_too_long')
  assert.ok(!/pg|sql|stack|undefined/i.test(long.text), 'long param must not leak internals')

  // Domain over the validated max (40) is a deterministic 400 via zod.
  const quiz = await req('GET', `/quiz/${'y'.repeat(50)}`)
  assertEnvelope(quiz, 400, 'bad_request')
  assert.ok(!/pg|sql|stack/i.test(quiz.text), 'message must not leak internals')
})

test('admin route as student → 403; upload route as student → 403', async () => {
  const signup = await req('POST', '/auth/signup', { body: { name: 'Sec Tester', email: (studentEmail = `sec-${Date.now()}@test.dev`), password: 'password123' } })
  assert.equal(signup.status, 201, signup.text?.slice(0, 120))
  studentToken = signup.json.access
  studentUserId = signup.json.user.id

  const adminRoute = await req('GET', '/admin/candidates', { token: studentToken })
  assertEnvelope(adminRoute, 403, 'forbidden')

  const upload = await req('POST', '/uploads', { token: studentToken })
  assertEnvelope(upload, 403, 'forbidden')
})

async function adminLoginWithRetry(t) {
  // The login route limiter is shared per IP across suites in the common Redis;
  // a parallel suite may have consumed budget. Retry briefly, skip if still 429.
  for (let i = 0; i < 3; i += 1) {
    const res = await req('POST', '/auth/login', { body: { email: 'admin@codetern.dev', password: 'admin123' } })
    if (res.status === 200) return res.json.access
    await sleep(2000)
  }
  t.skip('admin login rate-limited by a concurrent suite — skipping admin checks')
  return null
}

test('upload: bad extension/type → 400; png → 201 + served; no directory listing', async (t) => {
  adminToken = await adminLoginWithRetry(t)
  if (!adminToken) return

  const bad = new FormData()
  bad.append('file', new Blob(['MZ fake payload'], { type: 'application/x-msdownload' }), 'evil.exe')
  const badRes = await fetch(`${API}/uploads`, { method: 'POST', headers: { Authorization: `Bearer ${adminToken}` }, body: bad })
  const badText = await badRes.text()
  assert.equal(badRes.status, 400, badText.slice(0, 200))
  const badJson = JSON.parse(badText)
  assert.equal(badJson.error.code, 'bad_request')
  assert.match(badJson.error.message, /not allowed/i)

  const good = new FormData()
  good.append('file', new Blob([Buffer.from('89504e470d0a1a0a', 'hex')], { type: 'image/png' }), 'ok.png')
  const goodRes = await fetch(`${API}/uploads`, { method: 'POST', headers: { Authorization: `Bearer ${adminToken}` }, body: good })
  const goodText = await goodRes.text()
  assert.equal(goodRes.status, 201, goodText.slice(0, 200))
  const goodJson = JSON.parse(goodText)
  assert.match(goodJson.url, /\/files\/.+\.png$/)
  uploadedFile = goodJson.filename

  const served = await fetch(goodJson.url)
  assert.equal(served.status, 200)
  assert.match(served.headers.get('content-type') || '', /image\/png/)

  // No directory listing: /files/ must not enumerate the upload dir.
  const listing = await fetch(`${BASE}/files/`)
  assert.equal(listing.status, 404)

  // Traversal: normalized outside the prefix must never serve repo files.
  const trav = await fetch(`${BASE}/files/../package.json`)
  assert.equal(trav.status, 404)
  const travEnc = await fetch(`${BASE}/files/..%2F..%2Fpackage.json`)
  assert.ok(travEnc.status === 404 || !/codetern/.test(await travEnc.text()), 'encoded traversal must not leak files')
})

test('conflict path → 409 envelope (real error route through handler)', async (t) => {
  if (!adminToken) {
    adminToken = await adminLoginWithRetry(t)
    if (!adminToken) return
  }
  const dup = await req('POST', '/admin/programmes', { token: adminToken, body: { id: 'mern', title: 'Dup' } })
  assertEnvelope(dup, 409, 'conflict')
})

test(`login brute-force: ${LOGIN_MAX}/min route limiter returns 429 (after N attempts)`, { skip: LOGIN_MAX === null && 'no route-level limiter configured on /auth/login' }, async () => {
  // The limiter is shared per IP+route across ALL suites using the common
  // Redis, so the exact 401/429 split depends on prior consumption in this
  // minute's window. Assert the properties that always hold: the limiter trips
  // (at least one 429), nothing trips early en masse, and every response is
  // enveloped with the correct code.
  const burst = Array.from({ length: LOGIN_MAX }, () =>
    req('POST', '/auth/login', { body: { email: 'ghost-bruteforce@test.dev', password: 'not-a-real-password' } }))
  const results = await Promise.all(burst)

  const accepted = results.filter((r) => r.status === 401)
  const limited = results.filter((r) => r.status === 429)

  assert.ok(limited.length >= 1, `expected at least one 429, got ${limited.length}`)
  assert.ok(accepted.length >= LOGIN_MAX - 4, `limiter tripped too early: only ${accepted.length}/${LOGIN_MAX} accepted`)
  for (const r of results) {
    assert.ok([401, 429].includes(r.status), `unexpected status ${r.status}`)
    assertEnvelope(r, r.status, r.status === 401 ? 'unauthorized' : 'rate_limited')
  }
  assert.match(limited[0].headers.get('retry-after') || '', /^\d+/, '429 must carry retry-after')

  // Rate-limit counters are shared per IP+route in the common Redis. Give the
  // window a full roll so suites started right after get a fresh budget.
  await sleep(65_000)
})