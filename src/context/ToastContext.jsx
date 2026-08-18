import { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react'
import { uid } from '../lib/store.js'

const ToastCtx = createContext(null)

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])
  const timers = useRef({})

  const push = useCallback((message, tone = 'neutral') => {
    const id = uid('t')
    setToasts((prev) => [...prev.slice(-3), { id, message, tone }])
    clearTimeout(timers.current[id])
    timers.current[id] = setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 3600)
  }, [])

  const value = useMemo(() => ({ push }), [push])

  return (
    <ToastCtx.Provider value={value}>
      {children}
      <div className="pointer-events-none fixed inset-x-0 bottom-6 z-[120] flex flex-col items-center gap-3 px-4">
        {toasts.map((t) => (
          <div
            key={t.id}
            role="status"
            data-toast
            className={`pointer-events-auto w-full max-w-sm rounded-2xl border px-4 py-3 text-sm font-medium shadow-float backdrop-blur-md ${
              t.tone === 'success'
                ? 'border-mint/40 bg-ink/90 text-mint'
                : t.tone === 'error'
                  ? 'border-coral/40 bg-ink/90 text-coral'
                  : t.tone === 'info'
                    ? 'border-cyan-snap/40 bg-ink/90 text-cyan-snap'
                    : 'border-white/15 bg-ink/90 text-white'
            }`}
          >
            {t.message}
          </div>
        ))}
      </div>
    </ToastCtx.Provider>
  )
}

export function useToast() {
  const ctx = useContext(ToastCtx)
  if (!ctx) throw new Error('useToast must be used within ToastProvider')
  return ctx
}