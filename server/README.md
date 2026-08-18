# Codetern API

Fastify API for the Codetern admissions platform: candidate journey (signup →
quiz → workspace → cert/LOR → booking), seat inventory with atomic holds,
Razorpay payments with a fully functional mock mode, wallet credits, referrals,
and an admin console. Postgres is the system of record; Redis backs sessions
(refresh-token rotation), rate limiting, and BullMQ workers (seat-hold expiry,
emails).

---

## Stack

| Layer      | Choice                                        | Why                                                        |
| ---------- | --------------------------------------------- | ---------------------------------------------------------- |
| Runtime    | Node ≥ 20 (ESM)                               | `node:test` built-in runner, native `fetch`, no bundler    |
| Framework  | Fastify 5                                     | schema-less plugins (`@fastify/router`-style), typed errors|
| Database   | PostgreSQL 16 (Docker)                        | transactional seat holds, JSONB payloads, FK integrity     |
| Cache      | Redis 7 (Docker)                              | sessions, rate-limit counters, BullMQ                     |
| Auth       | jose (HS256) + rotating refresh cookies       | stateless access tokens, revocable rotating refresh        |
| Validation | zod                                           | runtime-safe input at the route boundary                   |
| Queues     | BullMQ (seat expiry, email)                   | delayed idempotent jobs                                    |
| Payments   | Razorpay (mock when keys absent)              | full webhook/verify/refund flow testable offline           |

## Folder map

```
server/
├── src/
│   ├── index.js          # Fastify assembly: plugins, raw-body parser, error handler, boot
│   ├── env.js            # typed env parsing (fail-fast in production)
│   ├── auth/guards.js    # requireAuth / requireAdmin / optionalAuth
│   ├── routes/           # auth, public, me, booking, admin, upload
│   ├── lib/              # jwt, sessions, cookies, passwords, seats, wallet, payments,
│   │                     #   webhook-events, reconcile, pricing, ids, errors, storage, mailer, quiz, interview
│   ├── db/               # pg pool + tx helper, ioredis
│   └── queues.js         # BullMQ queues/workers: seat expiry, emails, settlement, order sweeper
├── db/
│   ├── migrations/       # 0001_init.sql, 0002_webhook_events.sql, 0003_razorpay_payment_id_unique.sql
│   ├── migrate.js        # applies pending migrations, records applied set
│   ├── seed.js           # admin user + programmes + quiz banks + workspace defaults
│   └── seed-data/
├── test/                 # node:test suites (see "Testing" below)
│   ├── run-all.mjs       # `npm test` — runs every test/*.test.mjs, aggregates exit code
│   ├── helpers.mjs       # shared harness: isolated server boot + api() client + 429 retry
│   ├── integration.test.mjs
│   ├── auth.test.mjs     # token family / rotation hardening
│   ├── payments.test.mjs # webhook replay/verify/refund/sweep hardening
│   └── security.test.mjs # envelope hygiene, uploads, brute-force limiter
├── scripts/smoke.mjs     # route-by-route smoke against a live server (default :4000)
└── uploads/              # media + evidence files (docker volume in prod)
```

## Setup (local dev)

```bash
docker compose up -d db redis      # infra only; the api service is dev-run below
npm ci                             # exact lockfile install (no new deps needed)
npm run migrate                    # idempotent: applies pending db/migrations/*
npm run seed                       # admin user (admin@codetern.dev / admin123) + content
npm run dev                        # Fastify on :4000 (node --watch)
curl http://localhost:4000/health  # {"ok":true,"db":true,"redis":true,...}
```

Payments run in **mock mode** when `RAZORPAY_KEY_ID/SECRET` are empty (the
`.env` default): orders get deterministic `ord_mock_*` ids and every
payment/refund path still executes end-to-end.

## API surface

All JSON. Authenticated routes take `Authorization: Bearer <access>`; refresh
uses the `ct_refresh` httpOnly cookie. Error responses always use the
envelope, see below.

