import { query, tx } from '../db/pool.js'
import { uid } from './ids.js'
import { badRequest, notFound } from './errors.js'

export const REFERRAL_REWARD = 50

export async function getWallet(candidateId) {
  const { rows } = await query(
    'SELECT wallet_balance AS balance FROM candidates WHERE id = $1',
    [candidateId],
  )
  if (!rows[0]) throw notFound('Candidate not found.')
  const { rows: txs } = await query(
    'SELECT id, amount, reason, source_type AS "sourceType", source_id AS "sourceId", created_at AS at FROM wallet_transactions WHERE candidate_id = $1 ORDER BY created_at DESC LIMIT 100',
    [candidateId],
  )
  return { balance: rows[0].balance, transactions: txs }
}

// Atomic + idempotent credit inside a transaction. The (source_type, source_id)
// unique key guarantees a retried webhook never double-credits.
export async function creditWallet(client, candidateId, amount, reason, sourceType = 'manual', sourceId = null) {
  if (!Number.isInteger(amount) || amount <= 0) throw badRequest('Credit amount must be a positive integer.')
  const id = uid('t')
  const { rows } = await client.query(
    `INSERT INTO wallet_transactions (id, candidate_id, amount, reason, source_type, source_id)
     VALUES ($1, $2, $3, $4, $5, $6)
     ON CONFLICT (source_type, source_id) DO NOTHING
     RETURNING id`,
    [id, candidateId, amount, reason, sourceType, sourceId],
  )
  if (rows.length === 0) return false // already credited
  await client.query(
    'UPDATE candidates SET wallet_balance = wallet_balance + $2 WHERE id = $1',
    [candidateId, amount],
  )
  return true
}

// First successful booking → credit the referrer's wallet, once.
export async function applyReferralReward(client, candidateId, paymentOrderId) {
  const { rows } = await client.query(
    `SELECT c.referred_by AS ref, c.booking
     FROM candidates c WHERE c.id = $1`,
    [candidateId],
  )
  const c = rows[0]
  if (!c?.ref || c.booking?.rewardCredited === true) return false

  const created = await creditWallet(client, c.ref, REFERRAL_REWARD, 'Referral reward — friend booked a seat', 'referral', paymentOrderId)
  if (!created) return false

  await client.query(
    `INSERT INTO referrals (referrer_id, referred_id, reward, credited)
     VALUES ($1, $2, $3, true)
     ON CONFLICT (referrer_id, referred_id) DO NOTHING`,
    [c.ref, candidateId, REFERRAL_REWARD],
  )
  await client.query(
    `UPDATE candidates SET booking = jsonb_set(COALESCE(booking, '{}'::jsonb), '{rewardCredited}', 'true') WHERE id = $1`,
    [candidateId],
  )
  return true
}

export async function adminCreditCandidate(candidateId, amount, reason) {
  return tx(async (client) => {
    return creditWallet(client, candidateId, amount, reason, 'admin', uid('adm'))
  })
}