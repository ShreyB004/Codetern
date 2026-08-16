import { query, tx } from '../db/pool.js'
import { badRequest, notFound, conflict } from './errors.js'

export const AVAILABLE_DURATIONS = [1, 2, 3, 6]

// One row per programme×duration
export async function getSeatRows(programmeIds = null) {
  const params = []
  let where = ''
  if (programmeIds?.length) {
    params.push(programmeIds)
    where = 'WHERE programme_id = ANY($1)'
  }
  const { rows } = await query(`SELECT * FROM seats ${where} ORDER BY programme_id, duration`, params)
  return rows
}

export async function getSeatMap() {
  const rows = await getSeatRows()
  const map = {}
  for (const r of rows) {
    map[r.programme_id] ??= {}
    map[r.programme_id][r.duration] = {
      total: r.total,
      sold: r.sold,
      held: r.held,
      remaining: Math.max(0, r.total - r.sold - r.held),
    }
  }
  return map
}

export async function getSeat(programmeId, duration) {
  const { rows } = await query('SELECT * FROM seats WHERE programme_id = $1 AND duration = $2', [programmeId, duration])
  return rows[0] || null
}

// Atomic hold: only succeeds when availability > 0. Decrement happens at
// payment-time; a hold just reserves the slot (Redis TTL auto-releases).
export async function holdSeat(programmeId, duration, userId = null) {
  if (!AVAILABLE_DURATIONS.includes(Number(duration))) throw badRequest('Invalid duration.')
  const { rows } = await query(
    `UPDATE seats
     SET held = held + 1
     WHERE programme_id = $1 AND duration = $2 AND total - sold - held > 0
     RETURNING *`,
    [programmeId, Number(duration)],
  )
  if (!rows[0]) throw conflict('No seats left for this domain and duration. Please try another batch.')
  return rows[0]
}

// Payment-time settle: held → sold (atomic, idempotent via RETURNING check)
export async function settleSeat(programmeId, duration) {
  const { rows } = await query(
    `UPDATE seats
     SET held = GREATEST(held - 1, 0), sold = sold + 1
     WHERE programme_id = $1 AND duration = $2
     RETURNING *`,
    [programmeId, duration],
  )
  return rows[0] || null
}

// Abandon/expire: release a hold (never goes below zero)
export async function releaseHold(programmeId, duration) {
  const { rows } = await query(
    `UPDATE seats
     SET held = GREATEST(held - 1, 0)
     WHERE programme_id = $1 AND duration = $2 AND held > 0
     RETURNING *`,
    [programmeId, duration],
  )
  return rows[0] || null
}

// Admin: override a single cell (clamped so sold/held never exceed total)
export async function overrideSeat(programmeId, duration, { total, sold, held }) {
  const existing = await getSeat(programmeId, duration)
  if (!existing) throw notFound('Seat cell not found.')

  if (total !== undefined) {
    if (!Number.isInteger(total) || total < 0) throw badRequest('total must be a non-negative integer.')
  }
  if (sold !== undefined && (!Number.isInteger(sold) || sold < 0)) throw badRequest('sold must be a non-negative integer.')
  if (held !== undefined && (!Number.isInteger(held) || held < 0)) throw badRequest('held must be a non-negative integer.')

  const nextTotal = total ?? existing.total
  const nextSold = Math.min(sold ?? existing.sold, nextTotal)
  const nextHeld = Math.min(held ?? existing.held, nextTotal - nextSold)

  const { rows } = await query(
    `UPDATE seats SET total = $3, sold = $4, held = $5 WHERE programme_id = $1 AND duration = $2 RETURNING *`,
    [programmeId, duration, nextTotal, nextSold, nextHeld],
  )
  return rows[0]
}

// Admin: scale all totals by a factor (mirrors SeatsContext.scaleAll)
export async function scaleSeats(factor) {
  if (!Number.isFinite(factor) || factor <= 0) throw badRequest('factor must be a positive number.')
  const rows = await tx(async (client) => {
    const { rows } = await client.query('SELECT * FROM seats')
    for (const r of rows) {
      const total = Math.max(1, Math.round(r.total * factor))
      const sold = Math.min(r.sold, total)
      const held = Math.min(r.held, total - sold)
      await client.query(
        'UPDATE seats SET total = $1, sold = $2, held = $3 WHERE programme_id = $4 AND duration = $5',
        [total, sold, held, r.programme_id, r.duration],
      )
    }
    return rows
  })
  return rows.length
}

// Admin: create a seat cell for a programme duration (used when admin edits durations)
export async function ensureSeat(programmeId, duration) {
  const { rows } = await query(
    `INSERT INTO seats (programme_id, duration, total) VALUES ($1, $2, $3)
     ON CONFLICT (programme_id, duration) DO NOTHING RETURNING *`,
    [programmeId, duration, 24],
  )
  return rows[0] || (await getSeat(programmeId, duration))
}