### Auth
| Method | Path | Auth | Purpose |
| --- | --- | --- | --- |
| POST | `/api/auth/signup` | — | `{name,email,password,referralCode?}` → 201 `{ok,referred,access,user}`, sets refresh cookie |
| POST | `/api/auth/login` | — | `{email,password}` → 200 `{ok,access,user}` + cookie |
| POST | `/api/auth/refresh` | cookie | rotates the refresh token, returns new access + cookie |
| POST | `/api/auth/logout` | cookie | invalidates the refresh session, clears cookie |
| GET | `/api/auth/me` | access | `{user, candidate, isAdmin}` |
| GET | `/api/files/:filename` | access | authenticated file read from `uploads/` |

### Public
| Method | Path | Purpose |
| --- | --- | --- |
| GET | `/api/programmes` | programmes with live seat maps |
| GET | `/api/programmes/:id` | single programme + seats |
| GET | `/api/seats` | full seat map `{seats: {<programme>: {<duration>: {total,sold,held,remaining}}}}` |
| GET | `/api/quiz/:domain` | public questions — answers/explanations stripped server-side |
| GET | `/api/me/candidate` | full candidate row (optional auth; 401 without) |

### Candidate journey
| Method | Path | Purpose |
| --- | --- | --- |
| GET | `/api/me` | full candidate row |
| PUT | `/api/me/profile` | `{domain,bio,...}` — advances step ≥ 2 |
| POST | `/api/me/quiz` | `{domain, answers}` → server-scored `{result:{score,passed}}` |
| PUT | `/api/me/workspace` | saves workspace state |
| POST | `/api/me/workspace/tasks/:index/submit` | evidence submission |
| GET | `/api/me/interview/questions` | interview question set |
| POST | `/api/me/interview` | `{answers}` → scored (local rubric unless OpenAI key set) |
| POST | `/api/me/cert` / `/api/me/lor` | issues cert / LOR (LOR gated 24h after cert) |
| POST | `/api/me/graduate` | archive + reset candidate |
| GET | `/api/me/wallet` | `{balance, transactions[]}` |
| POST | `/api/me/seats/hold` | `{domain,duration}` — atomic held+1, 409/400 when full |
| POST | `/api/me/seats/release` | `{domain,duration}` — held−1 (never below 0) |

### Booking & payments
| Method | Path | Auth | Purpose |
| --- | --- | --- | --- |
| POST | `/api/booking/order` | access | `{programmeSlug, duration}` (shipped code: `{domain, duration}` — see contract drift) → 201 `{order, seat}` + hold |
| GET | `/api/booking/order/:orderId` | owner/admin | order lifecycle state (poll target) |
| POST | `/api/booking/pay-mock` | admin | mock gateway settle `{orderId}` → 200; second call 409; students 401/403 |
| POST | `/api/booking/webhook` | signed | Razorpay event — HMAC-verified, replay-guarded, idempotent ledger |
| POST | `/api/booking/:orderId/verify` | owner/admin | instant checkout confirm (HMAC(orderId\|paymentId)) |
| POST | `/api/booking/:orderId/refund` | owner/admin | within 7d of `paid_at`; idempotent; 400 outside window |
| POST | `/api/booking/:orderId/cancel` | owner/admin | `created` orders → expired + hold released |
| GET | `/api/admin/reconcile?days=7` | admin | local payments vs gateway lookback |

