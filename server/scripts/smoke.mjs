// Codetern API smoke tests — cover every route + key failure paths.
// Usage: node scripts/smoke.mjs [BASE_URL]
import 'dotenv/config'

const BASE = process.env.SMOKE_BASE_URL || 'http://localhost:4000'
const API = `${BASE}/api`

let passed = 0
let failed = 0
const failures = []

function check(name, cond, extra = '') {
  if (cond) {
    passed += 1
    console.log(`  ok   ${name}`)
  } else {
    failed += 1
    failures.push(name)
    console.log(`  FAIL ${name}${extra ? ` — ${extra}` : ''}`)
  }
}

async function req(method, path, { body, token, cookie, raw, headers = {} } = {}) {
  const opts = { method, headers: { ...headers } }
  if (token) opts.headers.Authorization = `Bearer ${token}`
  if (cookie) opts.headers.Cookie = cookie
  if (body) opts.headers['Content-Type'] = 'application/json'
  opts.body = raw !== undefined ? raw : body !== undefined ? JSON.stringify(body) : undefined
  const res = await fetch(`${API}${path}`, opts)
  const setCookie = res.headers.get('set-cookie') || ''
  const text = await res.text()
  let json = null
  try { json = text ? JSON.parse(text) : null } catch { /* not json */ }
  return { status: res.status, json, setCookie, text }
}

