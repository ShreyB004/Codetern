// Payments hardening tests — boot an isolated server on PORT 4010 (same
// DB/Redis as the dev server; dev server stays untouched on 4000).
// Covers: order create, verify settle, webhook bad signature, idempotent
// double delivery, replay guard, refunds (window + idempotent + too late),
// expiry sweeper, and admin reconcile.
// Usage: node --test test/payments.test.mjs  (from server/)
import 'dotenv/config'
import { test, before, after } from 'node:test'
import assert from 'node:assert/strict'
import { spawn } from 'node:child_process'
import { setTimeout as sleep } from 'node:timers/promises'
import net from 'node:net'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const { query, closePool } = await import('../src/db/pool.js')
const { default: redis } = await import('../src/db/redis.js')
const { payments } = await import('../src/lib/payments.js')
const { sweepExpiredOrders, seatQueue, emailQueue, seatWorker, emailWorker } = await import('../src/queues.js')

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const BASE = 'http://127.0.0.1:4010/api'
const PORT = 4010

let child = null
let adminToken = ''
let tokenA = ''
let tokenB = ''
const created = { programmes: [], emails: [] }
const state = {} // shared across tests: state.o1..o6 = { id, domain }

function rand() {
  return `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 7)}`
}
const makeEmail = (p) => {
  const e = `pay-test-${p}-${rand()}@test.dev`
  created.emails.push(e)
  return e
}

// fetch with 429 resilience: rate-limit counters are per IP+route in the
// shared Redis, so concurrent suites/dev server drain the same budgets. One
// full-window retry, then surface the 429 (same policy as test/helpers.mjs).
async function client(method, pathname, opts) {
  const res = await fetch(`${BASE}${pathname}`, opts)
  if (res.status === 429) {
    await sleep(65_000)
    return fetch(`${BASE}${pathname}`, opts)
  }
  return res
}

async function req(method, pathname, { body, token, raw, headers = {} } = {}) {
  const opts = { method, headers: { ...headers } }
  if (token) opts.headers.Authorization = `Bearer ${token}`
  if (raw !== undefined) opts.body = raw
  else if (body !== undefined) {
    opts.headers['Content-Type'] = 'application/json'
    opts.body = JSON.stringify(body)
  }
  const res = await client(method, pathname, opts)
  const text = await res.text()
  let json = null
  try { json = text ? JSON.parse(text) : null } catch { /* not json */ }
  return { status: res.status, json, text }
}

const createProgramme = async (label) => {
  const id = `pay-${label}-${rand()}`
  const res = await req('POST', '/admin/programmes', { token: adminToken, body: { id, title: `Pay ${label}`, durations: [1] } })
  assert.equal(res.status, 200, `create programme: ${res.text}`)
  created.programmes.push(id)
  return id
}

const createOrder = async (domain) => {
  const res = await req('POST', '/booking/order', { token: tokenA, body: { domain, duration: 1 } })
  assert.equal(res.status, 201, `order create: ${res.text}`)
  return res.json.order
}

const settleViaVerify = async (orderId) => {
  const paymentId = `pay_v_${rand()}`
  const signature = payments.mockVerifySignature(orderId, paymentId)
  return req('POST', `/booking/${orderId}/verify`, {
    token: tokenA,
    body: { razorpay_payment_id: paymentId, razorpay_signature: signature },
  })
}

const getSeat = async (domain) => {
  const res = await req('GET', '/seats')
  assert.equal(res.status, 200)
  return res.json.seats?.[domain]?.[1]
}

const getOrder = async (orderId) => {
  const res = await req('GET', `/booking/order/${orderId}`, { token: tokenA })
  assert.equal(res.status, 200, `get order: ${res.text}`)
  return res.json.order
}

