// Payment reconciliation: DB truth vs the Razorpay order list for a lookback
// window. In mock mode (no gateway keys) only DB-side stats are produced.
import { payments } from './payments.js'
import { query } from '../db/pool.js'

export async function reconcileOrders({ days = 7 } = {}) {
  const to = Date.now()
  const from = to - days * 24 * 60 * 60 * 1000

  const { rows } = await query(
    `SELECT order_id, status, amount, created_at
     FROM payments
     WHERE created_at >= $1 AND created_at <= $2
     ORDER BY created_at`,
    [new Date(from).toISOString(), new Date(to).toISOString()],
  )

  const byStatus = {}
  const byId = new Map()
  for (const r of rows) {
    byStatus[r.status] = (byStatus[r.status] || 0) + 1
    byId.set(r.order_id, r)
  }

  const report = {
    mode: 'mock',
    windowDays: days,
    from: new Date(from).toISOString(),
    to: new Date(to).toISOString(),
    summary: { total: rows.length, byStatus },
    mismatches: { paidInRazorpayNotDb: [], inDbNotRazorpay: [] },
  }

  const rzOrders = await payments.fetchRecentOrders(from, to)
  if (rzOrders === null) return report

  report.mode = 'razorpay'
  const rzIds = new Set(rzOrders.map((o) => o.id))
  const rzPaid = rzOrders.filter((o) => o.status === 'paid')

  report.mismatches = {
    // Paid with the gateway but the DB shows nothing (or not paid) — money at risk.
    paidInRazorpayNotDb: rzPaid
      .filter((o) => {
        const db = byId.get(o.id)
        return !db || db.status !== 'paid'
      })
      .map((o) => ({ orderId: o.id, amountPaise: o.amount })),
    // Paid in the DB but the gateway has no record of the order.
    inDbNotRazorpay: rows
      .filter((r) => r.status === 'paid' && !rzIds.has(r.order_id))
      .map((r) => ({ orderId: r.order_id, amountPaise: r.amount * 100 })),
  }
  return report
}