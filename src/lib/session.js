// One-time sign-on: a successful Google sign-in stays valid for 30 days.
// After that the user is signed out and must sign in again.
export const SESSION_TTL_MS = 30 * 24 * 3600 * 1000
const KEY = 'cdt:authSince'

export function stampSession(now = Date.now()) {
  try {
    localStorage.setItem(KEY, String(now))
  } catch { /* private mode — session simply won't persist */ }
}

export function sessionExpired(now = Date.now()) {
  try {
    const since = Number(localStorage.getItem(KEY) || 0)
    if (!since) return true // never stamped (e.g. cleared storage) → re-login
    return now - since > SESSION_TTL_MS
  } catch {
    return false
  }
}

export function clearSession() {
  try {
    localStorage.removeItem(KEY)
  } catch { /* noop */ }
}
