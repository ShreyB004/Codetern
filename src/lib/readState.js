import { useSyncExternalStore } from 'react'

// Last-read timestamps per thread scope. Backed by localStorage but reactive:
// any setRead() re-renders every hook consumer, so notification badges
// clear the moment a thread is read — for students and admins alike.
const listeners = new Set()
const emit = () => listeners.forEach((fn) => fn())

function subscribe(fn) {
  listeners.add(fn)
  return () => { listeners.delete(fn) }
}

export function getRead(scope) {
  try {
    return Number(localStorage.getItem(`cdt:read:${scope}`) || 0)
  } catch {
    return 0
  }
}

export function setRead(scope, ts = Date.now()) {
  try {
    localStorage.setItem(`cdt:read:${scope}`, String(ts))
  } catch { /* noop */ }
  emit()
}

// Max message ts in a list — handy for "mark everything seen".
export function maxTs(rows) {
  return (rows || []).reduce((m, r) => Math.max(m, r.ts || 0), 0)
}

export function useRead(scope) {
  return useSyncExternalStore(subscribe, () => getRead(scope))
}
