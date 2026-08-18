import { requireAuth, requireAdmin } from '../auth/guards.js'
import { query, tx } from '../db/pool.js'
import { payments } from '../lib/payments.js'
import { holdSeat, releaseHold } from '../lib/seats.js'
import { badRequest, notFound, conflict, unauthorized } from '../lib/errors.js'
import { batchPrice } from '../lib/pricing.js'
import { seatQueue, enqueueReceiptEmail, settlePayment, HOLD_TTL_MS } from '../queues.js'
import { recordWebhookEvent, markWebhookProcessed, markWebhookFailed } from '../lib/webhook-events.js'
import { reconcileOrders } from '../lib/reconcile.js'

// ── payment constants ─────────────────────────────────────────────────
const WEBHOOK_REPLAY_WINDOW_S = 5 * 60 // Razorpay retries never arrive late
const REFUND_WINDOW_MS = 7 * 24 * 60 * 60 * 1000 // refunds within 7 days of paidAt

function serializeOrder(o) {
  return {
    id: o.order_id,
    status: o.status,
    amount: o.amount,
    amountPaise: o.amount * 100,
    currency: o.currency,
    paymentId: o.razorpay_payment_id || o.tx_id || null,
    method: o.method || null,
    createdAt: o.created_at,
    paidAt: o.paid_at || null,
    updatedAt: o.updated_at,
    refundAmountPaise: o.refund_amount || 0,
    refundedAt: o.refunded_at || null,
  }
}

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

  // Clients poll this after checkout (and the frontend uses it for status)
  // while the webhook settles in the background — or /verify settles instantly.
  app.get('/booking/order/:orderId', { preHandler: requireAuth }, async (request) => {
    const { orderId } = request.params
    const { rows } = await query('SELECT * FROM payments WHERE order_id = $1', [orderId])
    if (!rows[0]) throw notFound('Order not found.')
    const o = rows[0]
    if (o.candidate_id !== request.user.id && request.user.role !== 'admin') throw unauthorized('You cannot view this order.')
    return { order: serializeOrder(o) }
  })

  // Mock-only payment confirmation (dev/test). With a real gateway configured
  // the lane is admin-only; without one (mock mode) any authenticated user may
  // settle their own order so the full signup → pay → wallet flow works.
  app.post('/booking/pay-mock', { preHandler: requireAuth }, async (request) => {
    const { orderId } = request.body || {}
    if (!orderId) throw badRequest('orderId is required.')

    const { rows } = await query('SELECT * FROM payments WHERE order_id = $1', [orderId])
    if (!rows[0]) throw notFound('Order not found.')
    const o = rows[0]
    if (o.candidate_id !== request.user.id && request.user.role !== 'admin') {
      throw unauthorized('You cannot pay for this order.')
    }
    if (payments.configured && request.user.role !== 'admin') throw unauthorized('Only an admin can simulate a payment.')
    if (o.status !== 'created') throw conflict('Order is not in a payable state.')

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

  // Razorpay webhook — signature-verified, replay-guarded, ledger-backed,
  // idempotent, always acked fast (200 even for dropped replays).
  app.post('/booking/webhook', async (request, reply) => {
    const signature = String(request.headers['x-razorpay-signature'] || '')
    let event
    try {
      event = payments.validateWebhook({ ...request.body, rawBody: request.rawBody }, signature)
    } catch (err) {
      request.log.warn({ reason: err.message }, '[webhook] invalid delivery dropped')
      return reply.code(400).send({ error: { code: 'bad_request', message: err.message } })
    }

    const eventType = String(request.body?.event || 'unknown')
    const eventId = event.paymentId || event.orderId

    // Replay guard: a payment event older than 5 minutes is a replay of an
    // already-settled event (or a forged one) — ack and drop, never settle.
    const created = Number(request.body?.created_at)
    if (created && Date.now() / 1000 - created > WEBHOOK_REPLAY_WINDOW_S) {
      request.log.info({ eventId, eventType, ageS: Math.round(Date.now() / 1000 - created) }, '[webhook] replay dropped')
      return { received: true, dropped: true }
    }

    // Acked-but-ignored events (refunds, failed attempts, …) — ledger only.
    if (event.status !== 'captured') {
      await tx(async (client) => {
        await recordWebhookEvent(client, { id: eventId, type: eventType, payload: request.body })
        await markWebhookProcessed(client, eventId)
      }).catch((err) => request.log.error({ err: err.message }, '[webhook] ignored-event ledger write failed'))
      return { received: true, status: event.status }
    }

    // Settlement + ledger row commit atomically; a re-delivery (unique
    // violation on the event id) is acked and skipped.
    try {
      await tx(async (client) => {
        const entry = await recordWebhookEvent(client, { id: eventId, type: eventType, payload: request.body })
        if (entry.duplicate) return // already PROCESSED — idempotent replay
        await settlePayment(event.orderId, { paymentId: event.paymentId, method: event.method, status: event.status }, client)
        await markWebhookProcessed(client, eventId)
      })
    } catch (err) {
      await markWebhookFailed(eventId, eventType, err, request.body).catch(() => {})
      request.log.error({ eventId, orderId: event.orderId, err: err.message }, '[webhook] settlement failed')
      return reply.code(502).send({ error: { code: 'bad_gateway', message: 'Webhook processing failed.' } })
    }
    return { received: true }
  })

  // Instant confirmation after Razorpay Checkout: verifies the gateway's
  // HMAC(orderId|paymentId) signature, then settles exactly like the webhook.
  app.post('/booking/:orderId/verify', { preHandler: requireAuth }, async (request) => {
    const { orderId } = request.params
    const { razorpay_payment_id: paymentId, razorpay_signature: signature } = request.body || {}
    if (!paymentId || !signature) throw badRequest('razorpay_payment_id and razorpay_signature are required.')

    const { rows } = await query('SELECT * FROM payments WHERE order_id = $1', [orderId])
    if (!rows[0]) throw notFound('Order not found.')
    const o = rows[0]
    if (o.candidate_id !== request.user.id && request.user.role !== 'admin') throw unauthorized('You cannot verify this order.')
    if (o.status === 'paid' || o.status === 'refunded') return { ok: true, order: serializeOrder(o) }
    if (o.status !== 'created') throw conflict('Order is not in a payable state.')

    // orderId comes from the DB row, so a stale/forged order id can't be
    // paired with a signature minted for another order.
    if (!payments.verifyPaymentSignature(orderId, paymentId, signature)) {
      throw badRequest('Invalid payment signature.')
    }

    await settlePayment(orderId, { paymentId, method: o.method || 'razorpay', status: 'captured' })
    const { rows: after } = await query('SELECT * FROM payments WHERE order_id = $1', [orderId])
    return { ok: true, order: serializeOrder(after[0]) }
  })

  // Refund a paid order within 7 days of settlement. Idempotent: refunding an
  // already-refunded order returns its current state with 200.
  app.post('/booking/:orderId/refund', { preHandler: requireAuth }, async (request) => {
    const { orderId } = request.params
    const { rows } = await query('SELECT * FROM payments WHERE order_id = $1', [orderId])
    if (!rows[0]) throw notFound('Order not found.')
    const o = rows[0]
    if (o.candidate_id !== request.user.id && request.user.role !== 'admin') throw unauthorized('You cannot refund this order.')
    if (o.status === 'refunded') return { ok: true, order: serializeOrder(o) }
    if (o.status !== 'paid') throw conflict('Only paid orders can be refunded.')

    const paidAt = o.paid_at ? new Date(o.paid_at).getTime() : Date.parse(o.updated_at)
    if (!paidAt || Date.now() - paidAt > REFUND_WINDOW_MS) {
      throw badRequest('Refunds are only allowed within 7 days of payment.')
    }

    if (payments.configured) {
      const rzPaymentId = o.razorpay_payment_id || o.tx_id
      if (!rzPaymentId) throw conflict('No gateway payment reference on this order.')
      await payments.createRefund(rzPaymentId, o.amount * 100) // live: push to Razorpay first
    }

    const { rows: updated } = await query(
      `UPDATE payments SET status = 'refunded', refund_amount = $2, refunded_at = now(), updated_at = now()
       WHERE order_id = $1 AND status = 'paid' RETURNING *`,
      [orderId, o.amount * 100],
    )
    if (!updated[0]) {
      // Raced with an identical refund — treat as already handled.
      const { rows: cur } = await query('SELECT * FROM payments WHERE order_id = $1', [orderId])
      return { ok: true, order: serializeOrder(cur[0]) }
    }
    return { ok: true, order: serializeOrder(updated[0]) }
  })

  // Reconcile local payments vs the gateway within a lookback window
  // (admin-only; mounted here under /api → GET /api/admin/reconcile).
  app.get('/admin/reconcile', { preHandler: requireAdmin }, async (request) => {
    const days = Number(request.query?.days ?? 7)
    if (!Number.isInteger(days) || days < 1 || days > 90) throw badRequest('days must be an integer between 1 and 90.')
    return reconcileOrders({ days })
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