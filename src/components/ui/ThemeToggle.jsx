import { Moon, Sun } from 'lucide-react'
import { useTheme } from '../../context/ThemeContext.jsx'
import { cn } from '../../lib/utils.js'

export function ThemeToggle({ className, dark = false }) {
  const { isDark, toggle } = useTheme()

  return (
    <button
      onClick={toggle}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      className={cn(
        'relative grid h-9 w-16 items-center rounded-full border transition-colors duration-300',
        isDark
          ? 'border-white/15 bg-white/10 text-neon'
          : 'border-ink/12 dark:border-paper/12 bg-ink/5 dark:bg-paper/5 text-ink',
        className,
      )}
    >
      <span
        className={cn(
          'grid h-7 w-7 place-items-center rounded-full shadow-card transition-transform duration-300',
          isDark ? 'translate-x-8 bg-ink-soft' : 'translate-x-1 bg-white',
          dark && !isDark ? 'bg-white/10' : '',
        )}
      >
        {isDark ? <Moon size={13} /> : <Sun size={13} />}
      </span>
    </button>
  )
}
