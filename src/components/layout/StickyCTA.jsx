import { ArrowRight } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { Button } from '../ui/Button.jsx'

export function StickyCTA() {
  const navigate = useNavigate()
  return (
    <div className="fixed inset-x-0 bottom-0 z-40 px-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] sm:hidden">
      <div className="flex items-center gap-3 rounded-full border border-ink/10 bg-white/90 p-2 pl-4 text-ink shadow-float backdrop-blur-xl dark:border-paper/10 dark:bg-ink-soft/90 dark:text-paper">
        <p className="min-w-0 flex-1 truncate text-xs font-semibold">
          4 production courses
          <span className="block text-[10px] font-medium opacity-50">PR reviews · team sim · ship live</span>
        </p>
        <Button size="sm" onClick={() => navigate('/join')}>
          Join
          <ArrowRight size={14} />
        </Button>
      </div>
    </div>
  )
}
