import { Queue, Worker } from 'bullmq'
import redis from './db/redis.js'
import { releaseHold, settleSeat } from './lib/seats.js'
import { query, tx } from './db/pool.js'
import { mailer } from './lib/mailer.js'
import { applyReferralReward } from './lib/wallet.js'

const connection = { host: redis.options.host, port: redis.options.port, password: redis.options.password, tls: redis.options.tls }

export const HOLD_TTL_MS = 10 * 60 * 1000

export const seatQueue = new Queue('seat-holds', { connection })
export const emailQueue = new Queue('emails', { connection })

// ── seat hold expiry worker ───────────────────────────────────────────
// A hold auto-releases 10 minutes after order creation if payment never
// lands. Idempotent: only expires payments still in 'created' state.
export const seatWorker = new Worker(
  'seat-holds',
  async (job) => {
    const { orderId } = job.data
    await tx(async (client) => {
      const { rows } = await client.query('SELECT * FROM payments WHERE order_id = $1 FOR UPDATE', [orderId])
      const payment = rows[0]
      if (!payment || payment.status !== 'created') return // already paid/failed/expired

      await client.query('UPDATE payments SET status = $2, updated_at = now() WHERE order_id = $1', [orderId, 'expired'])
      await releaseHold(payment.programme_id, payment.duration)
    })
  },
  { connection },
)

seatWorker.on('failed', (job, err) => console.error('[seat-hold] expiry job failed:', err?.message))

// ── email worker ───────────────────────────────────────────────────────
export const emailWorker = new Worker(
  'emails',
  async (job) => {
    const { type, to, name, data } = job.data
    switch (type) {
      case 'receipt':
        await mailer.sendPaymentReceipt(to, name, data)
        break
      case 'cert':
        await mailer.sendCertIssued(to, name, data.certId)
        break
      case 'lor':
        await mailer.sendLorIssued(to, name, data.lorId)
        break
      case 'verify':
        await mailer.sendVerification(to, name, data.code)
        break
      default:
        console.warn('[email] unknown job type:', type)
    }
  },
  { connection, limiter: { max: 5, duration: 1000 } },
)

emailWorker.on('failed', (job, err) => console.error('[email] send failed:', job?.id, err?.message))

export async function settlePayment(orderId, { paymentId, method, status }) {
  let credited = false
  await tx(async (client) => {
    const { rows } = await client.query('SELECT * FROM payments WHERE order_id = $1 FOR UPDATE', [orderId])
    const payment = rows[0]
    if (!payment || payment.status !== 'created') return // idempotent re-delivery

    await client.query(
      `UPDATE payments SET status = 'paid', method = $2, razorpay_payment_id = $3, tx_id = $4, updated_at = now()
       WHERE order_id = $1`,
      [orderId, method, paymentId, paymentId],
    )
    const seat = await settleSeat(payment.programme_id, payment.duration)

    const { rows: candRows } = await client.query('SELECT * FROM candidates WHERE id = $1 FOR UPDATE', [payment.candidate_id])
    const cand = candRows[0]
    if (!cand) throw new Error(`candidate ${payment.candidate_id} missing for order ${orderId}`)

    const firstBooking = !cand.booking
    await client.query(
      `UPDATE candidates SET
         domain = $2, domain_title = $3,
         booking = $4::jsonb, payment = $5::jsonb, status = 'active',
         step = GREATEST(step, 1), wallet_balance = wallet_balance
       WHERE id = $1`,
      [
        cand.id,
        payment.programme_id,
        cand.domain_title,
        JSON.stringify({ domain: payment.programme_id, duration: payment.duration, at: new Date().toISOString(), payment: { method, amount: payment.amount, txId: paymentId, at: new Date().toISOString() } }),
        JSON.stringify({ orderId, method, amount: payment.amount, status: 'paid', at: new Date().toISOString() }),
      ],
    )

    // Referral reward: first successful booking credits the referrer once.
    if (firstBooking && cand.referred_by) {
      credited = await applyReferralReward(client, cand.id, orderId)
    }
  })
  return { credited }
}

export async function enqueueReceiptEmail(candidate, orderId, amount, domainTitle) {
  await emailQueue.add('receipt', {
    type: 'receipt',
    to: candidate.email,
    name: candidate.name,
    data: { orderId, amount, domain: domainTitle, duration: candidate.booking?.duration },
  })
}