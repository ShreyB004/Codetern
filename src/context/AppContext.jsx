import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { PROGRAMMES } from '../data/programmes.js'
import { buildCandidateSeed, DEFAULT_MEDIA } from '../data/seed.js'
import { getProgramme } from '../data/programmes.js'
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

function ensureAdmin(users) {
  return users.some((u) => u.email === SEED_USER.email) ? users : [SEED_USER, ...users]
}

export function AppProvider({ children }) {
  const [users, setUsers] = useState(() => ensureAdmin(load('users:v1', [])))
  const [currentUserId, setCurrentUserId] = useState(() => load('current:v1', null))
  const [candidates, setCandidates] = useState(() => load('candidates:v1', null) || buildCandidateSeed())
  const [programmes, setProgrammes] = useState(() => load('programmes:v1', null) || PROGRAMMES)
  const [media, setMedia] = useState(() => load('media:v1', null) || DEFAULT_MEDIA)

  useEffect(() => save('users:v1', users), [users])
  useEffect(() => save('current:v1', currentUserId), [currentUserId])
  useEffect(() => save('candidates:v1', candidates), [candidates])
  useEffect(() => save('programmes:v1', programmes), [programmes])
  useEffect(() => save('media:v1', media), [media])

  const currentUser = users.find((u) => u.id === currentUserId) || null
  const isAdmin = currentUser?.role === 'admin'
  const candidate = useMemo(
    () => (currentUser && !isAdmin ? candidates.find((c) => c.id === currentUser.id) || null : null),
    [currentUser, isAdmin, candidates],
  )

  // ── auth ────────────────────────────────────────────────
  const signup = useCallback(
    (name, email, password) => {
      const clean = email.trim().toLowerCase()
      if (users.some((u) => u.email === clean)) return { error: 'An account with this email already exists.' }
      const id = uid('u')
      const now = new Date().toISOString().slice(0, 10)
      const newUser = { id, name, email: clean, password, role: 'student', createdAt: now }
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
        workspace: null,
      }
      setUsers((prev) => [...ensureAdmin(prev), newUser])
      setCandidates((prev) => [...prev, newCandidate])
      setCurrentUserId(id)
      return { ok: true }
    },
    [users],
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

  // ── student progress ────────────────────────────────────
  const updateCandidate = useCallback((id, patch) => {
    setCandidates((prev) => prev.map((c) => (c.id === id ? { ...c, ...patch } : c)))
  }, [])

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

  const saveQuizResult = useCallback(
    (bank, score, passed) => {
      if (!candidate) return
      updateCandidate(candidate.id, {
        quiz: { bank, score, passed, at: new Date().toISOString() },
        quizScore: score,
        quizPassed: passed,
        step: passed ? Math.max(candidate.step, 3) : candidate.step,
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
        step: Math.max(candidate.step, 4),
      })
    },
    [candidate, updateCandidate],
  )

  const saveBooking = useCallback(
    (duration) => {
      if (!candidate) return
      updateCandidate(candidate.id, {
        booking: { domain: candidate.domain, duration, at: new Date().toISOString() },
        step: Math.max(candidate.step, 5),
        status: 'active',
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

  const updateWorkspace = useCallback(
    (workspace) => {
      if (!candidate) return
      updateCandidate(candidate.id, { workspace })
    },
    [candidate, updateCandidate],
  )

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
      updateWorkspace,
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
      updateWorkspace,
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