import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Cookie } from 'lucide-react'

const KEY = 'cdt:cookies:v1'

export function CookieNotice() {
  const [seen, setSeen] = useState(() => {
    try {
      return !!localStorage.getItem(KEY)
    } catch {
      return true
    }
  })
  if (seen) return null

  const accept = () => {
    try {
      localStorage.setItem(KEY, '1')
    } catch { /* noop */ }
    setSeen(true)
  }

  return (
    <div className="fixed inset-x-0 bottom-0 z-[110] px-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))]">
      <div className="mx-auto flex max-w-3xl flex-wrap items-center gap-3 rounded-3xl border border-ink/10 bg-white/95 px-5 py-3.5 text-sm shadow-float backdrop-blur-xl dark:border-paper/15 dark:bg-ink-soft/95">
        <Cookie size={16} className="shrink-0 opacity-50" />
        <p className="min-w-0 flex-1 opacity-70">
          We use sign-in cookies, local preferences and basic analytics to run the LMS. Details in our{' '}
          <Link to="/privacy" className="font-bold underline">Privacy Policy</Link>.
        </p>
        <button onClick={accept} className="shrink-0 rounded-full bg-ink px-4 py-2 text-xs font-bold text-white transition hover:-translate-y-0.5 dark:bg-paper dark:text-ink">
          Got it
        </button>
      </div>
    </div>
  )
}
