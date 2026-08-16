import { env } from '../env.js'

// Resend REST client. When no key is configured, emails are logged only —
// the flow keeps working (and smoke tests pass) without any external key.
export class Mailer {
  constructor() {
    this.configured = env.emailsConfigured
  }

  async send({ to, subject, html, text }) {
    if (!this.configured) {
      console.log(`[mail] (not configured) to=${to} subject="${subject}"`)
      return { sent: false, reason: 'mailer_not_configured' }
    }
    try {
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${env.RESEND_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ from: env.EMAIL_FROM, to, subject, html, text }),
        signal: AbortSignal.timeout(10_000),
      })
      if (!res.ok) {
        const body = await res.text().catch(() => '')
        console.error(`[mail] resend error ${res.status}: ${body}`)
        return { sent: false, reason: 'mailer_error' }
      }
      return { sent: true }
    } catch (err) {
      console.error('[mail] exception:', err.message)
      return { sent: false, reason: 'mailer_error' }
    }
  }

  async sendVerification(to, name, code) {
    return this.send({
      to,
      subject: 'Verify your Codetern email',
      text: `Hi ${name}, your verification code is ${code}. It expires in 10 minutes.`,
      html: `<p>Hi ${name},</p><p>Your verification code is <strong>${code}</strong>.</p><p>It expires in 10 minutes.</p>`,
    })
  }

  async sendPaymentReceipt(to, name, { orderId, amount, domain, duration }) {
    return this.send({
      to,
      subject: 'Codetern — payment received',
      text: `Hi ${name}, your batch booking (${domain}, ${duration} month(s)) of ₹${amount} is confirmed. Order: ${orderId}`,
      html: `<p>Hi ${name},</p><p>Your batch booking <strong>${domain}</strong> (${duration} month(s)) of <strong>₹${amount}</strong> is confirmed.</p><p>Order: ${orderId}</p>`,
    })
  }

  async sendCertIssued(to, name, certId) {
    return this.send({
      to,
      subject: 'Your certificate is ready',
      text: `Hi ${name}, your certificate ${certId} has been issued.`,
      html: `<p>Hi ${name},</p><p>Your certificate <strong>${certId}</strong> has been issued.</p>`,
    })
  }

  async sendLorIssued(to, name, lorId) {
    return this.send({
      to,
      subject: 'Your letter of recommendation is ready',
      text: `Hi ${name}, your LOR ${lorId} has been issued.`,
      html: `<p>Hi ${name},</p><p>Your LOR <strong>${lorId}</strong> has been issued.</p>`,
    })
  }
}

export const mailer = new Mailer()