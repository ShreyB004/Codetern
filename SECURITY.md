# Codetern LMS — Security Notes

## What's enforced (and where)

| Concern | Enforcement |
|---|---|
| 30-day sign-in expiry | Client: `src/lib/session.js` + `AuthContext` — restored Firebase sessions older than 30 days are signed out, user must re-login. Firebase's own ID tokens still refresh hourly; the 30-day window is our product rule. |
| Database authorization | **Server-side: `database.rules.json`** — deploy with `firebase deploy --only database`. Client role checks (`RequireAdmin`, `isAdmin`) are UX conveniences only. |
| Public write abuse | Join/contact forms are create-only and force `status: requested/new`; chat capped at 800 chars by rules; inputs capped client-side too. |
| Task completion integrity | `taskState` rules: students can only move their own rows between `in-progress`/`submitted`; `completed` is admin-only and locked once set. |
| Clickjacking / MIME sniffing | `vercel.json` headers (`DENY` framing, `nosniff`, strict referrer). |
| Secrets | No secrets in the repo. The Firebase `apiKey` in `src/lib/firebase.js` is a public browser key by design (it only identifies the project); authorization lives in `database.rules.json`. Storage is intentionally unused. |
| Logging | No `console.log` of user data in `src/`; toasts never render raw HTML. Admin-authored rich text is the only `dangerouslySetInnerHTML` surface. |

## Deploy checklist

1. `firebase deploy --only database` (publishes `database.rules.json`).
2. Firebase Console → Authentication → enable Google provider; add production domain to authorized domains.
3. Confirm `shreybhangale@gmail.com` is the admin allowlist in both `src/lib/firebase.js` (`ADMIN_EMAIL`) and `database.rules.json`.
4. After deploying rules, re-test: anonymous join submit, student claim flow, admin approve, task submit → complete.

## Known limitations / next steps

- Reads are "any signed-in user" scoped (needed for the email-match claim flow). Per-row scoping (RTDB query rules on `enrollments`) is the natural hardening once UIDs are backfilled for all students.
- No rate limiting on public form endpoints — consider Firebase App Check if spam appears.
- Avatar images load from Google with `referrerPolicy="no-referrer"` and an initial-letter fallback.
