# Codetern — The Internship Simulator

React + Vite frontend (JSX, no TypeScript) backed by a Fastify API in `server/`.

## Run with backend

The frontend talks to the real API instead of mocks by default.

1. Start the API (Fastify + Postgres + Redis):

   ```sh
   npm run dev:api
   ```

   (or `cd server && npm run dev`; the server expects `DATABASE_URL` and
   `REDIS_URL` from `server/.env` — run `npm run migrate && npm run seed`
   inside `server/` on first setup.)

2. Start the Vite dev server:

   ```sh
   npm run dev
   ```

   Vite proxies `/api/*` to `http://localhost:4000` (see `vite.config.js`).
   Set `VITE_API_URL` in a root `.env` to point the app at a different API
   base instead of the proxy.

3. Demo flow: sign up → verify the seat counters update → book a batch →
   checkout (mock mode pays instantly for the admin account; Razorpay mode
   needs `RAZORPAY_KEY_ID`/`RAZORPAY_KEY_SECRET` on the server and
   `VITE_RAZORPAY_KEY` on the client) → wallet and booking appear on the
   dashboard. Demo admin: `admin@codetern.dev / admin123`.

The UI keeps deterministic local fallbacks (seat map, candidate mirror) when
the API is unreachable, so the marketing site never hard-crashes offline.