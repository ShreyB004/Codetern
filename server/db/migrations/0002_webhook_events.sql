-- 0002_webhook_events.sql — webhook event ledger + payment lifecycle columns
BEGIN;

-- Ledger for every signature-valid Razorpay webhook delivery. Primary key is
-- the Razorpay event id (payment entity id for payment.* events), which makes
-- retries idempotent: a second delivery of the same event is a no-op ack.
CREATE TABLE IF NOT EXISTS webhook_events (
  id           TEXT PRIMARY KEY,
  type         TEXT NOT NULL,
  payload      JSONB NOT NULL,
  status       TEXT NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'PROCESSED', 'FAILED')),
  attempts     INT NOT NULL DEFAULT 0,
  last_error   TEXT,
  received_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_webhook_events_status   ON webhook_events(status);
CREATE INDEX IF NOT EXISTS idx_webhook_events_received ON webhook_events(received_at);

-- Payment lifecycle additions:
--  * paid_at      — when the order settled (refund window anchor)
--  * refund_amount / refunded_at — refund record (integers in paise)
--  * status gains 'refunded'
ALTER TABLE payments ADD COLUMN IF NOT EXISTS paid_at TIMESTAMPTZ;
ALTER TABLE payments ADD COLUMN IF NOT EXISTS refund_amount INT NOT NULL DEFAULT 0;
ALTER TABLE payments ADD COLUMN IF NOT EXISTS refunded_at TIMESTAMPTZ;

DO $$
BEGIN
  ALTER TABLE payments DROP CONSTRAINT IF EXISTS payments_status_check;
  ALTER TABLE payments ADD CONSTRAINT payments_status_check
    CHECK (status IN ('created', 'paid', 'failed', 'expired', 'refunded'));
END $$;

COMMIT;