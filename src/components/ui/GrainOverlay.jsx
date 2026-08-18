/**
 * GrainOverlay — full-viewport film grain (dark aesthetic texture).
 * Pure CSS, pointer-events-none, sits above content but stays invisible
 * to screen readers and interaction. Static under reduced motion.
 */
export function GrainOverlay() {
  return <div className="cdt-grain" aria-hidden />
}
