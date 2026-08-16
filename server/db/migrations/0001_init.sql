-- 0001_init.sql — Codetern base schema (full parity with the frontend localStorage model)
BEGIN;

CREATE TABLE IF NOT EXISTS users (
  id            TEXT PRIMARY KEY,
  name          TEXT NOT NULL,
  email         TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  role          TEXT NOT NULL DEFAULT 'student' CHECK (role IN ('student', 'admin')),
  referral_code TEXT NOT NULL UNIQUE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS programmes (
  id          TEXT PRIMARY KEY,
  title       TEXT NOT NULL,
  sub         TEXT NOT NULL DEFAULT '',
  tagline     TEXT NOT NULL DEFAULT '',
  icon        TEXT NOT NULL DEFAULT 'Code2',
  color       TEXT NOT NULL DEFAULT 'mern',
  durations   JSONB NOT NULL DEFAULT '[]',
  stack       JSONB NOT NULL DEFAULT '[]',
  outcomes    JSONB NOT NULL DEFAULT '[]',
  description TEXT NOT NULL DEFAULT '',
  sort_order  INT NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS seats (
  programme_id TEXT NOT NULL REFERENCES programmes(id) ON DELETE CASCADE,
  duration     INT NOT NULL CHECK (duration IN (1, 2, 3, 6)),
  total        INT NOT NULL DEFAULT 0 CHECK (total >= 0),
  sold         INT NOT NULL DEFAULT 0 CHECK (sold >= 0),
  held         INT NOT NULL DEFAULT 0 CHECK (held >= 0),
  PRIMARY KEY (programme_id, duration),
  CHECK (sold + held <= total)
);

CREATE TABLE IF NOT EXISTS quiz_banks (
  domain   TEXT PRIMARY KEY,
  minutes  INT NOT NULL DEFAULT 5,
  questions JSONB NOT NULL DEFAULT '[]'
);

CREATE TABLE IF NOT EXISTS workspace_defaults (
  domain    TEXT PRIMARY KEY,
  tasks     JSONB NOT NULL DEFAULT '[]',
  resources JSONB NOT NULL DEFAULT '[]'
);

CREATE TABLE IF NOT EXISTS media (
  id       TEXT PRIMARY KEY,
  name     TEXT NOT NULL,
  kind     TEXT NOT NULL DEFAULT 'image',
  slot     TEXT NOT NULL DEFAULT 'home-hero',
  width    INT,
  height   INT,
  gradient TEXT,
  url      TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS candidates (
  id             TEXT PRIMARY KEY,
  user_id        TEXT UNIQUE REFERENCES users(id) ON DELETE SET NULL,
  name           TEXT NOT NULL,
  email          TEXT NOT NULL,
  domain         TEXT,
  domain_title   TEXT,
  step           INT NOT NULL DEFAULT 1 CHECK (step BETWEEN 1 AND 5),
  status         TEXT NOT NULL DEFAULT 'pending',
  applied_at     DATE NOT NULL DEFAULT CURRENT_DATE,
  quiz_score     INT,
  quiz_passed    BOOLEAN NOT NULL DEFAULT false,
  interview_score INT,
  profile        JSONB,
  booking        JSONB,
  quiz           JSONB,
  interview      JSONB,
  cert           JSONB,
  lor            JSONB,
  payment        JSONB,
  workspace      JSONB,
  history        JSONB NOT NULL DEFAULT '[]',
  referred_by    TEXT,
  referral_code  TEXT NOT NULL UNIQUE,
  wallet_balance INT NOT NULL DEFAULT 0 CHECK (wallet_balance >= 0),
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS wallet_transactions (
  id           TEXT PRIMARY KEY,
  candidate_id TEXT NOT NULL REFERENCES candidates(id) ON DELETE CASCADE,
  amount       INT NOT NULL,
  reason       TEXT NOT NULL,
  source_type  TEXT NOT NULL DEFAULT 'manual',
  source_id    TEXT,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (source_type, source_id)
);

CREATE TABLE IF NOT EXISTS payments (
  order_id     TEXT PRIMARY KEY,
  candidate_id TEXT NOT NULL REFERENCES candidates(id) ON DELETE CASCADE,
  programme_id TEXT NOT NULL REFERENCES programmes(id) ON DELETE CASCADE,
  duration     INT NOT NULL CHECK (duration IN (1, 2, 3, 6)),
  amount       INT NOT NULL CHECK (amount >= 0),
  currency     TEXT NOT NULL DEFAULT 'INR',
  status       TEXT NOT NULL DEFAULT 'created'
               CHECK (status IN ('created', 'paid', 'failed', 'expired')),
  method       TEXT,
  tx_id        TEXT,
  razorpay_payment_id TEXT,
  meta         JSONB NOT NULL DEFAULT '{}',
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  hold_key     TEXT UNIQUE
);

CREATE TABLE IF NOT EXISTS referrals (
  referrer_id  TEXT NOT NULL REFERENCES candidates(id) ON DELETE CASCADE,
  referred_id  TEXT NOT NULL REFERENCES candidates(id) ON DELETE CASCADE,
  reward       INT NOT NULL DEFAULT 50,
  credited     BOOLEAN NOT NULL DEFAULT false,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (referrer_id, referred_id)
);

CREATE INDEX IF NOT EXISTS idx_candidates_user_id  ON candidates(user_id);
CREATE INDEX IF NOT EXISTS idx_candidates_status   ON candidates(status);
CREATE INDEX IF NOT EXISTS idx_payments_status     ON payments(status);
CREATE INDEX IF NOT EXISTS idx_wallet_tx_candidate ON wallet_transactions(candidate_id);

COMMIT;