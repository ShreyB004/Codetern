import { createHmac, timingSafeEqual } from 'node:crypto'
import { env } from '../env.js'
import { uid, randomId } from './ids.js'
import { unavailable, badRequest } from './errors.js'

// Payment client. With Razorpay keys → real orders + webhook signature
// verification. Without keys → mock mode: orders carry a signed mock
// signature so the full flow (hold → pay → settle → referral) is testable.
export class Payments {
  constructor() {
    this.configured = env.paymentsConfigured
  }

  _authHeader() {
    return `Basic ${Buffer.from(`${env.RAZORPAY_KEY_ID}:${env.RAZORPAY_KEY_SECRET}`).toString('base64')}`
  }

  async createOrder({ amountPaise, currency = 'INR', receipt }) {
    if (this.configured) {
      const res = await fetch('https://api.razorpay.com/v1/orders', {
        method: 'POST',
        headers: {
          Authorization: this._authHeader(),
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ amount: amountPaise, currency, receipt, notes: {} }),
        signal: AbortSignal.timeout(15_000),
      })
      const body = await res.json().catch(() => ({}))
      if (!res.ok) {
        console.error('[razorpay] create order failed:', res.status, body)
        throw unavailable('Payment gateway could not create the order. Try again.')
      }
      return { orderId: body.id, mode: 'razorpay', amountDecimals: body.amount / 100 }
    }

    // Mock mode — deterministic order id + HMAC so the webhook path is real.
    const orderId = `ord_mock_${randomId(16)}`
    const payload = `${orderId}.${amountPaise}.${currency}`
    const hmac = createHmac('sha256', env.RAZORPAY_WEBHOOK_SECRET || 'mock-webhook-secret')
      .update(payload)
      .digest('hex')
    return { orderId, mode: 'mock', amountDecimals: amountPaise / 100, mockSignature: hmac }
  }

  // Verify a Razorpay webhook body+sig with the shared secret (constant-time).
  verifyWebhookSignature(rawBody, signature) {
    if (!env.RAZORPAY_WEBHOOK_SECRET) throw badRequest('Webhook secret not configured on the server.')
    const expected = createHmac('sha256', env.RAZORPAY_WEBHOOK_SECRET).update(rawBody).digest('hex')
    const a = Buffer.from(expected)
    const b = Buffer.from(String(signature || ''))
    if (a.length !== b.length) return false
    return timingSafeEqual(a, b)
  }

  validateWebhook(payload, signature) {
    if (!payload?.payload?.payment?.entity?.order_id) {
      throw badRequest('Malformed payment event.')
    }
    if (!this.verifyWebhookSignature(payload.rawBody || '', signature)) {
      throw badRequest('Invalid webhook signature.')
    }
    const entity = payload.payload.payment.entity
    return {
      orderId: entity.order_id,
      paymentId: entity.id,
      amountPaise: entity.amount,
      method: entity.method,
      currency: entity.currency || 'INR',
      status: entity.status,
    }
  }

  // Mock helper: construct a signed webhook body for local tests/tools.
  mockPayment({ orderId, amountPaise = 42900, status = 'captured' }) {
    const secret = env.RAZORPAY_WEBHOOK_SECRET || 'mock-webhook-secret'
    const body = {
      event: 'payment.captured',
      payload: {
        payment: { entity: { id: `pay_mock_${randomId(8)}`, order_id: orderId, amount: amountPaise, status, method: 'upi', currency: 'INR' } },
      },
    }
    const raw = JSON.stringify(body)
    const signature = createHmac('sha256', secret).update(raw).digest('hex')
    return { rawBody: raw, body, signature }
  }
}

export const payments = new Payments()