const webhook = async (orderId, opts = {}) => {
  const mock = payments.mockPayment({ orderId, amountPaise: 14900, ...opts })
  const res = await req('POST', '/booking/webhook', {
    raw: mock.rawBody,
    headers: {
      'Content-Type': 'application/json', // raw bodies need the JSON content type
      'x-razorpay-signature': opts.bogusSignature === true ? 'bogus' : mock.signature,
    },
  })
  return { res, body: mock.body, paymentId: mock.body.payload.payment.entity.id }
}

const isPortInUse = (port) =>
  new Promise((resolve) => {
    const socket = net.connect({ host: '127.0.0.1', port }, () => {
      socket.destroy()
      resolve(true)
    })
    socket.on('error', () => resolve(false))
    socket.setTimeout(800, () => {
      socket.destroy()
      resolve(true)
    })
  })

before(async () => {
  // 4010 is the shared test port (other suites prefer it too). Wait until it
  // is free so we own the instance we assert against — never proxy through a
  // foreign server.
  for (let i = 0; i < 60 && (await isPortInUse(PORT)); i += 1) await sleep(2000)
  assert.ok(!(await isPortInUse(PORT)), `port ${PORT} still busy after 120s — another test suite is running`)

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
      const res = await fetch(`http://127.0.0.1:${PORT}/health/live`)
      if (res.ok) { up = true; break }
    } catch { /* not up yet */ }
    await sleep(250)
  }
  assert.ok(up, `isolated server failed to boot on :${PORT} — ${bootErr.slice(-400)}`)
  await sleep(1500)
  assert.equal(child.exitCode, null, `child died after boot — ${bootErr.slice(-400)}`)

  // Shared Redis rate-limit counters (per IP+route): let the window roll so
  // a just-finished smoke/auth run can't throttle our signups/logins.
  await sleep(15_000)

  const adminLogin = await req('POST', '/auth/login', { body: { email: 'admin@codetern.dev', password: 'admin123' } })
  assert.equal(adminLogin.status, 200, `admin login: ${adminLogin.text}`)
  adminToken = adminLogin.json.access

  const signupA = await req('POST', '/auth/signup', { body: { name: 'Pay Tester A', email: makeEmail('a'), password: 'password123' } })
  assert.equal(signupA.status, 201, `signup A: ${signupA.text}`)
  tokenA = signupA.json.access

  const signupB = await req('POST', '/auth/signup', { body: { name: 'Pay Tester B', email: makeEmail('b'), password: 'password123' } })
  assert.equal(signupB.status, 201, `signup B: ${signupB.text}`)
  tokenB = signupB.json.access
})

after(async () => {
  if (child && child.exitCode === null) {
    child.kill('SIGTERM')
    await Promise.race([new Promise((r) => child.once('exit', r)), sleep(3000)])
  }
  for (const w of [seatWorker, emailWorker]) {
    try { await w.close() } catch { /* already closed */ }
  }
  for (const q of [seatQueue, emailQueue]) {
    try { await q.close() } catch { /* already closed */ }
  }
  if (created.emails.length) {
    await query('DELETE FROM candidates WHERE email = ANY($1::text[])', [created.emails]).catch(() => {})
    await query('DELETE FROM users WHERE email = ANY($1::text[])', [created.emails]).catch(() => {})
  }
  if (created.programmes.length) {
    await query('DELETE FROM programmes WHERE id = ANY($1::text[])', [created.programmes]).catch(() => {})
  }
  try { await redis.quit() } catch { /* already closed */ }
  try { await closePool() } catch { /* already closed */ }
})

// ── tests ──────────────────────────────────────────────────────────────
test('order create (mock) + poll endpoint', async () => {
  const domain = await createProgramme('A')
  const order = await createOrder(domain)
  state.o1 = { id: order.id, domain }
  assert.match(order.id, /^ord_/)
  assert.equal(order.amountPaise, 14900, '1-month price is ₹149 → 14900 paise')

  const poll = await getOrder(order.id)
  assert.equal(poll.status, 'created')
  assert.equal(poll.amountPaise, 14900)

  const noAuth = await req('GET', `/booking/order/${order.id}`)
  assert.equal(noAuth.status, 401, 'poll requires auth')
  const foreign = await req('GET', `/booking/order/${order.id}`, { token: tokenB })
  assert.equal(foreign.status, 401, 'cannot poll another user\'s order')

  const seat = await getSeat(domain)
  assert.equal(seat.sold, 0)
  assert.equal(seat.held, 1, 'hold reserved before payment')
})

