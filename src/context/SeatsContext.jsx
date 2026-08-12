import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { buildSeatMap } from '../data/seed.js'
import { load, save } from '../lib/store.js'

const SeatsCtx = createContext(null)

export function SeatsProvider({ children }) {
  const [seats, setSeats] = useState(() => load('seats:v1', null) || buildSeatMap())

  useEffect(() => save('seats:v1', seats), [seats])

  const getRemaining = useCallback((domainId, duration) => seats?.[domainId]?.[duration]?.remaining ?? 0, [seats])
  const getTotal = useCallback((domainId, duration) => seats?.[domainId]?.[duration]?.total ?? 0, [seats])

  const bookSeat = useCallback((domainId, duration) => {
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
    return ok
  }, [])

  const releaseSeat = useCallback((domainId, duration) => {
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