### Admin
| Method | Path | Purpose |
| --- | --- | --- |
| GET/PATCH/DELETE | `/api/admin/candidates[/:id]` | candidate listing, patch, delete |
| POST | `/api/admin/candidates/:id/wallet/credit` | `{amount, reason}` (dedup `(source_type,source_id)`) |
| POST/PUT/DELETE | `/api/admin/programmes[/:id]` | create (seeds seat cells ×24), update, delete (cascade) |
| GET/PUT/PATCH/DELETE | `/api/admin/quiz`, `/api/admin/quiz/:domain`, `/api/admin/quiz/:domain/questions/:index` | question banks |
| GET/PUT | `/api/admin/workspace-defaults[/:domain]` | default task sets |
| GET/PUT/POST | `/api/admin/seats...` | map, override one cell, scale all, ensure cell |
| GET | `/api/admin/pricing` | batch pricing table |
| GET/POST/PUT/DELETE | `/api/admin/media[/:id]` | marketing media rows |
| POST | `/api/uploads` / `/api/uploads/media` | evidence / media upload (extension + magic-byte guards) |

### Error envelope

Every non-2xx response is `{ "error": { "code", "message", "details" } }` —
no stack traces, no raw pg errors. Common codes: `bad_request`, `unauthorized`,
`forbidden`, `not_found`, `conflict`, `rate_limited`, `internal`, `unavailable`,
`bad_gateway`. Unmapped SQL errors map via `pgErrorCode` (23505 → conflict, …).

---

## Failure-proofing

**Webhook signature / idempotency / replay**
- Every valid delivery is written to `webhook_events` (PK = payment event id).
  A re-delivery hits the PK → acked `{received:true}` with zero side effects.
- Settlement happens inside the same transaction as the ledger row
  (`settlePayment(..., client)`), so a crash mid-processing commits neither.
- In-flight duplicate protection: `payments.status` row lock means only
  `created` orders settle, ever (`WHERE order_id … FOR UPDATE` + status guard).
- Replays are dropped, not processed: a `payment.captured` with
  `created_at` older than 5 minutes is acked and discarded.
- `uq_payments_razorpay_payment_id` (partial unique) makes a payment id
  unforgeable across orders at the DB level too.

**Refund window**
- Refund is allowed only for `paid` orders within **7 days of `paid_at`**
  (`REFUND_WINDOW_MS`); after that the API answers 400 with a clear message.
- Refunding twice is idempotent: second call returns current `refunded`
  state with 200. A `WHERE status = 'paid'` guard makes concurrent refunds
  race-safe.

**Order expiry / seat holds**
- `POST /booking/order` increments `seats.held` atomically
  (`UPDATE … WHERE total-sold-held > 0`); a failed gateway call releases it
  immediately.
- Two expiry paths, both crash-safe and idempotent:
  1. BullMQ delayed job at `HOLD_TTL_MS` (10 min) — expires `created` orders.
  2. DB sweeper (`sweepExpiredOrders`, runs every 60s) — marks orders older
     than 30 min `expired` and releases holds; state derives from
     `payments.created_at`, so a restart never leaks a hold forever.
- `settleSeat` only ever moves `held → sold`; `releaseHold`/cancel use
  `GREATEST(held-1, 0)` so nobody can corrupt counts below zero. The
  `CHECK (sold+held <= total)` constraint backstops everything.

## Security notes

- **JWT rotation**: access tokens are short-lived (15m) HS256 bearer tokens.
  Refresh tokens rotate on every use; a presented-but-rotated token is treated
  as theft — `revokeFamily()` kills **every** live refresh session of the user
  in one pass (see `test/auth.test.mjs`).
- **Cookie flags**: `ct_refresh` is `httpOnly`, `SameSite=lax` (configurable),
  `Secure` via `COOKIE_SECURE=true` in production. Auth headers/cookies are
  redacted from all logs.
- **Rate limits**: global 300 req/min/IP; signup 8/min, login/refresh/logout
  10/min (per-route). Counters live in Redis — note they are shared per IP
  across every server instance pointing at the same Redis (see Testing).
- **Login timing**: unknown emails burn a real bcrypt compare and return the
  identical message as a wrong password — no account enumeration by timing.
- **Uploads**: admin-only routes; extension allowlist + magic-byte sniffing,
  8 MB cap, path traversal rejected (`..`, `/`), served under an auth-guarded
  file route, no directory listing.
