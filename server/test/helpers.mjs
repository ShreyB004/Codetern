// Integration-test harness for the Codetern API.
//
// boots an isolated app instance (child_process running src/index.js) and
// exposes an api() client that mirrors scripts/smoke.mjs's req().
//
//   - Port: PREFERRED_PORT (4010) when free, otherwise an ephemeral free port.
//     node --test runs test files concurrently, and test/auth.test.mjs also
//     boots on 4010 — the probe below keeps this suite safe in both modes.
//   - Boot gate: GET /health until { ok: true } (db + redis pinged).
//   - Redis: the app connects to the same Redis (db 0 — src/db/redis.js does
//     not read a URL path), so rate-limit counters are shared with the dev
//     server. This suite stays well under the per-route caps (see README).
//   - Zero new dependencies: node:test + node:net + node:child_process + fetch.
import { spawn } from 'node:child_process'
import { setTimeout as sleep } from 'node:timers/promises'
import net from 'node:net'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
export const PREFERRED_PORT = 4010
export const BOOT_TIMEOUT_MS = 20_000

// Visible in TAP output (writes to stderr, which node --test surfaces).
export function note(msg) {
  process.stderr.write(`# NOTE ${msg}\n`)
}

function isPortInUse(port) {
  return new Promise((resolve) => {
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
}

function freePort() {
  return new Promise((resolve, reject) => {
    const srv = net.createServer()
    srv.once('error', reject)
    srv.listen(0, '127.0.0.1', () => {
      const { port } = srv.address()
      srv.close(() => resolve(port))
    })
  })
}

async function pickPort() {
  if (!(await isPortInUse(PREFERRED_PORT))) return PREFERRED_PORT
  const port = await freePort()
  note(`port ${PREFERRED_PORT} in use (another suite or dev server) — booting on ${port}`)
  return port
}

async function waitForHealth(port) {
  const deadline = Date.now() + BOOT_TIMEOUT_MS
  let lastErr = ''
  while (Date.now() < deadline) {
    try {
      const res = await fetch(`http://127.0.0.1:${port}/health`)
      const body = await res.json().catch(() => null)
      if (res.status === 200 && body?.ok === true) return true
      lastErr = `health responded ${res.status}: ${JSON.stringify(body)}`
    } catch (err) {
      lastErr = err.message
    }
    await sleep(250)
  }
  throw new Error(`server on :${port} did not become healthy within ${BOOT_TIMEOUT_MS}ms — ${lastErr}`)
}

export async function bootServer(extraEnv = {}) {
  const port = await pickPort()
  const child = spawn(process.execPath, ['src/index.js'], {
    cwd: ROOT,
    env: { ...process.env, PORT: String(port), ...extraEnv },
    stdio: ['ignore', 'pipe', 'pipe'],
  })

  let stderrTail = ''
  child.stderr.on('data', (d) => {
    stderrTail = (stderrTail + String(d)).slice(-2000)
  })

  try {
    await waitForHealth(port)
  } catch (err) {
    if (child.exitCode === null) child.kill('SIGTERM')
    await Promise.race([new Promise((r) => child.once('exit', r)), sleep(3000)])
    if (port === PREFERRED_PORT) {
      // Preferred port lost a race (parallel suites) — retry on an ephemeral port once.
      note('boot on 4010 failed — retrying on an ephemeral port')
      return bootServer(extraEnv)
    }
    throw new Error(`${err.message}\n--- child stderr tail ---\n${stderrTail || '(empty)'}`)
  }

  return {
    port,
    base: `http://127.0.0.1:${port}/api`,
    child,
    async stop() {
      if (child.exitCode === null) {
        child.kill('SIGTERM')
        await Promise.race([new Promise((r) => child.once('exit', r)), sleep(3000)])
      }
    },
  }
}

// api() — mirrors scripts/smoke.mjs's req(): fetch wrapper with token/cookie
// support and cookie capture. Returns { status, json, setCookie, cookies, text }.
//
// 429 resilience: @fastify/rate-limit counters are keyed per IP in the shared
// Redis (db 0), so the dev server on :4000 and other test suites drain the
// same per-route budgets (e.g. /auth/login max 10/min). A request that hits
// 429 waits one full window (65s > 60s) and retries once, then surfaces the
// 429 as-is. The window almost certainly rolled during that wait, so the
// suite never needs the fixed 65s pre-roll that auth.test.mjs uses.
export const RATE_WINDOW_WAIT_MS = 65_000

export function makeApi(base) {
  const client = async (method, pathname, opts) => {
    const res = await rawFetch(`${base}${pathname}`, opts)
    if (res.status === 429) {
      note(`rate limit hit on ${method} ${pathname} (shared Redis counters) — waiting one window and retrying`)
      await sleep(RATE_WINDOW_WAIT_MS)
      return rawFetch(`${base}${pathname}`, opts)
    }
    return res
  }

  return async function api(method, pathname, { body, token, cookie, raw, headers = {} } = {}) {
    const opts = { method, headers: { ...headers } }
    if (token) opts.headers.Authorization = `Bearer ${token}`
    if (cookie) opts.headers.Cookie = cookie
    if (body !== undefined) {
      opts.headers['Content-Type'] = 'application/json'
      opts.body = JSON.stringify(body)
    } else if (raw !== undefined) {
      opts.body = raw
    }
    const res = await client(method, pathname, opts)
    const setCookies = typeof res.headers.getSetCookie === 'function' ? res.headers.getSetCookie() : []
    const cookies = []
    for (const sc of setCookies) {
      const m = /ct_refresh=([^;]+)/.exec(sc)
      if (m) cookies.push(m[1])
    }
    const text = await res.text()
    let json = null
    try {
      json = text ? JSON.parse(text) : null
    } catch {
      /* not json */
    }
    return { status: res.status, json, setCookie: setCookies.join('; '), cookies, text }
  }
}

async function rawFetch(url, opts) {
  return fetch(url, opts)
}

export const cookieHeader = (cookies) => cookies.map((c) => `ct_refresh=${c}`).join('; ')