// ── Codetern API client ────────────────────────────────────────────────
// Thin fetch wrapper around the Fastify API. Handles:
//   • base URL from VITE_API_URL (defaults to the Vite proxy '/api')
//   • cookies (credentials: 'include') for the httpOnly refresh token
//   • Bearer access-token injection (persisted in localStorage)
//   • single-flight refresh-on-401 with a queued retry of the original call
//   • JSON error envelope mapping ({error:{code,message,details}} → Error.message)

export const BASE_URL = (import.meta.env.VITE_API_URL || '/api').replace(/\/+$/, '')

const TOKEN_KEY = 'codetern:access:v1'

export class ApiError extends Error {
  constructor(message, { status = 0, code = 'network', details = null } = {}) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.code = code
    this.details = details
  }
}

function readToken() {
  try {
    return localStorage.getItem(TOKEN_KEY) || null
  } catch {
    return null
  }
}

export function clearAccessToken() {
  try {
    localStorage.removeItem(TOKEN_KEY)
  } catch {
    /* storage unavailable */
  }
}

let accessToken = readToken()
let refreshInFlight = null
const authExpiredListeners = new Set()

export function getAccessToken() {
  return accessToken
}

export function setAccessToken(token) {
  accessToken = token || null
  try {
    if (token) localStorage.setItem(TOKEN_KEY, token)
    else localStorage.removeItem(TOKEN_KEY)
  } catch {
    /* storage unavailable */
  }
}

export function onAuthExpired(cb) {
  authExpiredListeners.add(cb)
  return () => authExpiredListeners.delete(cb)
}

function fireAuthExpired() {
  clearAccessToken()
  authExpiredListeners.forEach((cb) => {
    try {
      cb()
    } catch {
      /* listener errors must not break the call chain */
    }
  })
}

// One refresh in flight at a time; every queued 401 waits on the same promise.
function refreshAccessToken() {
  if (!refreshInFlight) {
    refreshInFlight = fetch(`${BASE_URL}/auth/refresh`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
    })
      .then(async (res) => {
        if (!res.ok) {
          throw new ApiError('Session expired. Sign in again.', { status: res.status, code: 'unauthorized' })
        }
        const data = await res.json().catch(() => null)
        if (!data?.access) {
          throw new ApiError('Session expired. Sign in again.', { status: res.status, code: 'unauthorized' })
        }
        setAccessToken(data.access)
        return data.access
      })
      .catch((err) => {
        throw err instanceof ApiError ? err : new ApiError('Could not refresh the session.', { code: 'network' })
      })
      .finally(() => {
        refreshInFlight = null
      })
  }
  return refreshInFlight
}

// Endpoints that must never trigger the refresh dance.
// (pay-mock returns 401 for the admin role gate, not for a dead session.)
const NO_REFRESH = new Set(['/auth/login', '/auth/signup', '/auth/refresh', '/auth/logout', '/booking/pay-mock'])

async function request(method, path, body, { retried = false } = {}) {
  const url = path.startsWith('http') ? path : BASE_URL + path
  const headers = {}
  if (body !== undefined) headers['Content-Type'] = 'application/json'
  if (accessToken) headers.Authorization = `Bearer ${accessToken}`

  let res
  try {
    res = await fetch(url, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
      credentials: 'include',
    })
  } catch {
    throw new ApiError('Cannot reach the Codetern server. Check your connection and try again.', { code: 'network' })
  }

  const isJson = (res.headers.get('content-type') || '').includes('application/json')
  const data = isJson ? await res.json().catch(() => null) : null

  if (res.status === 401 && !NO_REFRESH.has(path) && !retried) {
    try {
      await refreshAccessToken()
      return request(method, path, body, { retried: true })
    } catch (err) {
      fireAuthExpired()
      throw err
    }
  }

  if (!res.ok) {
    const message = data?.error?.message || (res.status === 401 ? 'Session expired. Sign in again.' : `Request failed (${res.status}).`)
    throw new ApiError(message, { status: res.status, code: data?.error?.code || 'request_failed', details: data?.error?.details })
  }

  return data
}

export const api = {
  get: (path) => request('GET', path),
  post: (path, body) => request('POST', path, body === undefined ? undefined : body),
  put: (path, body) => request('PUT', path, body === undefined ? undefined : body),
  del: (path) => request('DELETE', path),
}

// Next tier helpers used by the checkout flow, matched 1:1 to the routes
// verified against the running backend:
//   POST /api/booking/order { domain, duration }  → creates the order + hold
//   POST /api/booking/pay-mock { orderId }        → settles a hold-order's
//                                                   mock payment (own orders;
//                                                   mock mode only)
//   GET  /api/booking/order/:orderId              → { order: { status, … } }

// Payment-hold settle for the mock lane. The backend reads the order id and
// answers with the refund-shaped reply for holds it settled; the order
// reaches `paid` via the status poll afterwards.
export async function mockPay(orderId) {
  return api.post('/booking/pay-mock', { orderId })
}

const POLL_ATTEMPTS = 30
const POLL_MS = 1000

// Poll the order status until it settles to `paid`. Settled orders resolve on
// the first read. Throws ApiError('payment_poll_timeout') after the budget so
// the checkout page can show "payment received" guidance instead of spinning.
export async function waitForPaidOrder(orderId, attempts = POLL_ATTEMPTS) {
  for (let i = 0; i < attempts; i++) {
    const data = await api.get(`/booking/order/${orderId}`)
    if (data && data.order && data.order.status === 'paid') {
      return data.order
    }
    await new Promise((resolve) => setTimeout(resolve, POLL_MS))
  }
  throw new ApiError('We have not received your payment confirmation yet. Refresh the page in a moment.', { code: 'payment_poll_timeout' })
}