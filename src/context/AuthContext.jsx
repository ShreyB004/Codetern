import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { onAuthStateChanged, signInWithPopup, signOut } from 'firebase/auth'
import { ref, update } from 'firebase/database'
import { auth, db, googleProvider, roleFor } from '../lib/firebase.js'
import { stampSession, sessionExpired, clearSession } from '../lib/session.js'

const Ctx = createContext({ user: null, role: null, loading: true, expiredNotice: false, signIn: async () => {}, signOut: async () => {} })

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [expiredNotice, setExpiredNotice] = useState(false)

  useEffect(() => {
    if (!auth) {
      setLoading(false)
      return
    }
    const off = onAuthStateChanged(auth, async (u) => {
      // one-time sign-on: Firebase may restore an older session, but we
      // only honor it for 30 days from the last explicit sign-in
      if (u && sessionExpired()) {
        try {
          await signOut(auth)
        } catch { /* noop */ }
        clearSession()
        setUser(null)
        setExpiredNotice(true)
        setLoading(false)
        return
      }
      setUser(u)
      setLoading(false)
      if (u && db) {
        try {
          const safe = u.uid.replace(/[.#$/[\]]/g, '_')
          await update(ref(db, `users/${safe}`), {
            uid: u.uid,
            name: u.displayName || '',
            email: u.email || '',
            photo: u.photoURL || '',
            role: roleFor(u.email),
            lastLogin: Date.now(),
          })
        } catch { /* RTDB rules may block — login still works */ }
      }
    })
    return off
  }, [])

  const value = useMemo(() => ({
    user,
    role: user ? roleFor(user.email) : null,
    isAdmin: user ? roleFor(user.email) === 'admin' : false,
    loading,
    expiredNotice,
    signIn: async () => {
      if (!auth) throw new Error('Auth not configured — enable Google sign-in in Firebase console')
      // Stamp FIRST: Firebase fires onAuthStateChanged before the popup
      // promise resolves, so stamping after would instantly expire the login.
      // (If the user cancels the popup, the stamp is harmless — no session.)
      stampSession()
      try {
        await signInWithPopup(auth, googleProvider)
      } catch (err) {
        clearSession()
        throw err
      }
      setExpiredNotice(false)
    },
    signOut: () => {
      clearSession()
      return auth ? signOut(auth) : Promise.resolve()
    },
  }), [user, loading, expiredNotice])

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export const useAuth = () => useContext(Ctx)

function AuthGate({ label }) {
  return (
    <div className="mx-auto w-full max-w-6xl px-6 py-24" role="status" aria-label={label}>
      <div className="mx-auto mb-8 h-9 w-64 animate-pulse rounded-full bg-ink/8 dark:bg-paper/10" />
      <div className="mx-auto mb-4 h-12 w-96 max-w-full animate-pulse rounded-2xl bg-ink/8 dark:bg-paper/10" />
      <div className="mx-auto h-5 w-72 max-w-full animate-pulse rounded-xl bg-ink/8 dark:bg-paper/10" />
      <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[0, 1, 2].map((i) => (
          <div key={i} className="rounded-3xl border border-ink/8 bg-white p-6 dark:border-paper/10 dark:bg-ink-soft">
            <div className="mb-4 h-8 w-8 animate-pulse rounded-lg bg-ink/8 dark:bg-paper/10" />
            <div className="mb-3 h-5 w-3/4 animate-pulse rounded-lg bg-ink/8 dark:bg-paper/10" />
            <div className="h-3 w-full animate-pulse rounded-lg bg-ink/8 dark:bg-paper/10" />
            <div className="mt-2 h-3 w-5/6 animate-pulse rounded-lg bg-ink/8 dark:bg-paper/10" />
          </div>
        ))}
      </div>
      <p className="mt-8 text-center text-sm opacity-50">{label}</p>
    </div>
  )
}

export function RequireAuth({ children }) {
  const { user, loading } = useAuth()
  const loc = useLocation()
  if (loading) return <AuthGate label="Checking your login…" />
  if (!user) return <Navigate to={`/login?next=${encodeURIComponent(loc.pathname)}`} replace />
  return children
}

export function RequireAdmin({ children }) {
  const { user, isAdmin, loading } = useAuth()
  const loc = useLocation()
  if (loading) return <AuthGate label="Checking admin access…" />
  if (!user) return <Navigate to={`/login?next=${encodeURIComponent(loc.pathname)}`} replace />
  if (!isAdmin) return <Navigate to="/dashboard" replace />
  return children
}