- **Transport**: helmet headers, CORS allowlist (env `CORS_ORIGINS` +
  `PUBLIC_BASE_URL` host), `trustProxy` only in production (behind Caddy).

---

## Testing

```bash
npm test                                     # run-all: every suite, aggregated exit code
node --test test/integration.test.mjs        # a single suite, fast (~60-70 s worst case)
node scripts/smoke.mjs                       # route-by-route smoke against a LIVE server
```

- Suites are `node:test` files that boot their **own isolated server** via
  `child_process` on **PORT 4010** (dev server on :4000 is never touched);
  `test/helpers.mjs` falls back to an ephemeral port if 4010 is busy.
- The suites share the Postgres/Redis of the dev environment; each suite
  creates only uniquely-named fixtures (`itest-*`, `auth-test-*`, …) and
  deletes them in teardown. Failed/crashed runs can leave orphans — delete
  via `DELETE FROM users WHERE email LIKE '%@test.dev'` and programmes
  `LIKE 'itest-%'` (referrals/wallet/payments cascade).
- **Rate-limit interference is expected and handled**: per-route counters are
  keyed per IP in the shared Redis, so the dev server and concurrent suites
  drain the same budgets. `helpers.mjs` `api()` (and the other suites)
  transparently wait one window (65 s) and retry once on 429; suites that
  assert 429-by-design (`security.test.mjs`) end with a 65 s tail so the next
  suite starts fresh.
- `npm test` runs suites **sequentially** (`run-all.mjs`): every suite boots
  on 4010 and concurrent boots would collide on the port, and serializing
  keeps each suite inside its own rate-limit windows. Full run ≈ 3–4 min.

## Production runbook

### Environment

| Variable | Dev default | Production guidance |
| --- | --- | --- |
| `NODE_ENV` | development | `production` — removes dev secret warning, enables `trustProxy` |
| `PORT` | 4000 | behind Caddy: 4000 |
| `DATABASE_URL` | docker pg | managed Postgres (SSL), least-privilege user |
| `REDIS_URL` | local redis | managed/HA Redis (set `rediss:` for TLS) |
| `JWT_SECRET`, `JWT_REFRESH_SECRET` | dev-* | `node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"`, rotate quarterly |
| `COOKIE_SECURE` | false | `true` |
| `COOKIE_SAME_SITE` | lax | `lax` (or `none` + Secure only with an explicit CORS partner) |
| `CORS_ORIGINS` | :5173 | comma-separated allowlist |
| `PUBLIC_BASE_URL` | localhost | canonical public origin |
| `RAZORPAY_*` | empty (mock) | real keys + webhook secret; **mock pay-mock route must be production-gated** |
| `RESEND_API_KEY` | empty (log) | transactional email |
| `OPENAI_API_KEY` | empty (rubric) | AI interview scoring |
| `UPLOAD_DIR` / `UPLOAD_MAX_MB` | ./uploads / 8 | persistent volume, 8 |

### Reverse proxy (Caddy — gzip + TLS in a few lines)

```
codetern.example.com {
    encode gzip zstd        # @fastify/static + API responses
    reverse_proxy localhost:4000
    request_header X-Forwarded-Proto https
}
```
nginx equivalent: `gzip on; gzip_types application/json text/css …;` +
`proxy_set_header X-Forwarded-Proto $scheme;` with `proxy_buffering off` if
streaming is added later.

### Operational cadence

- **Health**: poll `/health` (db+redis) and `/health/live` (liveness);
  the process refuses to serve if infra is down at boot.
- **Reconciliation**: run `GET /api/admin/reconcile?days=7` nightly (or call
  `reconcileOrders` via a cron job) so local `payments` vs gateway drift is
  visible; mock mode returns DB-only stats.