test('verify flow settles instantly (same behaviour as webhook)', async () => {
  const res = await settleViaVerify(state.o1.id)
  assert.equal(res.status, 200, `verify: ${res.text}`)
  assert.equal(res.json.order.status, 'paid')
  assert.equal(res.json.order.paymentId, res.json.order.paymentId)

  const order = await getOrder(state.o1.id)
  assert.equal(order.status, 'paid')

  const me = await req('GET', '/me', { token: tokenA })
  assert.equal(me.json.candidate.payment?.status, 'paid')

  const seat = await getSeat(state.o1.domain)
  assert.equal(seat.sold, 1, 'seat settled by verify')
  assert.equal(seat.held, 0)

  // Re-verify is graceful for an already-settled order (idempotent UX)
  const again = await settleViaVerify(state.o1.id)
  assert.equal(again.status, 200)
  assert.equal(again.json.order.status, 'paid')
})

test('webhook bad signature → 400; no ledger write', async () => {
  const domain = await createProgramme('A')
  const order = await createOrder(domain)
  state.o2 = { id: order.id, domain }
  const { res, paymentId } = await webhook(state.o2.id, { bogusSignature: true })
  assert.equal(res.status, 400)
  assert.equal(res.json.error.code, 'bad_request')

  const { rows } = await query('SELECT 1 FROM webhook_events WHERE id = $1', [paymentId])
  assert.equal(rows.length, 0, 'invalid delivery never reaches the ledger')
})

test('webhook double delivery: second ack 200, no double seat', async () => {
  const mock = payments.mockPayment({ orderId: state.o2.id, amountPaise: 14900 })
  const paymentId = mock.body.payload.payment.entity.id
  const headers = { 'Content-Type': 'application/json', 'x-razorpay-signature': mock.signature }

  const first = await req('POST', '/booking/webhook', { raw: mock.rawBody, headers })
  assert.equal(first.status, 200, `first delivery: ${first.text}`)

  const second = await req('POST', '/booking/webhook', { raw: mock.rawBody, headers })
  assert.equal(second.status, 200, 'replayed delivery acked 200')

  const order = await getOrder(state.o2.id)
  assert.equal(order.status, 'paid')

  const seat = await getSeat(state.o2.domain)
  assert.equal(seat.sold, 1, 'sold exactly once')
  assert.equal(seat.held, 0)

  const { rows } = await query('SELECT status, attempts FROM webhook_events WHERE id = $1', [paymentId])
  assert.equal(rows.length, 1, 'event ledger has one row')
  assert.equal(rows[0].status, 'PROCESSED')
  assert.ok(rows[0].attempts >= 2, 'attempts track deliveries')
})

test('replay guard: created_at older than 5 min → ack 200, never settled', async () => {
  const domain = await createProgramme('B')
  const order = await createOrder(domain)
  state.o3 = { id: order.id, domain }
  const tenMinutesAgo = Math.floor(Date.now() / 1000) - 600

  const { res, paymentId } = await webhook(state.o3.id, { createdAt: tenMinutesAgo })
  assert.equal(res.status, 200, 'stale event still acked')
  assert.equal(res.json.dropped, true)

  const after = await getOrder(state.o3.id)
  assert.equal(after.status, 'created', 'stale event must not settle')

  const { rows } = await query('SELECT 1 FROM webhook_events WHERE id = $1', [paymentId])
  assert.equal(rows.length, 0, 'replayed event not persisted')

  const seat = await getSeat(domain)
  assert.equal(seat.sold, 0)
})

