import { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react'
import { CheckCircle2, AlertCircle, Info } from 'lucide-react'
import { uid } from '../lib/store.js'

const TONE_ICON = { success: CheckCircle2, error: AlertCircle, info: Info }

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
      <div className="pointer-events-none fixed inset-x-0 bottom-6 z-[120] flex flex-col items-center gap-2.5 px-4">
        {toasts.map((t) => {
          const Icon = TONE_ICON[t.tone] || Info
          return (
            <div
              key={t.id}
              role="status"
              data-toast
              className={`animate-in pointer-events-auto flex w-full max-w-sm items-center gap-2.5 rounded-2xl border px-4 py-3 text-sm font-semibold shadow-float backdrop-blur-md ${
                t.tone === 'success'
                  ? 'border-emerald-400/50 bg-ink/95 text-emerald-300'
                  : t.tone === 'error'
                    ? 'border-rose-400/50 bg-ink/95 text-rose-300'
                    : t.tone === 'info'
                      ? 'border-cyan-300/50 bg-ink/95 text-cyan-300'
                      : 'border-white/15 bg-ink/95 text-white'
              }`}
            >
              <Icon size={17} className="shrink-0" />
              <span>{t.message}</span>
            </div>
          )
        })}
      </div>
    </ToastCtx.Provider>
  )
}

export function useToast() {
  const ctx = useContext(ToastCtx)
  if (!ctx) throw new Error('useToast must be used within ToastProvider')
  return ctx
}