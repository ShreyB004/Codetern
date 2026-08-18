// Codetern upload/storage smoke tests: upload → serve → access-control → abuse.
// Usage: node scripts/storage-smoke.mjs [BASE_URL]
import { readFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { createHash } from 'node:crypto'

const here = path.dirname(fileURLToPath(import.meta.url))
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

const sha = (buf) => createHash('sha256').update(buf).digest('hex')

async function json(method, route, { token, body } = {}) {
  const opts = { method, headers: {} }
  if (token) opts.headers.Authorization = `Bearer ${token}`
  if (body !== undefined) {
    opts.headers['Content-Type'] = 'application/json'
    opts.body = JSON.stringify(body)
  }
  const res = await fetch(`${API}${route}`, opts)
  const text = await res.text()
  let data = null
  try { data = text ? JSON.parse(text) : null } catch { /* non-json */ }
  return { status: res.status, data, text }
}

async function upload(token, bytes, filename, mime) {
  const form = new FormData()
  form.append('file', new Blob([bytes], { type: mime }), filename)
  const res = await fetch(`${API}/uploads`, {
    method: 'POST',
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: form,
  })
  const text = await res.text()
  let data = null
  try { data = text ? JSON.parse(text) : null } catch { /* non-json */ }
  return { status: res.status, data, text }
}

async function get(url, token) {
  const res = await fetch(url, { headers: token ? { Authorization: `Bearer ${token}` } : {} })
  const buf = Buffer.from(await res.arrayBuffer())
  return { status: res.status, type: res.headers.get('content-type') || '', buf }
}

async function main() {
  console.log(`\n[storage smoke] target ${API}`)

  // ── auth setup ────────────────────────────────────────────────────
  const adminLogin = await json('POST', '/auth/login', { body: { email: 'admin@codetern.dev', password: 'admin123' } })
  check('admin login', adminLogin.status === 200 && adminLogin.data?.access, adminLogin.status)
  const adminToken = adminLogin.data?.access

  const email = `storage-${Date.now()}@test.dev`
  const signup = await json('POST', '/auth/signup', { body: { name: 'Storage Tester', email, password: 'password123' } })
  check('student signup', signup.status === 201 && signup.data?.access, signup.status)
  const studentToken = signup.data?.access

  // ── upload ────────────────────────────────────────────────────────
  console.log('\nupload')
  const magic = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])
  const payload = Buffer.concat([magic, Buffer.alloc(248, 0x7a)])
  const up = await upload(adminToken, payload, 'tiny.png', 'image/png')
  check('upload admin → 201 + meta', up.status === 201 && up.data?.ok === true && up.data?.sha256 === sha(payload) && up.data?.size === payload.length, up.text?.slice(0, 160))
  const fn = up.data?.filename
  check('generated filename shape', typeof fn === 'string' && /^[0-9a-z]{7,16}-[0-9a-f]{12}\.(jpe?g|png|webp|svg|gif|pdf|txt|json|zip)$/i.test(fn), fn)
  check('url points at /files/<name>', up.data?.url?.endsWith(`/files/${fn}`), up.data?.url)

  const denied = await upload(studentToken, payload, 'tiny.png', 'image/png')
  check('upload as student → 403', denied.status === 403, denied.status)

  const noFile = await fetch(`${API}/uploads`, { method: 'POST', headers: { Authorization: `Bearer ${adminToken}` }, body: new FormData() })
  check('upload without file → 400', noFile.status === 400, noFile.status)

  const badMime = await upload(adminToken, Buffer.from('MZ'), 'evil.exe', 'application/x-msdownload')
  check('disallowed mime → 400', badMime.status === 400 && (badMime.data?.error?.message || '').includes('not allowed'), badMime.text?.slice(0, 120))

  const empty = await upload(adminToken, Buffer.alloc(0), 'empty.png', 'image/png')
  check('empty file → 400', empty.status === 400, empty.status)

  const maxMb = Number(readFileSync(path.join(here, '..', '.env'), 'utf8').match(/UPLOAD_MAX_MB=(\d+)/)?.[1] || 8)
  const oversize = await upload(adminToken, Buffer.alloc((maxMb + 1) * 1024 * 1024, 0x61), 'huge.png', 'image/png')
  check(`oversize (>${maxMb}MB) → 413 payload_too_large`, oversize.status === 413 && oversize.data?.error?.code === 'payload_too_large', oversize.text?.slice(0, 120))

  // ── serving ───────────────────────────────────────────────────────
  console.log('\nserving')
  const pub = await get(`${BASE}/files/${fn}`)
  check('public GET serves file', pub.status === 200 && pub.type === 'image/png' && sha(pub.buf) === sha(payload), `${pub.status} ${pub.type}`)
  check('public GET as student also 200', (await get(`${BASE}/files/${fn}`, studentToken)).status === 200)

  const head = await fetch(`${BASE}/files/${fn}`, { method: 'HEAD' })
  check('HEAD serves headers', head.status === 200 && (head.headers.get('content-type') || '').includes('image/png'), head.status)

  const authed = await get(`${API}/files/${fn}`)
  check('api file route without token → 401', authed.status === 401)

  const authed2 = await get(`${API}/files/${fn}`, studentToken)
  check('api file route with token → 200 + bytes', authed2.status === 200 && authed2.type === 'image/png' && sha(authed2.buf) === sha(payload), `${authed2.status} ${authed2.type}`)

  const doc = await upload(adminToken, Buffer.from('plain text body'), 'notes.txt', 'text/plain')
  const docServe = await get(`${BASE}/files/${doc.data?.filename}`)
  check('text/plain upload serves as text/plain', docServe.status === 200 && (docServe.type || '').includes('text/plain'), `${docServe.status} ${docServe.type}`)

  // ── media registration end-to-end ─────────────────────────────────
  console.log('\nmedia')
  const form = new FormData()
  form.append('name', 'storage-smoke')
  form.append('slot', 'storage-smoke-slot')
  form.append('kind', 'image')
  form.append('file', new Blob([payload], { type: 'image/png' }), 'banner.png')
  const mediaRes = await fetch(`${API}/uploads/media`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${adminToken}` },
    body: form,
  })
  const mediaText = await mediaRes.text()
  let media = null
  try { media = mediaText ? JSON.parse(mediaText) : null } catch { /* non-json */ }
  check('uploads/media registers media', mediaRes.status === 201 && media?.media?.id && media?.media?.slot === 'storage-smoke-slot', mediaText.slice(0, 160))
  const mediaFile = media?.media?.url?.split('/').pop()
  if (mediaFile) {
    const mediaServe = await get(`${BASE}/files/${mediaFile}`)
    check('registered media serves', mediaServe.status === 200 && sha(mediaServe.buf) === sha(payload), `${mediaServe.status}`)
  } else {
    check('registered media serves', false, 'no media url')
  }

  // ── abuse / hardening ─────────────────────────────────────────────
  console.log('\nabuse')
  const missing = await get(`${BASE}/files/does-not-exist.png`)
  check('missing file → 404 json', missing.status === 404 && missing.buf.toString().includes('not_found'), `${missing.status} ${missing.buf.toString().slice(0, 80)}`)

  const dotfile = await get(`${BASE}/files/.env`)
  check('dotfile not servable → 404', dotfile.status === 404, dotfile.status)

  const rootList = await get(`${BASE}/files/`)
  check('directory listing blocked → 404', rootList.status === 404, rootList.status)

  const dotPath = await get(`${BASE}/files/.`)
  check('dot path → 404', dotPath.status === 404, dotPath.status)

  const t1 = await get(`${BASE}/files/%2e%2e%2fpackage.json`)
  check('encoded traversal → 400', t1.status === 400, t1.status)

  const t2 = await get(`${BASE}/files/..%2fpackage.json`)
  check('partial encoded traversal → 400', t2.status === 400, t2.status)

  const t3 = await get(`${BASE}/files/../package.json`)
  const t3text = t3.buf.toString()
  check('raw traversal → 404 without leak', t3.status === 404 && !t3text.includes('dependencies'), `${t3.status} ${t3text.slice(0, 80)}`)

  const trailing = await get(`${BASE}/files/${fn}/`)
  check('trailing slash → 404', trailing.status === 404, trailing.status)

  const apiMissing = await get(`${API}/files/does-not-exist.png`, studentToken)
  check('api file route missing → 404 json', apiMissing.status === 404 && apiMissing.buf.toString().includes('not_found'), `${apiMissing.status}`)

  // ── summary ───────────────────────────────────────────────────────
  console.log(`\n${passed} passed, ${failed} failed`)
  if (failures.length) {
    console.log('failures:', failures.join(', '))
    process.exitCode = 1
  }
}

main().catch((err) => {
  console.error('storage smoke crashed:', err)
  process.exitCode = 1
})