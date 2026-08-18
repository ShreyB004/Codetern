import { initializeApp } from 'firebase/app'
import { getAnalytics, isSupported } from 'firebase/analytics'
import { getDatabase } from 'firebase/database'

// Firebase is optional — configure via .env (VITE_FIREBASE_*) and the
// marketing site lights up with Google Analytics + realtime event/traffic
// tracking. Without config the app runs fully static with graceful no-ops.
const env = import.meta.env

export const firebaseReady =
  Boolean(env.VITE_FIREBASE_API_KEY) && Boolean(env.VITE_FIREBASE_PROJECT_ID)

export const firebaseConfig = firebaseReady
  ? {
      apiKey: env.VITE_FIREBASE_API_KEY,
      authDomain: env.VITE_FIREBASE_AUTH_DOMAIN,
      projectId: env.VITE_FIREBASE_PROJECT_ID,
      storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET,
      messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID,
      appId: env.VITE_FIREBASE_APP_ID,
      databaseURL: env.VITE_FIREBASE_DATABASE_URL,
    }
  : null

export const app = firebaseReady ? initializeApp(firebaseConfig) : null

export const analyticsPromise = firebaseReady
  ? isSupported().then((ok) => (ok ? getAnalytics(app) : null))
  : Promise.resolve(null)

export const db = firebaseReady ? getDatabase(app) : null