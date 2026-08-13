import { cn } from '../../../lib/utils.js'

/**
 * AuroraBackground — pure-CSS flowing aurora sheets, GPU-composited.
 * Zero runtime cost once mounted. Theme-adaptive: pass a light or dark
 * palette (default is the dark hero palette). Children stack above.
 */
export function AuroraBackground({ children, className, palette = 'dark', speed = 'slow' }) {
  const isDark = palette === 'dark'
  const sheets = isDark
    ? [
        'conic-gradient(from 120deg at 50% 30%, rgba(34,211,238,0.28), rgba(124,92,255,0.22), rgba(56,255,176,0.18), rgba(34,211,238,0.28))',
        'conic-gradient(from 300deg at 70% 70%, rgba(255,92,122,0.16), rgba(124,92,255,0.24), rgba(180,255,57,0.14), rgba(255,92,122,0.16))',
        'radial-gradient(60% 60% at 30% 80%, rgba(34,211,238,0.18), transparent 70%)',
      ]
    : [
        'conic-gradient(from 120deg at 50% 30%, rgba(34,211,238,0.35), rgba(124,92,255,0.28), rgba(56,255,176,0.3), rgba(34,211,238,0.35))',
        'conic-gradient(from 300deg at 70% 70%, rgba(255,92,122,0.2), rgba(124,92,255,0.32), rgba(180,255,57,0.18), rgba(255,92,122,0.2))',
        'radial-gradient(60% 60% at 30% 80%, rgba(34,211,238,0.22), transparent 70%)',
      ]

  return (
    <div className={cn('pointer-events-none absolute inset-0 overflow-hidden', className)} aria-hidden>
      <div className="absolute inset-[-35%]">
        {sheets.map((bg, i) => (
          <div
            key={i}
            className={cn(
              'cdt-aurora absolute inset-0',
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
