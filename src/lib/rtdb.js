import { ref, push, set, update, remove, onValue, serverTimestamp } from 'firebase/database'
import { db } from './firebase.js'

function mustDb() {
  if (!db) throw new Error('Firebase RTDB not configured')
  return db
}

export const safeKey = (v) => String(v || 'guest').replace(/[.#$/[\]]/g, '_')

export function sameEmail(a, b) {
  return String(a || '').toLowerCase().trim() === String(b || '').toLowerCase().trim() && !!a
}

function baseMeta(source) {
  return {
    createdAt: serverTimestamp(),
    source: source || 'website',
    page: typeof window !== 'undefined' ? window.location.pathname : null,
  }
}

/* ── Join flow ─────────────────────────────────────────────
   Student fills Join form → joinRequests (requested) → Google Form
   → admin approves → enrollment created → LMS unlocks on login. */
export async function saveJoinRequest(payload) {
  const keyRef = push(ref(mustDb(), 'joinRequests'))
  await set(keyRef, { ...payload, status: 'requested', ...baseMeta('join-form') })
  return keyRef.key
}

export async function setJoinStatus(id, status) {
  await update(ref(mustDb(), `joinRequests/${id}`), { status, decidedAt: Date.now() })
}

export async function approveJoinRequest(req) {
  const database = mustDb()
  await update(ref(database, `joinRequests/${req.id}`), { status: 'approved', decidedAt: Date.now() })
  const keyRef = push(ref(database, 'enrollments'))
  await set(keyRef, {
    uid: req.uid || null,
    email: req.email,
    name: req.fullName || req.name,
    courseId: req.courseId,
    planId: req.planId || 'batch-tutoring',
    linkedin: req.linkedin || '',
    github: req.github || '',
    status: 'active',
    fromJoin: req.id,
    ...baseMeta('admin-approve'),
  })
  // carry profile links onto the user record when we know the uid
  if (req.uid && (req.linkedin || req.github)) {
    try {
      await update(ref(database, `users/${req.uid}`), {
        linkedin: req.linkedin || '', github: req.github || '',
      })
    } catch { /* best-effort */ }
  }
  return keyRef.key
}

// Attach a logged-in uid to email-matched enrollments (the LMS unlock).
export async function claimEnrollments(uid, email, rows) {
  const database = mustDb()
  const jobs = (rows || [])
    .filter((e) => sameEmail(e.email, email) && e.uid !== uid)
    .map((e) => update(ref(database, `enrollments/${e.id}`), { uid }))
  if (jobs.length) await Promise.all(jobs)
  return jobs.length
}

/* ── legacy collectors ── */
export async function saveLead(payload, source = 'lead-form') {
  const keyRef = push(ref(mustDb(), 'leads'))
  await set(keyRef, { ...payload, status: 'new', ...baseMeta(source) })
  return keyRef.key
}

export async function saveContact(payload, source = 'contact-page') {
  const keyRef = push(ref(mustDb(), 'contacts'))
  await set(keyRef, { ...payload, status: 'new', ...baseMeta(source) })
  return keyRef.key
}

export async function updateLeadStatus(path, id, status) {
  await update(ref(mustDb(), `${path}/${id}`), { status })
}

/* ── Tasks ─────────────────────────────────────────────────
   Admin: full CRUD. Student: view + take on + submit.
   Completion is STRICTLY admin-controlled via taskState. */
export async function createTask({ courseId, title, detailHTML, due }) {
  const keyRef = push(ref(mustDb(), 'tasks'))
  await set(keyRef, { courseId, title, detailHTML: detailHTML || '', due: due || '', ...baseMeta('task') })
  return keyRef.key
}

export async function updateTask(id, patch) {
  await update(ref(mustDb(), `tasks/${id}`), { ...patch, updatedAt: Date.now() })
}

export async function deleteTask(id) {
  await remove(ref(mustDb(), `tasks/${id}`))
}

// Student starts a task (in-progress) — completion stays admin-only.
export async function takeOnTask(taskId, uid) {
  await set(ref(mustDb(), `taskState/${taskId}/${safeKey(uid)}`), {
    uid, status: 'in-progress', updatedAt: Date.now(),
  })
}

// Student submits work → status submitted ("ask admin to check").
export async function submitTask({ taskId, uid, name, link, note }) {
  const database = mustDb()
  const keyRef = push(ref(database, `taskSubmissions/${taskId}`))
  await set(keyRef, { uid, author: name, link, note: note || '', status: 'submitted', ...baseMeta('task-submit') })
  await set(ref(database, `taskState/${taskId}/${safeKey(uid)}`), {
    uid, status: 'submitted', link, updatedAt: Date.now(),
  })
  return keyRef.key
}

// STRICTLY admin: completed | pending (re-open).
export async function setTaskState(taskId, uid, status) {
  await update(ref(mustDb(), `taskState/${taskId}/${safeKey(uid)}`), {
    uid, status, updatedAt: Date.now(),
  })
}

export function isOverdue(due) {
  if (!due) return false
  const end = new Date(`${due}T23:59:59`)
  return !Number.isNaN(end.getTime()) && Date.now() > end.getTime()
}

// Display state: completed wins, then failed-if-overdue, else stored state.
export function displayTaskState(stored, due) {
  if (stored === 'completed') return 'completed'
  if (stored !== 'completed' && isOverdue(due)) return 'failed'
  return stored || 'pending'
}

/* ── Attendance (dual-write, Google Meet marked manually) ── */
export async function markAttendance({ date, courseId, uid, name, present }) {
  const database = mustDb()
  const sk = safeKey(uid)
  const row = { uid, name, present: !!present, markedAt: Date.now() }
  await set(ref(database, `attendance/${courseId}/${date}/${sk}`), row)
  // per-student mirror — this is what the student app reads (never misses)
  await set(ref(database, `attendanceByStudent/${sk}/${courseId}/${date}`), { present: !!present, markedAt: Date.now() })
}

/* ── Messages: merged model ────────────────────────────────
   messages/everyone            → broadcast (merged w/ legacy global)
   mentorChats/{studentUid}     → private mentor thread per student */
export async function sendMessage(scope, { name, text, uid, important = false }) {
  const keyRef = push(ref(mustDb(), `messages/${scope}`))
  await set(keyRef, {
    name: (name || 'Mentor').slice(0, 40),
    text: String(text || '').slice(0, 800),
    uid: uid || null, important: !!important, ts: Date.now(),
  })
  return keyRef.key
}

export async function sendMentorMessage(studentUid, { name, text, uid, important = false }) {
  const keyRef = push(ref(mustDb(), `mentorChats/${safeKey(studentUid)}`))
  await set(keyRef, {
    name: (name || 'Mentor').slice(0, 40),
    text: String(text || '').slice(0, 800),
    uid: uid || null, important: !!important, ts: Date.now(),
  })
  return keyRef.key
}

export async function deleteThreadMessage(path, id) {
  await remove(ref(mustDb(), `${path}/${id}`))
}

export async function updateThreadMessage(path, id, text) {
  await update(ref(mustDb(), `${path}/${id}`), { text: String(text || '').slice(0, 800), edited: true })
}

// legacy helpers (kept for old callers)
export async function deleteMessage(scope, id) {
  return deleteThreadMessage(`messages/${scope}`, id)
}
export async function updateMessage(scope, id, text) {
  return updateThreadMessage(`messages/${scope}`, id, text)
}
export async function sendChatMessage(courseId, { name, text }) {
  return sendMessage(courseId, { name, text })
}

/* ── Progress + PR reviews ── */
export async function saveUnitProgress({ userKey, courseId, unitId, done }) {
  const key = safeKey(userKey)
  await update(ref(mustDb(), `progress/${key}/${courseId}`), {
    [unitId]: { done: !!done, ts: serverTimestamp() },
    updatedAt: serverTimestamp(),
  })
  try {
    const raw = JSON.parse(localStorage.getItem('cdt:progress') || '{}')
    raw[`${courseId}:${unitId}`] = !!done
    localStorage.setItem('cdt:progress', JSON.stringify(raw))
  } catch { /* noop */ }
}

export async function submitPR({ uid, name, courseId, prUrl, notes }) {
  const keyRef = push(ref(mustDb(), 'reviews'))
  await set(keyRef, { uid, author: name, courseId, prUrl, notes: String(notes || '').slice(0, 1000), status: 'pending', ...baseMeta('pr-submit') })
  return keyRef.key
}

export async function reviewPR(id, status, feedback = '') {
  await update(ref(mustDb(), `reviews/${id}`), { status, feedback, reviewedAt: Date.now() })
}

/* ── Profiles ── */
export async function saveProfile(uid, patch) {
  await update(ref(mustDb(), `users/${uid}`), { ...patch, updatedAt: Date.now() })
}

/* ── Fees: 3 installments per student (admin-controlled) ──── */
export async function setFee(uid, idx, status) {
  await update(ref(mustDb(), `fees/${safeKey(uid)}`), { [`i${idx}`]: status, updatedAt: Date.now() })
}

export async function setUserEnrollments(uid, status, allEnrollments, email = null) {
  const database = mustDb()
  // match by uid, falling back to email so never-logged-in rows flip too
  const mine = (allEnrollments || []).filter(
    (e) => e.uid === uid || (email && sameEmail(e.email, email)),
  )
  await Promise.all(mine.map((e) => update(ref(database, `enrollments/${e.id}`), { status })))
  return mine.length
}

/* ── Site content CMS (admin-editable copy) ── */
export async function saveSiteSection(section, data) {
  await update(ref(mustDb(), `siteContent/${section}`), { ...data, updatedAt: Date.now() })
}

export function subscribeDoc(path, cb) {
  if (!db) {
    cb(null)
    return () => {}
  }
  return onValue(ref(db, path), (snap) => cb(snap.val() || null))
}

/* ── generic list subscription ── */
export function subscribeList(path, cb) {
  if (!db) {
    cb([])
    return () => {}
  }
  const r = ref(db, path)
  return onValue(r, (snap) => {
    const val = snap.val() || {}
    if (Array.isArray(val)) {
      cb(val.map((v, i) => ({ id: String(i), ...v })))
      return
    }
    const rows = Object.entries(val).map(([id, v]) => ({ id, ...(typeof v === 'object' && v !== null ? v : { value: v }) }))
      .sort((a, b) => (b.createdAt || b.ts || b.markedAt || 0) - (a.createdAt || a.ts || a.markedAt || 0))
    cb(rows)
  })
}
