// Webhook event ledger. Every signature-valid delivery is recorded here so
// replays are cheap to ack (idempotent) and failures are retryable.
import { query } from '../db/pool.js'

// Insert-if-not-exists inside the caller's transaction (client). Returns:
//   { inserted, duplicate, status, attempts }
//   - brand new event            → inserted:true,  status 'PENDING'
//   - already PROCESSED (replay) → duplicate:true, status 'PROCESSED'
//   - previously FAILED (retry)  → inserted:false, status 'PENDING' (reprocessed)
export async function recordWebhookEvent(client, { id, type, payload }) {
  const { rows } = await client.query(
    `INSERT INTO webhook_events (id, type, payload, status, attempts, received_at)
     VALUES ($1, $2, $3, 'PENDING', 1, now())
     ON CONFLICT (id) DO UPDATE SET
       attempts   = webhook_events.attempts + 1,
       status     = CASE WHEN webhook_events.status = 'FAILED' THEN 'PENDING' ELSE webhook_events.status END,
       payload    = EXCLUDED.payload,
       received_at = now()
     RETURNING status, attempts`,
    [id, type, JSON.stringify(payload)],
  )
  const status = rows[0].status
  return {
    inserted: status === 'PENDING' && rows[0].attempts === 1,
    duplicate: status === 'PROCESSED',
    status,
    attempts: rows[0].attempts,
  }
}

// Success — same transaction as the settlement write, so the ledger row and
// the state change commit or roll back together.
export async function markWebhookProcessed(client, id) {
  await client.query(`UPDATE webhook_events SET status = 'PROCESSED', last_error = NULL WHERE id = $1`, [id])
}

// Failure path runs OUTSIDE the (rolled-back) settlement transaction so the
// failure survives: Razorpay retries then flip FAILED → PENDING and reprocess.
export async function markWebhookFailed(id, type, error, payload = null) {
  const message = String(error?.message || error || 'unknown error').slice(0, 1000)
  await query(
    `INSERT INTO webhook_events (id, type, payload, status, attempts, last_error, received_at)
     VALUES ($1, $2, $3, 'FAILED', 1, $4, now())
     ON CONFLICT (id) DO UPDATE SET
       status      = 'FAILED',
       attempts    = webhook_events.attempts + 1,
       last_error  = EXCLUDED.last_error,
       payload     = EXCLUDED.payload,
       received_at = now()
     WHERE webhook_events.status = 'PENDING'`,
    [id, type, JSON.stringify(payload ?? {}), message],
  )
}