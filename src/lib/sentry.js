let Sentry = null
let ready = false

// Lazy-loads Sentry only when a DSN is configured, so the SDK never
// costs bytes or startup time on builds without crash reporting.
export async function initSentry() {
  const dsn = (import.meta.env.VITE_SENTRY_DSN || '').trim()
  if (!dsn || ready) return
  try {
    Sentry = await import('@sentry/react')
    Sentry.init({
      dsn,
      environment: import.meta.env.MODE,
      tracesSampleRate: 0.1,
    })
    ready = true
  } catch { /* crash reporting is best-effort */ }
}

export function reportError(error, context = {}) {
  if (!ready || !Sentry) {
    if (import.meta.env.DEV) console.error('[reportError]', error, context)
    return
  }
  try {
    Sentry.captureException(error, { extra: context })
  } catch { /* noop */ }
}