- **Backups**: nightly Postgres dump (`pg_dump`) + weekly restore drill;
  Redis is append-only in docker-compose but is a cache — losing it only
  invalidates sessions/rate windows (users re-login).
- **Deploys**: `npm ci && npm run migrate && npm run seed && npm start`;
  migrations are additive + idempotent — safe to run before the new image
  accepts traffic. Restart the container after deploy (workers live in-process).
- **Logs**: pino JSON on stdout with auth/cookies redacted; ship to ELK/DD.

---

## Performance & indexes

Audited against `db/migrations/0001_init.sql` (+ 0002/0003):

| Access path | Index | Status |
| --- | --- | --- |
| login by email | `users.email UNIQUE` | ✅ already indexed |
| account by id (`requireAuth` every request) | `users.id` PK | ✅ already indexed |
| candidate by user (`/api/me/*`, wallet, booking) | `candidates.user_id UNIQUE` | ✅ (+ redundant `idx_candidates_user_id` btree — harmless, can drop) |
| referral lookup on signup | `candidates.referral_code UNIQUE` | ✅ |
| seat hold/settle/release (exact programme×duration) | `seats` PK `(programme_id, duration)` | ✅ perfect for the atomic UPDATE..WHERE |
| order by id (poll, pay-mock, verify, refund, sweeper) | `payments.order_id` PK | ✅ (sweeper index-scans `status='created'` via `idx_payments_status`) |
| payment id uniqueness (double-settle guard) | `uq_payments_razorpay_payment_id` (partial unique, 0003) | ✅ added alongside 0002 |
| hold key uniqueness | `payments.hold_key UNIQUE` | ✅ |
| wallet by candidate | `idx_wallet_tx_candidate` | ✅ |
| referral dedup (webhook retry never double-credits) | `wallet_transactions UNIQUE (source_type, source_id)` | ✅ |
| webhook replay ledger | PK `webhook_events.id` + status/received indexes | ✅ |
| FKs | all `REFERENCES … ON DELETE CASCADE` present | ✅ |

**Nothing further is needed at this scale.** The only candidate worth
revisiting later: a composite `payments(candidate_id, created_at DESC)` index
if admin reporting grows beyond tens of thousands of orders — the per-candidate
fan-out is currently tiny. `loadUser` per authed request is a PK point read
(sub-millisecond).

## Troubleshooting

| Symptom | Cause / fix |
| --- | --- |
| `npm run dev` exits "infrastructure not ready" | `docker compose up -d db redis`; check `\d tables` via `docker exec codetern-db psql -U codetern -d codetern` |
| 409 `conflict` on signup | email or referral code already exists — also thrown by `23505` for any unique violation |
| test suites see 429s | shared per-IP Redis counters; suites auto-retry after one window — a dev server being hammered can still starve CI (see Testing). |
| `paid_at` / `refunded` column missing | `npm run migrate` not applied — always migrate before (re)starting |
| uploads 403/400 | admin token missing / extension not in allowlist / > 8 MB / magic bytes mismatch |
| frontend CORS errors | add the origin to `CORS_ORIGINS` or serve under `PUBLIC_BASE_URL` |
| seats stuck `held` after a crash | the 30-min sweeper releases them; cancel via `POST /booking/:id/cancel` to force |
| `.env` edits not picked up | `npm run dev` uses `--watch` (process restarts); `start` needs a restart |

### Known contract drift (tracked from the QA suite)

- `POST /api/booking/order` — briefed contract field is `programmeSlug`;
  the shipped route reads `domain`. The integration suite sends
  `programmeSlug` first and adapts on a clear 400, logging a note.
- `POST /api/booking/pay-mock` blocks students with **401 `unauthorized`**
  (shipped), not 403 `forbidden`; the suite accepts either and notes it.
- `POST /api/booking/:orderId/refund` was initially missing and is now
  shipped (7-day window, idempotent, owner-only) — the suite asserts its
  current semantics and skips with a note if it ever vanishes again.