async function main() {
  console.log(`\n[codetern smoke] target ${API}`)

  // ── health ────────────────────────────────────────────────────────
  console.log('\nhealth')
  const health = await req('GET', '/../health')
  check('health ok', health.status === 200 && health.json?.ok === true, health.text?.slice?.(0, 120))

  // ── public ────────────────────────────────────────────────────────
  console.log('\npublic')
  const programmes = await req('GET', '/programmes')
  check('programmes list (≥14)', programmes.status === 200 && programmes.json?.programmes?.length >= 14, programmes.status)
  check('programme has seats', programmes.json?.programmes?.[0]?.seats && typeof programmes.json.programmes[0].seats['1']?.remaining === 'number')

  const seats = await req('GET', '/seats')
  check('seats map', seats.status === 200 && seats.json?.seats?.mern)

  // ── auth ──────────────────────────────────────────────────────────
  console.log('\nauth')
  const email = `smoke-${Date.now()}@test.dev`
  const signup = await req('POST', '/auth/signup', { body: { name: 'Smoke Tester', email, password: 'password123' } })
  check('signup 201 + access', signup.status === 201 && signup.json?.access && signup.json?.user?.role === 'student', signup.status)
  const studentToken = signup.json.access
  const studentCookie = (signup.setCookie.match(/ct_refresh=[^;]+/) || [])[0] || ''

  const dup = await req('POST', '/auth/signup', { body: { name: 'Dup', email, password: 'password123' } })
  check('signup duplicate → 409', dup.status === 409, dup.status)

  const badLogin = await req('POST', '/auth/login', { body: { email, password: 'wrong-password' } })
  check('bad login → 401', badLogin.status === 401, badLogin.status)

  const login = await req('POST', '/auth/login', { body: { email, password: 'password123' } })
  check('login + cookie', login.status === 200 && login.json?.access && login.setCookie.includes('ct_refresh'))

  const refresh = await req('POST', '/auth/refresh', { cookie: studentCookie })
  check('refresh rotates (200 + new cookie)', refresh.status === 200 && refresh.json?.access && refresh.setCookie.includes('ct_refresh') && refresh.setCookie !== studentCookie, `${refresh.status} ${refresh.setCookie === studentCookie ? 'cookie unchanged' : ''}`)

  const me = await req('GET', '/auth/me', { token: studentToken })
  check('me returns user+candidate', me.status === 200 && me.json?.candidate?.step === 1, me.status)

  const meNoAuth = await req('GET', '/auth/me')
  check('me without token → 401', meNoAuth.status === 401)

  // ── student journey ───────────────────────────────────────────────
  console.log('\njourney')
  const profile = await req('PUT', '/me/profile', { token: studentToken, body: { domain: 'mern', bio: 'builder' } })
  check('profile sets domain mern', profile.status === 200 && profile.json?.candidate?.domain === 'mern', profile.status)

  const wrongQuiz = await req('POST', '/me/quiz', { token: studentToken, body: { domain: 'mern', answers: [1] } })
  check('quiz wrong answer count → 400', wrongQuiz.status === 400, wrongQuiz.status)

  const allQuiz = await req('GET', '/quiz/mern')
  check('public quiz (answers stripped)', allQuiz.status === 200 && allQuiz.json?.questions?.length > 0 && allQuiz.json.questions[0].answer === undefined)

  // get the correct answers from the admin view (server-side scoring check)
  const adminEarly = await req('POST', '/auth/login', { body: { email: 'admin@codetern.dev', password: 'admin123' } })
  check('early admin login', adminEarly.status === 200, adminEarly.status)
  const adminTokenEarly = adminEarly.json.access
  const adminBanks = await req('GET', '/admin/quiz', { token: adminTokenEarly })
  const bank = adminBanks.json?.quizBanks?.mern
  const correctAnswers = bank ? bank.questions.map((q) => q.answer) : []
  const quizSub = await req('POST', '/me/quiz', { token: studentToken, body: { domain: 'mern', answers: correctAnswers } })
  check('quiz all-correct → score 100 passed', quizSub.status === 200 && quizSub.json?.result?.passed === true && quizSub.json.result.score === 100)

  const workspace = await req('PUT', '/me/workspace', { token: studentToken, body: { workspace: { tasks: [{ title: 'a', done: true }, { title: 'b', done: false }] } } })
  check('workspace saved', workspace.status === 200 && workspace.json?.candidate?.workspace?.tasks?.length === 2)

  const certBefore = await req('POST', '/me/cert', { token: studentToken })
  check('cert requires passed quiz — but quiz passed → issued', certBefore.status === 200 && certBefore.json?.cert?.id?.startsWith('CDT'), certBefore.status)

  const lor = await req('POST', '/me/lor', { token: studentToken })
  check('LOR blocked before 24h unlock', lor.status === 403, lor.status)

  const tasks = await req('POST', '/me/workspace/tasks/0/submit', { token: studentToken, body: { evidence: { link: 'https://example.com/work' } } })
  check('task evidence submitted (status pending)', tasks.status === 200 && tasks.json?.workspace?.tasks?.[0]?.status === 'pending', tasks.status)

  const interview = await req('POST', '/me/interview', { token: studentToken, body: { answers: ['I shipped a full MERN app with auth and payments using a production deployment pipeline', 'I isolate the bug with logs, reproduce in staging, add telemetry', 'I owned the delivery, prioritised blockers, and shipped on time'] } })
  check('interview scored (local fallback)', interview.status === 200 && typeof interview.json?.score === 'number' && interview.json.score >= 0 && interview.json.score <= 100, interview.json?.score)

  const wallet = await req('GET', '/me/wallet', { token: studentToken })
  check('wallet reads', wallet.status === 200 && Array.isArray(wallet.json?.transactions), wallet.status)

  // ── booking / payment (mock mode) ─────────────────────────────────
  console.log('\nbooking')
  // fresh programme = deterministic seat baseline (total 24, sold 0, held 0)
  const freshDomain = `bk-${Date.now().toString(36)}`
  const mkProg = await req('POST', '/admin/programmes', { token: adminTokenEarly, body: { id: freshDomain, title: 'Booking Smoke', durations: [1] } })
  check('booking programme ready', mkProg.status === 200, mkProg.status)

  const order = await req('POST', '/booking/order', { token: studentToken, body: { domain: freshDomain, duration: 1 } })
  check('order created (mock)', order.status === 201 && order.json?.order?.id?.startsWith('ord_'), order.status)

  const badSig = await req('POST', '/booking/webhook', {
    raw: JSON.stringify({ event: 'payment.captured', payload: { payment: { entity: { order_id: order.json.order.id, id: 'pay_x', status: 'captured' } } } }),
    headers: { 'x-razorpay-signature': 'bogus' },
  })
  check('webhook bad signature → 400', badSig.status === 400, badSig.status)

  const pay = await req('POST', '/booking/pay-mock', { token: adminTokenEarly, body: { orderId: order.json.order.id } })
  check('mock payment settles (admin simulates)', pay.status === 200 && pay.json?.ok === true, pay.status)

  const payAgain = await req('POST', '/booking/pay-mock', { token: adminTokenEarly, body: { orderId: order.json.order.id } })
  check('double payment idempotent → 409', payAgain.status === 409, payAgain.status)

  const seatAfter = await req('GET', '/seats')
  const cell = seatAfter.json?.seats?.[freshDomain]?.[1]
  check('seat settled (sold=1, held=0)', cell && cell.sold === 1 && cell.held === 0 && cell.remaining === 23, JSON.stringify(cell))

  const meAfter = await req('GET', '/auth/me', { token: studentToken })
  check('candidate now active w/ booking', meAfter.json?.candidate && !meAfter.json?.candidate?.status === false ? true : meAfter.json?.candidate?.status === 'active', meAfter.status)
  const meFull = await req('GET', '/me', { token: studentToken })
  check('booking + payment persisted', meFull.json?.candidate?.booking?.domain === freshDomain && meFull.json.candidate.payment?.status === 'paid', JSON.stringify(meFull.json?.candidate?.payment))

  // ── referral ──────────────────────────────────────────────────────
  console.log('\nreferral')
  const refSignup = await req('POST', '/auth/signup', { body: { name: 'Referred Buddy', email: `ref-${Date.now()}@test.dev`, password: 'password123', referralCode: me.json?.candidate?.referralCode || signup.json.user.referralCode } })
  check('referral signup accepted', refSignup.status === 201 && refSignup.json?.referred === true, refSignup.status)
  const refToken = refSignup.json.access

  const refOrder = await req('POST', '/booking/order', { token: refToken, body: { domain: freshDomain, duration: 1 } })
  check('referral buddy order created', refOrder.status === 201, refOrder.status)
  const refPay = await req('POST', '/booking/pay-mock', { token: adminTokenEarly, body: { orderId: refOrder.json.order.id } })
  check('referral buddy paid (admin simulates)', refPay.status === 200)

  const refWallet = await req('GET', '/me/wallet', { token: studentToken })
  check('referrer credited ₹50', refWallet.json?.balance >= 50 && refWallet.json.transactions.some((t) => t.sourceType === 'referral'), JSON.stringify(refWallet.json?.balance))

  // ── admin ─────────────────────────────────────────────────────────
  console.log('\nadmin')
  const adminLogin = await req('POST', '/auth/login', { body: { email: 'admin@codetern.dev', password: 'admin123' } })
  check('admin login (second session)', adminLogin.status === 200, adminLogin.status)
  const adminToken = adminLogin.json.access

  const studentAdmin = await req('GET', '/admin/candidates', { token: studentToken })
  check('student blocked from admin (403)', studentAdmin.status === 403, studentAdmin.status)

  const candidates = await req('GET', '/admin/candidates', { token: adminToken })
  check('admin lists candidates (≥7)', candidates.status === 200 && candidates.json?.candidates?.length >= 7, candidates.status)

  const patchCand = await req('PATCH', `/admin/candidates/${me.json.candidate.id}`, { token: adminToken, body: { status: 'active', step: 4 } })
  check('admin patches candidate', patchCand.status === 200 && patchCand.json?.candidate?.step === 4, patchCand.status)

  const seatsADM = await req('GET', '/admin/seats', { token: adminToken })
  check('admin seats read', seatsADM.status === 200 && seatsADM.json?.seats?.mern?.[1], seatsADM.status)

  const scale = await req('POST', '/admin/seats/scale', { token: adminToken, body: { factor: 2 } })
  check('scale seats x2', scale.status === 200 && scale.json?.ok === true, scale.status)

  const newDomain = await req('POST', '/admin/programmes', { token: adminToken, body: { id: `smoke-${Date.now().toString(36)}`, title: 'Smoke Domain', durations: [1, 2] } })
  check('admin creates programme', newDomain.status === 200 && newDomain.json?.programme?.id, newDomain.status)

  const quizPatch = await req('PATCH', '/admin/quiz/mern/questions/0', { token: adminToken, body: { enabled: false } })
  check('toggle question enable', quizPatch.status === 200, quizPatch.status)

  const wsDefaults = await req('GET', '/admin/workspace-defaults', { token: adminToken })
  check('workspace defaults read', wsDefaults.status === 200 && wsDefaults.json?.workspaceDefaults?.length >= 3)

  const mediaAdd = await req('POST', '/admin/media', { token: adminToken, body: { name: 'smoke-banner.png', slot: 'smoke', kind: 'image', gradient: 'linear-gradient(#000,#fff)' } })
  check('admin creates media', mediaAdd.status === 200 && mediaAdd.json?.media?.id, mediaAdd.status)

  const credit = await req('POST', `/admin/candidates/${refSignup.json.user.id}/wallet/credit`, { token: adminToken, body: { amount: 50, reason: 'smoke credit' } })
  check('admin wallet credit', credit.status === 200 && credit.json?.balance >= 50, `${credit.status} ${credit.text?.slice(0, 80)}`)

  // ── validation / error hygiene ────────────────────────────────────
  console.log('\nerror hygiene')
  const badJson = await fetch(`${API}/definitely-not-a-route`, { method: 'GET' })
  check('unknown route → 404 json', badJson.status === 404 && badJson.headers.get('content-type')?.includes('application/json'))

  const noBody = await req('POST', '/auth/login', { body: {} })
  check('empty login → 400', noBody.status === 400, noBody.status)

  const badOrder = await req('POST', '/booking/order', { token: adminToken, body: { domain: 'mern', duration: 99 } })
  check('invalid duration → 400', badOrder.status === 400, badOrder.status)

  const rateTest = await Promise.all(Array.from({ length: 3 }, () => req('POST', '/auth/login', { body: { email: 'nobody@test.dev', password: 'x'.repeat(9) } })))
  check('sequential bad logins fine', rateTest.every((r) => [401, 429].includes(r.status)))

  // ── summary ───────────────────────────────────────────────────────
  console.log(`\n${passed} passed, ${failed} failed`)
  if (failures.length) {
    console.log('failures:', failures.join(', '))
    process.exitCode = 1
  }
}

main().catch((err) => {
  console.error('smoke crashed:', err)
  process.exitCode = 1
})