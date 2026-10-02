import { ArrowRight, Check } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { PLANS } from '../../data/courses.js'
import { cn } from '../../lib/utils.js'

export function TierShowcase() {
  const navigate = useNavigate()
  return (
    <section className="bg-white py-24 dark:bg-ink" data-track-section="tiers">
      <div className="mx-auto max-w-6xl px-5 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <span className="inline-block rounded-full bg-emerald-50 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.16em] text-emerald-900 dark:bg-emerald-400/10 dark:text-emerald-300">
            Simple pricing
          </span>
          <h2 className="mt-4 font-display text-4xl font-extrabold tracking-tight text-ink dark:text-paper" style={{ fontFamily: 'Georgia, serif' }}>
            Pay for mentorship, not videos.
          </h2>
          <p className="mt-2 text-sm text-ink/55 dark:text-paper/55">Same 4 courses on every plan. What changes is how closely mentors work with you.</p>
        </div>

        <div className="relative mt-10 border-t border-ink/10 dark:border-paper/10">
          <span className="absolute -top-2 left-1/3 bg-white px-1 text-ink/40 dark:bg-ink">+</span>
          <span className="absolute -top-2 left-2/3 bg-white px-1 text-ink/40 dark:bg-ink">+</span>
          <div className="grid md:grid-cols-3">
            {PLANS.map((p, i) => (
              <div key={p.id} className={cn('relative px-8 py-10', i < 2 && 'md:border-r md:border-ink/10 md:dark:border-paper/10')}>
                <span className="inline-block rounded-xl bg-gradient-to-b from-cyan-100 to-rose-100 px-3 py-1 text-xs font-bold text-ink shadow-card dark:from-white/10 dark:to-white/5 dark:text-paper">{p.name}</span>
                {p.popular && <span className="ml-2 rounded-full bg-ink px-2 py-0.5 text-[10px] font-bold uppercase text-white">Most joined</span>}
                <p className="mt-4 font-display text-5xl font-extrabold text-ink dark:text-paper" style={{ fontFamily: 'Georgia, serif' }}>
                  ₹{p.price.toLocaleString()}
                </p>
                <p className="mt-1 text-sm text-ink/50 dark:text-paper/50"><span className="line-through">₹{p.originalPrice.toLocaleString()}</span> · {p.duration}</p>
                <button
                  onClick={() => navigate(`/join?plan=${p.id}`)}
                  className={cn('mt-5 w-full rounded-2xl py-3 text-sm font-bold', p.popular ? 'bg-ink text-white shadow-float dark:bg-paper dark:text-ink' : 'bg-ink/5 text-ink dark:bg-paper/10 dark:text-paper')}
                >
                  {p.cta} <ArrowRight size={14} className="ml-1 inline" />
                </button>
                <ul className="mt-5 space-y-2">
                  {p.features.slice(0, 5).map((f) => (
                    <li key={f} className="flex gap-2 text-[13px] text-ink/65 dark:text-paper/65"><Check size={14} className="mt-0.5 shrink-0" />{f}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="border-b border-ink/10 dark:border-paper/10" />
        </div>
      </div>
    </section>
  )
}
