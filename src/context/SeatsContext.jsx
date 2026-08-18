import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { buildSeatMap } from '../data/seed.js'
import { load, save } from '../lib/store.js'
import { api, ApiError } from '../lib/api.js'

const SeatsCtx = createContext(null)

export function SeatsProvider({ children }) {
  // Deterministic local map first (SSR + offline safe); the server map from
  // GET /api/seats is merged over it as soon as it arrives. Cells the server
  // does not know about keep their local fallback so counters never show
  // a bogus "sold out".
  const [seats, setSeats] = useState(() => load('seats:v1', null) || buildSeatMap())
  const serverReachable = useRef(true)

  useEffect(() => save('seats:v1', seats), [seats])

  // Seed from the API once on mount.
  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const data = await api.get('/seats')
        if (cancelled) return
        const serverMap = data?.seats || {}
        serverReachable.current = true
        setSeats((prev) => {
          const next = { ...prev }
          Object.entries(serverMap).forEach(([domainId, cellMap]) => {
            next[domainId] = { ...next[domainId], ...cellMap }
          })
          return next
        })
      } catch {
        serverReachable.current = false // keep the deterministic local map
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  const getRemaining = useCallback((domainId, duration) => seats?.[domainId]?.[duration]?.remaining ?? 0, [seats])
  const getTotal = useCallback((domainId, duration) => seats?.[domainId]?.[duration]?.total ?? 0, [seats])

  // Server hold (returns { ok } or { ok:false, error }); on network failure it
  // falls back to a local decrement so the marketing flow never dead-ends.
  const bookSeat = useCallback(async (domainId, duration) => {
    try {
      const data = await api.post('/me/seats/hold', { domain: domainId, duration })
      const hold = data?.hold
      if (hold) {
        setSeats((prev) => {
          const cell = prev?.[domainId]?.[duration]
          if (!cell) return prev
          const held = cell.held ?? Math.max(0, cell.total - hold.remaining)
          return {
            ...prev,
            [domainId]: { ...prev[domainId], [duration]: { ...cell, remaining: hold.remaining, held } },
          }
        })
        return { ok: true }
      }
      return { ok: false, error: 'No seats available for this batch.' }
    } catch (err) {
      if (err instanceof ApiError && err.code === 'network') {
        let ok = false
        setSeats((prev) => {
          const cell = prev?.[domainId]?.[duration]
          if (!cell || cell.remaining <= 0) return prev
          ok = true
          return {
            ...prev,
            [domainId]: {
              ...prev[domainId],
              [duration]: { ...cell, remaining: cell.remaining - 1 },
            },
          }
        })
        return { ok }
      }
      return { ok: false, error: err.message || 'Could not hold a seat. Please try again.' }
    }
  }, [])

  const releaseSeat = useCallback(async (domainId, duration) => {
    api.post('/me/seats/release', { domain: domainId, duration }).catch(() => {})
    setSeats((prev) => {
      const cell = prev?.[domainId]?.[duration]
      if (!cell) return prev
      return {
        ...prev,
        [domainId]: {
          ...prev[domainId],
          [duration]: { ...cell, remaining: Math.min(cell.total, cell.remaining + 1) },
        },
      }
    })
  }, [])

  const setSeat = useCallback(
    (domainId, duration, { total, remaining } = {}) => {
      setSeats((prev) => {
        const cell = prev?.[domainId]?.[duration]
        if (!cell) return prev
        const nextTotal = total ?? cell.total
        const nextRemaining = Math.max(0, Math.min(nextTotal, remaining ?? cell.remaining))
        return {
          ...prev,
          [domainId]: { ...prev[domainId], [duration]: { total: nextTotal, remaining: nextRemaining } },
        }
      })
    },
    [],
  )

  const scaleAll = useCallback((factor) => {
    setSeats((prev) => {
      const next = {}
      Object.entries(prev).forEach(([domainId, cellMap]) => {
        next[domainId] = {}
        Object.entries(cellMap).forEach(([dur, cell]) => {
          const total = Math.max(1, Math.round(cell.total * factor))
          const remaining = Math.max(0, Math.min(total, cell.remaining))
          next[domainId][dur] = { total, remaining }
        })
      })
      return next
    })
  }, [])

  const value = useMemo(
    () => ({ seats, bookSeat, releaseSeat, setSeat, scaleAll, getRemaining, getTotal }),
    [seats, bookSeat, releaseSeat, setSeat, scaleAll, getRemaining, getTotal],
  )

  return <SeatsCtx.Provider value={value}>{children}</SeatsCtx.Provider>
}

export function useSeats() {
  const ctx = useContext(SeatsCtx)
  if (!ctx) throw new Error('useSeats must be used within SeatsProvider')
  return ctx
}