import { Sparkle } from 'lucide-react'

const WORDS = [
  'Sprints',
  'PR reviews',
  'Production-ready projects',
  'Mentor 1:1s',
  'Real code reviews',
  'Deployed + CI green',
  'Cohort-based internships',
  'No lecture halls',
  'Portfolio you can prove',
  'Keep shipping',
]

/**
 * MarqueeStrip — infinite keyword ticker between hero sections.
 * Pure CSS loop (`.cdt-marquee`), duplicated content for a seamless
 * translateX(-50%) cycle. Pauses on hover.
 */
export function MarqueeStrip() {
  const row = [...WORDS, ...WORDS]
  return (
    <div className="relative overflow-hidden border-y border-ink/8 bg-paper py-4 dark:border-paper/10 dark:bg-ink">
      <div
        className="pointer-events-none absolute inset-y-0 left-0 z-10 w-24 bg-gradient-to-r from-paper to-transparent dark:from-ink"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-y-0 right-0 z-10 w-24 bg-gradient-to-l from-paper to-transparent dark:from-ink"
        aria-hidden
      />
      <div className="cdt-marquee">
        {row.map((word, i) => (
          <span key={i} className="flex shrink-0 items-center gap-3 px-4 text-sm font-semibold uppercase tracking-[0.14em] text-ink/60 dark:text-paper/60">
            {word}
            <Sparkle size={12} className="text-ink/50 dark:text-cyan-snap" />
          </span>
        ))}
      </div>
    </div>
  )
}