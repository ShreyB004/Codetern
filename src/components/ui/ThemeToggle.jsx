import { Moon, Sun } from 'lucide-react'
import { useTheme } from '../../context/ThemeContext.jsx'
import { cn } from '../../lib/utils.js'

/**
 * ThemeToggle — switch with aria semantics and a variant (`onDark`) for
 * ink-colored surfaces (admin sidebar), where the default light-mode
 * styling would be invisible.
 */
export function ThemeToggle({ className, onDark = false }) {
  const { isDark, toggle } = useTheme()

  return (
    <button
      type="button"
      role="switch"
      aria-checked={isDark}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      onClick={toggle}
      className={cn(
        'relative grid h-11 w-[4.75rem] shrink-0 items-center rounded-full border transition-colors duration-300 focus-ring',
        isDark
          ? 'border-white/15 bg-white/10 text-neon'
          : onDark
            ? 'border-white/15 bg-white/10 text-paper'
            : 'border-ink/12 dark:border-paper/12 bg-ink/5 dark:bg-paper/5 text-ink',
        className,
      )}
    >
      <span
        className={cn(
          'grid h-8 w-8 place-items-center rounded-full shadow-card transition-transform duration-300',
          isDark ? 'translate-x-9 bg-ink-soft' : 'translate-x-1.5 bg-white',
          onDark && !isDark ? 'bg-paper/15' : '',
        )}
      >
        {isDark ? <Moon size={14} /> : <Sun size={14} />}
      </span>
    </button>
  )
}
