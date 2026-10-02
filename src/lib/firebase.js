import { initializeApp } from 'firebase/app'
import { getAnalytics, isSupported } from 'firebase/analytics'
import { getDatabase } from 'firebase/database'
import { getAuth, GoogleAuthProvider } from 'firebase/auth'

// Codetern LMS MVP — Realtime Database only (no Storage).
// Config falls back to the bundled codetern-2c7ea project so the
// Google-Form-style lead capture works out of the box.
// Override via .env (VITE_FIREBASE_*) if needed.
const env = import.meta.env

const FALLBACK_CONFIG = {
  apiKey: 'AIzaSyC6stsJp0jdR5oiAF5mhCGvecVQrf83C_o',
  authDomain: 'codetern-2c7ea.firebaseapp.com',
  databaseURL: 'https://codetern-2c7ea-default-rtdb.asia-southeast1.firebasedatabase.app',
  projectId: 'codetern-2c7ea',
  storageBucket: 'codetern-2c7ea.firebasestorage.app',
  messagingSenderId: '637590394706',
  appId: '1:637590394706:web:20baf2b7e1a286ef7e0c8b',
}

export const firebaseConfig = {
  apiKey: env.VITE_FIREBASE_API_KEY || FALLBACK_CONFIG.apiKey,
  authDomain: env.VITE_FIREBASE_AUTH_DOMAIN || FALLBACK_CONFIG.authDomain,
  databaseURL: env.VITE_FIREBASE_DATABASE_URL || FALLBACK_CONFIG.databaseURL,
  projectId: env.VITE_FIREBASE_PROJECT_ID || FALLBACK_CONFIG.projectId,
  storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET || FALLBACK_CONFIG.storageBucket,
  messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID || FALLBACK_CONFIG.messagingSenderId,
  appId: env.VITE_FIREBASE_APP_ID || FALLBACK_CONFIG.appId,
}

export const firebaseReady = Boolean(firebaseConfig.apiKey && firebaseConfig.projectId)

export const app = firebaseReady ? initializeApp(firebaseConfig) : null

export const analyticsPromise = firebaseReady
  ? isSupported().then((ok) => (ok ? getAnalytics(app) : null))
  : Promise.resolve(null)

export const db = firebaseReady ? getDatabase(app) : null

export const auth = firebaseReady ? getAuth(app) : null
export const googleProvider = new GoogleAuthProvider()

// Admin allowlist — add a second address here (and mirror it in
// database.rules.json) so there is always a recovery path.
export const ADMIN_EMAILS = ['shreybhangale@gmail.com']
export const ADMIN_EMAIL = ADMIN_EMAILS[0]
export const isAdminEmail = (email) =>
  ADMIN_EMAILS.includes(String(email || '').toLowerCase().trim())
export const roleFor = (email) => (isAdminEmail(email) ? 'admin' : 'student')