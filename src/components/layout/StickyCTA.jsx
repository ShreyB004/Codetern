import { ArrowRight } from 'lucide-react'
import { Button } from '../ui/Button.jsx'
import { openRegistration } from '../../lib/analytics.js'

/**
 * StickyCTA — phone-only floating register bar. Keeps the one conversion
 * path one thumb-tap away without cluttering the desktop chrome.
 */
export function StickyCTA() {
  return (
    <div className="fixed inset-x-0 bottom-0 z-40 px-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] sm:hidden">
      <div className="flex items-center gap-3 rounded-full border border-ink/10 bg-white/90 p-2 pl-4 shadow-float backdrop-blur-xl dark:border-paper/10 dark:bg-ink-soft/90">
        <p className="min-w-0 flex-1 truncate text-xs font-semibold text-ink dark:text-paper">
          Next cohort in 12 days
          <span className="block text-[10px] font-medium text-ink/50 dark:text-paper/50">14 domains · one flat price</span>
        </p>
        <Button size="sm" magnetic={false} onClick={() => openRegistration('sticky-mobile')}>
          Register
          <ArrowRight size={14} />
        </Button>
      </div>
    </div>
  )
}