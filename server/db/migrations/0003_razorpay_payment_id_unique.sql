-- 0003_razorpay_payment_id_unique.sql
-- Money-critical idempotency guard: a single Razorpay payment id may only
-- ever settle one payments row. Duplicate webhook delivery (same payment id
-- arriving on a different order) now violates the unique index instead of
-- double-settling. Partial: rows with no razorpay_payment_id (created-only
-- orders) are unaffected.
BEGIN;

CREATE UNIQUE INDEX IF NOT EXISTS uq_payments_razorpay_payment_id
  ON payments (razorpay_payment_id)
  WHERE razorpay_payment_id IS NOT NULL;

COMMIT;