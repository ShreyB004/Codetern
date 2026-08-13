import { COMPANY_STATS } from '../../data/portfolio.js'
import { useCountUp } from '../../hooks/useCountUp.js'
import { useRevealScope } from '../../hooks/useReveal.js'

function Stat({ value, suffix = '', label }) {
  const { ref, value: v } = useCountUp(value)
  return (
    <div ref={ref} className="text-center" data-reveal>
      <p className="font-display text-4xl font-extrabold text-ink dark:text-paper tabular-nums sm:text-5xl">
        {v.toLocaleString('en-IN')}
        {suffix}
      </p>
      <p className="mt-1 text-sm font-medium text-ink/60 dark:text-paper/60">{label}</p>
    </div>
  )
}

export function MetricsBar() {
  const scope = useRevealScope()
  return (
    <section ref={scope} className="border-b border-ink/8 bg-paper dark:border-paper/10 dark:bg-ink">
      <div className="mx-auto grid max-w-6xl grid-cols-2 gap-8 px-5 py-14 sm:grid-cols-4 lg:px-8">
        {COMPANY_STATS.map((s) => (
          <Stat key={s.label} value={s.value} suffix={s.suffix} label={s.label} />
        ))}
      </div>
    </section>
  )
}
