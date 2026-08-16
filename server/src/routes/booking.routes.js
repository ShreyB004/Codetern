import { requireAuth } from '../auth/guards.js'
import { query } from '../db/pool.js'
import { payments } from '../lib/payments.js'
import { holdSeat, releaseHold } from '../lib/seats.js'
import { badRequest, notFound, conflict, unauthorized } from '../lib/errors.js'
import { batchPrice } from '../lib/pricing.js'
import { seatQueue, enqueueReceiptEmail, settlePayment, HOLD_TTL_MS } from '../queues.js'

export async function bookingRoutes(app) {
  app.post('/booking/order', { preHandler: requireAuth }, async (request, reply) => {
    const { domain, duration } = request.body || {}
    if (!domain || !duration) throw badRequest('domain and duration are required.')
    if (!Number.isInteger(duration) || ![1, 2, 3, 6].includes(duration)) throw badRequest('Invalid duration.')

    // DB is the source of truth (admin can create programmes at runtime).
    const { rows: progRows } = await query('SELECT id, title FROM programmes WHERE id = $1', [domain])
    if (!progRows[0]) throw notFound('Programme not found.')

    const { rows: candRows } = await query('SELECT id FROM candidates WHERE user_id = $1', [request.user.id])
    if (!candRows[0]) throw badRequest('No candidate profile for this account.')

    const seat = await holdSeat(domain, duration) // atomic; throws 409 if sold out

    const amount = batchPrice(duration).total
    const amountPaise = amount * 100
    let order
    try {
      order = await payments.createOrder({ amountPaise, currency: 'INR', receipt: `${candRows[0].id.slice(0, 32)}_${Date.now()}` })
    } catch (err) {
      await releaseHold(domain, duration) // don't leak holds when the gateway fails
      throw err
    }

    const orderId = order.orderId.slice(0, 64)
    await query(
      `INSERT INTO payments (order_id, candidate_id, programme_id, duration, amount, status, hold_key)
       VALUES ($1, $2, $3, $4, $5, 'created', $6)`,
      [orderId, candRows[0].id, domain, duration, amount, `hold:${domain}:${duration}:${orderId}`],
    )

    // Auto-expire the hold 10 min later if payment never confirms.
    await seatQueue.add('expire', { orderId }, { delay: HOLD_TTL_MS, attempts: 3, backoff: { type: 'exponential', delay: 2000 } })

    reply.code(201)
    return {
      ok: true,
      order: { id: orderId, amount, amountPaise, currency: 'INR', mode: order.mode, holdExpiresInMs: HOLD_TTL_MS },
      seat: { domain, duration, remaining: seat.total - seat.sold - seat.held },
    }
  })

  // Mock-only payment confirmation (dev/test; admin only, gated in production).
  app.post('/booking/pay-mock', { preHandler: requireAuth }, async (request) => {
    if (request.user.role !== 'admin') throw unauthorized('Only an admin can simulate a payment.')
    const { orderId } = request.body || {}
    if (!orderId) throw badRequest('orderId is required.')

    const { rows } = await query('SELECT * FROM payments WHERE order_id = $1', [orderId])
    if (!rows[0]) throw notFound('Order not found.')
    if (rows[0].status !== 'created') throw conflict('Order is not in a payable state.')

    const mock = payments.mockPayment({ orderId, amountPaise: rows[0].amount * 100 })
    const entity = mock.body.payload.payment.entity
    await settlePayment(orderId, { paymentId: entity.id, method: entity.method, status: entity.status })

    const { rows: candRows } = await query('SELECT id, name, email FROM candidates WHERE id = $1', [rows[0].candidate_id])
    if (candRows[0]) {
      const { rows: p } = await query('SELECT title FROM programmes WHERE id = $1', [rows[0].programme_id])
      await enqueueReceiptEmail(candRows[0], orderId, rows[0].amount, p[0]?.title || rows[0].programme_id)
    }
    return { ok: true, orderId }
  })

  // Razorpay webhook — signature-verified, idempotent, always acked.
  app.post('/booking/webhook', async (request, reply) => {
    const signature = String(request.headers['x-razorpay-signature'] || '')
    let event
    try {
      event = payments.validateWebhook({ ...request.body, rawBody: request.rawBody }, signature)
    } catch (err) {
      return reply.code(400).send({ error: { code: 'bad_request', message: err.message } })
    }

    if (event.status !== 'captured') {
      return { received: true, status: event.status }
    }

    await settlePayment(event.orderId, { paymentId: event.paymentId, method: event.method, status: event.status })
    return { received: true }
  })

  // Student cancels the checkout → hold released immediately.
  app.post('/booking/:orderId/cancel', { preHandler: requireAuth }, async (request) => {
    const { orderId } = request.params
    const { rows } = await query('SELECT * FROM payments WHERE order_id = $1', [orderId])
    if (!rows[0]) throw notFound('Order not found.')
    if (rows[0].candidate_id !== request.user.id && request.user.role !== 'admin') {
      throw unauthorized('You cannot cancel this order.')
    }
    if (rows[0].status === 'created') {
      await query("UPDATE payments SET status = 'expired', updated_at = now() WHERE order_id = $1", [orderId])
      await releaseHold(rows[0].programme_id, rows[0].duration)
      // The scheduled expiry job will no-op (status guard).
    }
    return { ok: true, status: 'expired' }
  })
}