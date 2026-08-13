import { cn } from '../../../lib/utils.js'

const BLOSS = [
  ['34, 211, 238', '22%', '-10%', '42%'],
  ['124, 92, 255', '60%', '5%', '38%'],
  ['56, 255, 176', '-5%', '45%', '36%'],
  ['255, 92, 122', '70%', '55%', '34%'],
]

/**
 * MeshGradientBackground — soft drifting blurred blobs (Linear/Stripe
 * style mesh gradient). Pure CSS, theme-adaptive via the `dark` variant.
 */
export function MeshGradientBackground({ children, className, dark = false, opacity = 0.55 }) {
  return (
    <div className={cn('pointer-events-none absolute inset-0 overflow-hidden', className)} aria-hidden>
      <div className="absolute inset-0">
        {BLOSS.map(([rgb, left, top, size], i) => (
          <div
            key={i}
            className={cn('cdt-mesh-blob absolute rounded-full', dark ? 'cdt-mesh-dark' : 'cdt-mesh-light')}
            style={{
              left,
              top,
              width: size,
              height: size,
              background: `radial-gradient(circle at 30% 30%, rgb(${rgb} / ${0.55 * opacity}), transparent 70%)`,
              filter: 'blur(70px)',
            }}
          />
        ))}
      </div>
      {children && <div className="pointer-events-auto absolute inset-0 z-10">{children}</div>}
    </div>
  )
}
