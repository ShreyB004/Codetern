import { cn } from '../../../lib/utils.js'
import { useTheme } from '../../../context/ThemeContext.jsx'

/**
 * AuroraBackground — pure-CSS flowing aurora sheets, GPU-composited.
 * Zero runtime cost once mounted. Theme-adaptive by default: palette='auto'
 * follows the app theme (light = soft pastel wash with normal blend,
 * dark = restrained glow sheets with screen blend). Pass 'light'/'dark' to
 * force a side. Children stack above.
 */
export function AuroraBackground({ children, className, palette = 'auto', speed = 'slow' }) {
  const { isDark } = useTheme()
  const dark = palette === 'dark' || (palette === 'auto' && isDark)
  // Dark-first aesthetic: restrained sheets over the ink canvas so text stays
  // readable (contrast is controlled — never over-saturate dark UIs). The
  // light palette is muted so accents never fight the paper background.
  const sheets = dark
    ? [
        'conic-gradient(from 120deg at 50% 28%, rgba(34,211,238,0.2), rgba(124,92,255,0.16), rgba(56,255,176,0.1), rgba(34,211,238,0.2))',
        'conic-gradient(from 300deg at 72% 68%, rgba(124,92,255,0.14), rgba(34,211,238,0.1), rgba(180,255,57,0.06), rgba(124,92,255,0.14))',
        'radial-gradient(60% 60% at 28% 82%, rgba(34,211,238,0.11), transparent 70%)',
        'radial-gradient(50% 50% at 78% 18%, rgba(124,92,255,0.09), transparent 70%)',
      ]
    : [
        'conic-gradient(from 120deg at 50% 30%, rgba(34,211,238,0.22), rgba(124,92,255,0.16), rgba(56,255,176,0.14), rgba(34,211,238,0.22))',
        'conic-gradient(from 300deg at 70% 70%, rgba(255,92,122,0.1), rgba(124,92,255,0.18), rgba(180,255,57,0.08), rgba(255,92,122,0.1))',
        'radial-gradient(60% 60% at 30% 80%, rgba(34,211,238,0.12), transparent 70%)',
      ]

  return (
    <div className={cn('pointer-events-none absolute inset-0 overflow-hidden', className)} aria-hidden>
      <div className="absolute inset-[-35%]">
        {sheets.map((bg, i) => (
          <div
            key={i}
            className={cn(
              'cdt-aurora absolute inset-0',
              !dark && 'cdt-aurora-blend-normal',
              speed === 'fast' ? 'cdt-aurora-fast' : '',
              i === 1 && 'cdt-aurora-alt',
              i === 2 && 'cdt-aurora-blob',
            )}
            style={{ background: bg, animationDelay: `${-i * 7}s`, animationDuration: `${22 + i * 6}s` }}
          />
        ))}
      </div>
      {children && <div className="pointer-events-auto absolute inset-0 z-10">{children}</div>}
    </div>
  )
}
