import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { PROGRAMMES } from '../data/programmes.js'
import { buildCandidateSeed, DEFAULT_MEDIA } from '../data/seed.js'
import { getProgramme } from '../data/programmes.js'
import { QUIZ_BANKS } from '../data/quizData.js'
import { WORKSPACE_TASKS, DEFAULT_WORKSPACE } from '../data/workspace.js'
import { load, save, uid } from '../lib/store.js'
import { api, ApiError, setAccessToken, onAuthExpired } from '../lib/api.js'

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

// Server candidate rows (snake_case) → the local camelCase shape the UI expects.
function toLocalCandidate(row, wallet = null) {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    domain: row.domain ?? null,
    domainTitle: row.domain_title ?? null,
    step: row.step ?? 1,
    status: row.status ?? 'pending',
    appliedAt: row.applied_at ? String(row.applied_at).slice(0, 10) : null,
    quizScore: row.quiz_score ?? null,
    quizPassed: Boolean(row.quiz_passed),
    interviewScore: row.interview_score ?? null,
    profile: row.profile ?? null,
    booking: row.booking ?? null,
    quiz: row.quiz ?? null,
    interview: row.interview ?? null,
    cert: row.cert ?? null,
    lor: row.lor ?? null,
    payment: row.payment ?? null,
    workspace: row.workspace ?? null,
    history: row.history ?? [],
    referralCode: row.referral_code ?? null,
    referredBy: row.referred_by ?? null,
    wallet: {
      balance: row.wallet_balance ?? 0,
      transactions: wallet?.transactions ?? [],
    },
  }
}

export function AppProvider({ children }) {
  const [users] = useState(() => ensureAdmin(load('users:v2', null) || []))
  const [currentUserId, setCurrentUserId] = useState(() => load('current:v2', null))
  const [candidates, setCandidates] = useState(() => load('candidates:v2', null) || buildCandidateSeed())
  const [programmes, setProgrammes] = useState(() => load('programmes:v1', null) || PROGRAMMES)
  const [media, setMedia] = useState(() => load('media:v1', null) || DEFAULT_MEDIA)
  const [quizBanks, setQuizBanks] = useState(() => load('quizbanks:v1', null) || QUIZ_BANKS)
  const [workspaceDefaults, setWorkspaceDefaults] = useState(
    () => load('workspacedefaults:v1', null) || { ...WORKSPACE_TASKS, default: DEFAULT_WORKSPACE },
  )

  // Server-backed session state. The localStorage mirror below is only a
  // bootstrap/offline fallback; once /api/auth/me answers, the server wins.
  const [serverUser, setServerUser] = useState(null)
  const [serverCandidate, setServerCandidate] = useState(null)
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => save('users:v2', users), [users])
  useEffect(() => save('current:v2', currentUserId), [currentUserId])
  useEffect(() => save('candidates:v2', candidates), [candidates])
  useEffect(() => save('programmes:v1', programmes), [programmes])
  useEffect(() => save('media:v1', media), [media])
  useEffect(() => save('quizbanks:v1', quizBanks), [quizBanks])
  useEffect(() => save('workspacedefaults:v1', workspaceDefaults), [workspaceDefaults])

  const currentUser = serverUser ?? (users.find((u) => u.id === currentUserId) || null)
  const isAdmin = currentUser?.role === 'admin'

  // Adopt a server session: keep the user object, mirror the candidate row
  // into the local store so every journey-step helper keeps working.
  const adoptServerSession = useCallback(async (user) => {
    setServerUser(user)
    setCurrentUserId(user.id)
    if (user.role === 'admin') return
    try {
      const [full, wallet] = await Promise.all([api.get('/me/candidate'), api.get('/me/wallet')])
      const local = toLocalCandidate(full?.candidate, wallet)
      setServerCandidate(local)
      setCandidates((prev) => [local, ...prev.filter((c) => c.id !== local.id)])
    } catch {
      // API hiccup — the localStorage mirror covers the screen until retry.
    }
  }, [])

  // Re-read /auth/me + full candidate + wallet from the server (used after
  // payment settles and whenever the dashboard needs fresh progress).
  const refreshMe = useCallback(async () => {
    const u = currentUser
    if (!u) return null
    try {
      const me = await api.get('/auth/me')
      setServerUser(me.user)
      if (me.isAdmin) return me
      const [full, wallet] = await Promise.all([api.get('/me/candidate'), api.get('/me/wallet')])
      const local = toLocalCandidate(full?.candidate, wallet)
      setServerCandidate(local)
      setCandidates((prev) => [local, ...prev.filter((c) => c.id !== local.id)])
      return local
    } catch {
      return null
    }
  }, [currentUser])

  // On boot: probe the real session (refresh cookie) and hydrate when valid.
  useEffect(() => {
    let cancelled = false
    const clearSession = () => {
      setServerUser(null)
      setServerCandidate(null)
      setCurrentUserId(null)
    }
    const unsub = onAuthExpired(() => {
      if (!cancelled) clearSession()
    })

    ;(async () => {
      try {
        const me = await api.get('/auth/me')
        if (cancelled) return
        await adoptServerSession(me.user)
      } catch (err) {
        // A definitive 401 means the session is gone — drop the mirror too.
        if (!cancelled && err instanceof ApiError && err.code === 'unauthorized') clearSession()
        // Network errors keep the local mirror (offline-first, never crash).
      } finally {
        if (!cancelled) setHydrated(true)
      }
    })()

    return () => {
      cancelled = true
      unsub()
    }
  }, [adoptServerSession])

  const candidate = useMemo(() => {
    if (serverCandidate) return serverCandidate
    return currentUser && !isAdmin ? candidates.find((c) => c.id === currentUser.id) || null : null
  }, [serverCandidate, currentUser, isAdmin, candidates])

  // ── auth ────────────────────────────────────────────────────────────────
  const signup = useCallback(
    async (name, email, password, referralCode = null) => {
      try {
        const data = await api.post('/auth/signup', {
          name: name.trim(),
          email: email.trim().toLowerCase(),
          password,
          referralCode: referralCode || undefined,
        })
        setAccessToken(data.access)
        await adoptServerSession(data.user)
        return { ok: true, referred: Boolean(data.referred) }
      } catch (err) {
        return { error: err.message }
      }
    },
    [adoptServerSession],
  )

  const login = useCallback(
    async (email, password) => {
      try {
        const data = await api.post('/auth/login', { email: email.trim().toLowerCase(), password })
        setAccessToken(data.access)
        await adoptServerSession(data.user)
        return { ok: true }
      } catch (err) {
        return { error: err.message }
      }
    },
    [adoptServerSession],
  )

  const logout = useCallback(() => {
    api.post('/auth/logout').catch(() => {})
    setAccessToken(null)
    setServerUser(null)
    setServerCandidate(null)
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
      // Best-effort server sync — the local update wins instantly, the server
      // row is refreshed in the background so a reload keeps the same state.
      api
        .put('/me/profile', {
          name: profile.name,
          email: profile.email,
          linkedin: profile.linkedin,
          github: profile.github,
          bio: profile.bio,
          mobile: profile.phone || profile.mobile,
          domain: profile.domain,
        })
        .then((r) => {
          if (r?.candidate) {
            const local = toLocalCandidate(r.candidate, candidate.wallet)
            setServerCandidate(local)
            setCandidates((prev) => prev.map((c) => (c.id === local.id ? local : c)))
          }
        })
        .catch(() => {})
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
      hydrated,
      refreshMe,
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
      hydrated,
      refreshMe,
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
