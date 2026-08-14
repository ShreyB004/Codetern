import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { PROGRAMMES } from '../data/programmes.js'
import { buildCandidateSeed, DEFAULT_MEDIA } from '../data/seed.js'
import { getProgramme } from '../data/programmes.js'
import { QUIZ_BANKS } from '../data/quizData.js'
import { WORKSPACE_TASKS, DEFAULT_WORKSPACE } from '../data/workspace.js'
import { load, save, uid } from '../lib/store.js'

const AppCtx = createContext(null)

const SEED_USER = {
  id: 'admin-1',
  name: 'Platform Admin',
  email: 'admin@codetern.dev',
  password: 'admin123',
  role: 'admin',
  createdAt: '2026-01-01',
}

// journey order (2026): 1 book → 2 profile → 3 workspace → 4 assessment → 5 interview
const REFERRAL_REWARD = 50

function ensureAdmin(users) {
  return users.some((u) => u.email === SEED_USER.email) ? users : [SEED_USER, ...users]
}

function makeReferralCode(name = '') {
  const base = name
    .trim()
    .replace(/[^a-zA-Z]/g, '')
    .slice(0, 4)
    .toUpperCase() || 'CDT'
  return `${base}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`
}

export function AppProvider({ children }) {
  const [users, setUsers] = useState(() => ensureAdmin(load('users:v2', null) || []))
  const [currentUserId, setCurrentUserId] = useState(() => load('current:v2', null))
  const [candidates, setCandidates] = useState(() => load('candidates:v2', null) || buildCandidateSeed())
  const [programmes, setProgrammes] = useState(() => load('programmes:v1', null) || PROGRAMMES)
  const [media, setMedia] = useState(() => load('media:v1', null) || DEFAULT_MEDIA)
  const [quizBanks, setQuizBanks] = useState(() => load('quizbanks:v1', null) || QUIZ_BANKS)
  const [workspaceDefaults, setWorkspaceDefaults] = useState(
    () => load('workspacedefaults:v1', null) || { ...WORKSPACE_TASKS, default: DEFAULT_WORKSPACE },
  )

  useEffect(() => save('users:v2', users), [users])
  useEffect(() => save('current:v2', currentUserId), [currentUserId])
  useEffect(() => save('candidates:v2', candidates), [candidates])
  useEffect(() => save('programmes:v1', programmes), [programmes])
  useEffect(() => save('media:v1', media), [media])
  useEffect(() => save('quizbanks:v1', quizBanks), [quizBanks])
  useEffect(() => save('workspacedefaults:v1', workspaceDefaults), [workspaceDefaults])

  const currentUser = users.find((u) => u.id === currentUserId) || null
  const isAdmin = currentUser?.role === 'admin'
  const candidate = useMemo(
    () => (currentUser && !isAdmin ? candidates.find((c) => c.id === currentUser.id) || null : null),
    [currentUser, isAdmin, candidates],
  )

  // ── auth ────────────────────────────────────────────────
  const signup = useCallback(
    (name, email, password, referralCode = null) => {
      const clean = email.trim().toLowerCase()
      if (users.some((u) => u.email === clean)) return { error: 'An account with this email already exists.' }
      const id = uid('u')
      const now = new Date().toISOString().slice(0, 10)
      const code = makeReferralCode(name)
      const referred = referralCode ? candidates.find((c) => c.referralCode === referralCode.toUpperCase()) : null
      const newUser = { id, name, email: clean, password, role: 'student', createdAt: now, referralCode: code }
      const newCandidate = {
        id,
        name,
        email: clean,
        domain: null,
        domainTitle: null,
        step: 1,
        quizScore: null,
        quizPassed: false,
        interviewScore: null,
        appliedAt: now,
        status: 'pending',
        profile: null,
        quiz: null,
        interview: null,
        booking: null,
        cert: null,
        lor: null,
        payment: null,
        history: [],
        workspace: null,
        referralCode: code,
        referredBy: referred ? referred.id : null,
        wallet: { balance: 0, transactions: [] },
      }
      setUsers((prev) => [...ensureAdmin(prev), newUser])
      setCandidates((prev) => [...prev, newCandidate])
      setCurrentUserId(id)
      return { ok: true, referred: !!referred }
    },
    [users, candidates],
  )

  const login = useCallback(
    (email, password) => {
      const clean = email.trim().toLowerCase()
      const found = users.find((u) => u.email === clean && u.password === password)
      if (!found) return { error: 'Invalid email or password.' }
      setCurrentUserId(found.id)
      return { ok: true }
    },
    [users],
  )

  const logout = useCallback(() => {
    setCurrentUserId(null)
  }, [])

  // ── student progress (new journey order) ────────────────
  const updateCandidate = useCallback((id, patch) => {
    setCandidates((prev) => prev.map((c) => (c.id === id ? { ...c, ...patch } : c)))
  }, [])

  const creditWallet = useCallback((candidateId, amount, reason) => {
    setCandidates((prev) =>
      prev.map((c) =>
        c.id === candidateId
          ? {
              ...c,
              wallet: {
                balance: (c.wallet?.balance || 0) + amount,
                transactions: [
                  { id: uid('t'), amount, reason, at: new Date().toISOString() },
                  ...(c.wallet?.transactions || []),
                ],
              },
            }
          : c,
      ),
    )
  }, [])

  const saveBooking = useCallback(
    (domain, duration, extra = {}) => {
      if (!candidate) return null
      const firstBooking = !candidate.booking
      updateCandidate(candidate.id, {
        domain,
        domainTitle: getProgramme(domain)?.title || null,
        booking: { domain, duration, at: new Date().toISOString(), ...extra },
        step: Math.max(candidate.step, 1),
        status: 'active',
      })
      // Referral reward: referrer gets ₹50 once a referred friend confirms a seat.
      if (candidate.referredBy && firstBooking) {
        creditWallet(candidate.referredBy, REFERRAL_REWARD, `Referral reward — ${candidate.name.split(' ')[0]} booked a seat`)
      }
      return { firstBooking }
    },
    [candidate, updateCandidate, creditWallet],
  )

  const saveProfile = useCallback(
    (profile) => {
      if (!candidate) return
      updateCandidate(candidate.id, {
        profile,
        domain: profile.domain,
        domainTitle: getProgramme(profile.domain)?.title || null,
        step: Math.max(candidate.step, 2),
        appliedAt: candidate.appliedAt,
        status: 'active',
      })
    },
    [candidate, updateCandidate],
  )

  const updateWorkspace = useCallback(
    (workspace) => {
      if (!candidate) return
      const allDone = workspace.tasks?.length > 0 && workspace.tasks.every((t) => t.done)
      updateCandidate(candidate.id, { workspace, step: allDone ? Math.max(candidate.step, 3) : candidate.step })
    },
    [candidate, updateCandidate],
  )

  const saveQuizResult = useCallback(
    (bank, score, passed) => {
      if (!candidate) return
      updateCandidate(candidate.id, {
        quiz: { bank, score, passed, at: new Date().toISOString() },
        quizScore: score,
        quizPassed: passed,
        step: passed ? Math.max(candidate.step, 4) : candidate.step,
      })
    },
    [candidate, updateCandidate],
  )

  const saveInterview = useCallback(
    (interview) => {
      if (!candidate) return
      updateCandidate(candidate.id, {
        interview,
        interviewScore: interview?.score ?? null,
        step: Math.max(candidate.step, 5),
      })
    },
    [candidate, updateCandidate],
  )

  const claimCert = useCallback(() => {
    if (!candidate) return null
    const certId = `CDT-2026-${String(1000 + (candidate.id.charCodeAt(candidate.id.length - 1) * 7) % 8999).padStart(4, '0')}`
    updateCandidate(candidate.id, { cert: { id: certId, at: new Date().toISOString() } })
    return certId
  }, [candidate, updateCandidate])

  // LOR unlocks 24h after the certificate is issued.
  const LOR_UNLOCK_MS = 24 * 60 * 60 * 1000

  const requestLor = useCallback(() => {
    if (!candidate?.cert) return null
    if (Date.now() - new Date(candidate.cert.at).getTime() < LOR_UNLOCK_MS) return null
    const lorId = `LOR-2026-${String(2000 + (candidate.id.charCodeAt(0) * 11 + candidate.id.length) % 7999).padStart(4, '0')}`
    updateCandidate(candidate.id, { lor: { id: lorId, at: new Date().toISOString(), status: 'issued' } })
    return lorId
  }, [candidate, updateCandidate, LOR_UNLOCK_MS])

  // Graduate flow: archive the finished internship, start a fresh seat booking.
  const startNextInternship = useCallback(() => {
    if (!candidate) return null
    const entry = {
      domain: candidate.domain,
      domainTitle: candidate.domainTitle,
      duration: candidate.booking?.duration || null,
      cert: candidate.cert,
      lor: candidate.lor,
      completedAt: new Date().toISOString(),
    }
    updateCandidate(candidate.id, {
      history: [...(candidate.history || []), entry],
      domain: null,
      domainTitle: null,
      step: 1,
      quizScore: null,
      quizPassed: false,
      interviewScore: null,
      status: 'pending',
      profile: null,
      quiz: null,
      interview: null,
      booking: null,
      cert: null,
      lor: null,
      payment: null,
      workspace: null,
    })
    return entry
  }, [candidate, updateCandidate])

  // ── live project evidence: student submits → admin reviews ──
  const submitTaskWork = useCallback(
    (taskIndex, evidence) => {
      if (!candidate?.workspace) return
      const next = {
        ...candidate.workspace,
        tasks: candidate.workspace.tasks.map((t, i) =>
          i === taskIndex ? { ...t, done: false, status: 'pending', evidence: { ...evidence, at: new Date().toISOString() }, review: null } : t,
        ),
      }
      updateWorkspace(next)
    },
    [candidate, updateWorkspace],
  )

  const reviewTaskWork = useCallback(
    (candidateId, taskIndex, verdict, note = '') => {
      const c = candidates.find((x) => x.id === candidateId)
      if (!c?.workspace) return
      const approved = verdict === 'approve'
      const tasks = c.workspace.tasks.map((t, i) =>
        i === taskIndex
          ? { ...t, done: approved, status: approved ? 'approved' : 'revision', review: { verdict, note, at: new Date().toISOString() } }
          : t,
      )
      const allDone = tasks.length > 0 && tasks.every((t) => t.done)
      updateCandidate(candidateId, { workspace: { ...c.workspace, tasks }, step: allDone ? Math.max(c.step, 3) : c.step })
    },
    [candidates, updateCandidate],
  )

  // ── checkout draft (step-1 → /checkout handoff) ──────────
  const [bookingDraft, setBookingDraft] = useState(() => load('bookingdraft:v1', null))
  useEffect(() => save('bookingdraft:v1', bookingDraft), [bookingDraft])

  // ── admin: programmes ───────────────────────────────────
  const addDomain = useCallback((domain) => {
    setProgrammes((prev) => [...prev, domain])
  }, [])

  const updateDomain = useCallback((id, patch) => {
    setProgrammes((prev) => prev.map((p) => (p.id === id ? { ...p, ...patch } : p)))
  }, [])

  const removeDomain = useCallback((id) => {
    setProgrammes((prev) => prev.filter((p) => p.id !== id))
  }, [])

  // ── admin: candidates ───────────────────────────────────
  const updateCandidateAdmin = useCallback((id, patch) => updateCandidate(id, patch), [updateCandidate])
  const removeCandidate = useCallback((id) => {
    setCandidates((prev) => prev.filter((c) => c.id !== id))
  }, [])

  const updateWorkspaceFor = useCallback((id, workspace) => {
    updateCandidate(id, { workspace })
  }, [updateCandidate])

  // ── admin: quiz banks ───────────────────────────────────
  const updateQuizBank = useCallback((domain, bank) => {
    setQuizBanks((prev) => ({ ...prev, [domain]: bank }))
  }, [])

  const setQuestionEnabled = useCallback((domain, index, enabled) => {
    setQuizBanks((prev) => {
      const bank = prev?.[domain]
      if (!bank) return prev
      const questions = bank.questions.map((q, i) => (i === index ? { ...q, enabled } : q))
      return { ...prev, [domain]: { ...bank, questions } }
    })
  }, [])

  const upsertQuestion = useCallback((domain, question, index) => {
    setQuizBanks((prev) => {
      const bank = prev?.[domain] || { minutes: 5, questions: [] }
      let questions
      if (index == null) {
        questions = [...bank.questions, { ...question, enabled: question.enabled !== false }]
      } else {
        questions = bank.questions.map((q, i) => (i === index ? { ...question, enabled: q.enabled !== false } : q))
      }
      return { ...prev, [domain]: { minutes: bank.minutes, questions } }
    })
  }, [])

  const removeQuestion = useCallback((domain, index) => {
    setQuizBanks((prev) => {
      const bank = prev?.[domain]
      if (!bank) return prev
      return { ...prev, [domain]: { ...bank, questions: bank.questions.filter((_, i) => i !== index) } }
    })
  }, [])

  // ── admin: workspace defaults ───────────────────────────
  const updateWorkspaceDefault = useCallback((domain, workspace) => {
    setWorkspaceDefaults((prev) => ({ ...prev, [domain]: workspace }))
  }, [])

  // ── admin/cms: media ────────────────────────────────────
  const addMedia = useCallback((item) => {
    setMedia((prev) => [...prev, { ...item, id: uid('m') }])
  }, [])

  const updateMedia = useCallback((id, patch) => {
    setMedia((prev) => prev.map((m) => (m.id === id ? { ...m, ...patch } : m)))
  }, [])

  const removeMedia = useCallback((id) => {
    setMedia((prev) => prev.filter((m) => m.id !== id))
  }, [])

  const value = useMemo(
    () => ({
      users,
      currentUser,
      isAuthenticated: !!currentUser,
      isAdmin,
      candidate,
      signup,
      login,
      logout,
      saveProfile,
      saveQuizResult,
      saveInterview,
      saveBooking,
      claimCert,
      requestLor,
      startNextInternship,
      submitTaskWork,
      reviewTaskWork,
      bookingDraft,
      setBookingDraft,
      updateWorkspace,
      creditWallet,
      candidates,
      updateCandidateAdmin,
      removeCandidate,
      programmes,
      addDomain,
      updateDomain,
      removeDomain,
      media,
      addMedia,
      updateMedia,
      removeMedia,
      quizBanks,
      updateQuizBank,
      setQuestionEnabled,
      upsertQuestion,
      removeQuestion,
      workspaceDefaults,
      updateWorkspaceFor,
      updateWorkspaceDefault,
    }),
    [
      users,
      currentUser,
      isAdmin,
      candidate,
      signup,
      login,
      logout,
      saveProfile,
      saveQuizResult,
      saveInterview,
      saveBooking,
      claimCert,
      requestLor,
      startNextInternship,
      submitTaskWork,
      reviewTaskWork,
      bookingDraft,
      setBookingDraft,
      updateWorkspace,
      creditWallet,
      candidates,
      updateCandidateAdmin,
      removeCandidate,
      programmes,
      addDomain,
      updateDomain,
      removeDomain,
      media,
      addMedia,
      updateMedia,
      removeMedia,
      quizBanks,
      updateQuizBank,
      setQuestionEnabled,
      upsertQuestion,
      removeQuestion,
      workspaceDefaults,
      updateWorkspaceFor,
      updateWorkspaceDefault,
    ],
  )

  return <AppCtx.Provider value={value}>{children}</AppCtx.Provider>
}

export function useApp() {
  const ctx = useContext(AppCtx)
  if (!ctx) throw new Error('useApp must be used within AppProvider')
  return ctx
}

// Convenience for components that only need auth surface.
export function useAuth() {
  const { currentUser, isAdmin, signup, login, logout, candidate } = useApp()
  return {
    user: currentUser,
    isAuthenticated: !!currentUser,
    isAdmin,
    candidate,
    signup,
    login,
    logout,
  }
}