test('refund within 7 days → REFUNDED; idempotent; owner-only', async () => {
  const domain = await createProgramme('C')
  const order = await createOrder(domain)
  state.o4 = { id: order.id, domain }
  const verify = await settleViaVerify(state.o4.id)
  assert.equal(verify.status, 200, `verify: ${verify.text}`)

  const foreign = await req('POST', `/booking/${state.o4.id}/refund`, { token: tokenB })
  assert.equal(foreign.status, 401, 'non-owner cannot refund')
  const anon = await req('POST', `/booking/${state.o4.id}/refund`)
  assert.equal(anon.status, 401, 'refund requires auth')

  const refund = await req('POST', `/booking/${state.o4.id}/refund`, { token: tokenA })
  assert.equal(refund.status, 200, `refund: ${refund.text}`)
  assert.equal(refund.json.order.status, 'refunded')
  assert.equal(refund.json.order.refundAmountPaise, 14900)

  const again = await req('POST', `/booking/${state.o4.id}/refund`, { token: tokenA })
  assert.equal(again.status, 200, 'refunding an already-refunded order returns 200')
  assert.equal(again.json.order.status, 'refunded')

  // Webhook redelivery after refund: ack, no state change.
  const replay = await webhook(state.o4.id)
  assert.equal(replay.res.status, 200)
  const after = await getOrder(state.o4.id)
  assert.equal(after.status, 'refunded', 'post-refund webhook must not resurrect the order')
})

test('refund after 7 days → 400', async () => {
  const domain = await createProgramme('D')
  const order = await createOrder(domain)
  state.o5 = { id: order.id, domain }
  const verify = await settleViaVerify(state.o5.id)
  assert.equal(verify.status, 200, `verify: ${verify.text}`)

  await query(`UPDATE payments SET paid_at = now() - interval '8 days' WHERE order_id = $1`, [state.o5.id])
  const refund = await req('POST', `/booking/${state.o5.id}/refund`, { token: tokenA })
  assert.equal(refund.status, 400)
  assert.match(refund.json.error.message, /7 days/)

  const after = await getOrder(state.o5.id)
  assert.equal(after.status, 'paid', 'rejected refund leaves the order paid')
})

test('expiry sweeper: stale CREATED order → EXPIRED + hold released', async () => {
  const domain = await createProgramme('E')
  const order = await createOrder(domain)
  state.o6 = { id: order.id, domain }
  await query(`UPDATE payments SET created_at = now() - interval '31 minutes' WHERE order_id = $1`, [state.o6.id])

  const expired = await sweepExpiredOrders()
  assert.ok(expired >= 1, `sweep expired at least the backdated order (got ${expired})`)

  const after = await getOrder(state.o6.id)
  assert.equal(after.status, 'expired')

  const seat = await getSeat(domain)
  assert.equal(seat.sold, 0)
  assert.equal(seat.held, 0, 'hold released by the sweeper')
})

test('admin reconcile (mock mode) + admin-only guard', async () => {
  const asStudent = await req('GET', '/admin/reconcile?days=7', { token: tokenA })
  assert.equal(asStudent.status, 403)

  const asAdmin = await req('GET', '/admin/reconcile?days=7', { token: adminToken })
  assert.equal(asAdmin.status, 200, `reconcile: ${asAdmin.text}`)
  assert.equal(asAdmin.json.mode, 'mock')
  assert.equal(asAdmin.json.windowDays, 7)
  assert.ok(asAdmin.json.summary.total >= 5, 'at least our orders are counted')
  assert.ok((asAdmin.json.summary.byStatus.paid || 0) >= 3)
  assert.ok((asAdmin.json.summary.byStatus.refunded || 0) >= 1)
  assert.ok((asAdmin.json.summary.byStatus.expired || 0) >= 1)
  assert.deepEqual(asAdmin.json.mismatches, { paidInRazorpayNotDb: [], inDbNotRazorpay: [] })

  const badDays = await req('GET', '/admin/reconcile?days=999', { token: adminToken })
  assert.equal(badDays.status, 400)
})