import { useState } from 'react'
import { ArrowUpRight, Globe, RefreshCcw } from 'lucide-react'
import { useApp } from '../../context/AppContext.jsx'
import { useSeats } from '../../context/SeatsContext.jsx'
import { useToast } from '../../context/ToastContext.jsx'
import { DOMAIN_COLORS } from '../../data/programmes.js'
import { DomainIcon } from '../ui/Icon.jsx'

export function SeatController() {
  const { programmes } = useApp()
  const { seats, setSeat, scaleAll } = useSeats()
  const { push } = useToast()
  const [factor, setFactor] = useState(1)
  const totalCount = programmes.reduce((acc, p) => acc + Object.keys(seats?.[p.id] || {}).length, 0)

  const applyScale = (f) => {
    scaleAll(f)
    setFactor(1)
    push(`Global availability scaled ×${f} — landing page updated`, 'success')
  }

  return (
    <div>
      {/* seat-controls panel */}
      <div className="mb-8 grid gap-4 lg:grid-cols-[1.5fr_1fr]">
        <div className="rounded-panel border border-ink/8 bg-white dark:border-paper/10 dark:bg-ink-soft p-6 shadow-card">
          <div className="flex items-center gap-3">
            <span className="grid h-11 w-11 place-items-center rounded-2xl bg-ink text-neon">
              <Globe size={20} />
            </span>
            <div>
              <h3 className="font-display text-base font-bold text-ink dark:text-paper">Global seat multiplier</h3>
              <p className="text-xs text-ink/50 dark:text-paper/50">Instantly scale maximum limits & remaining counts across every domain-batch.</p>
            </div>
          </div>
          <div className="mt-6 flex items-center gap-4">
            <input
              type="range"
              min="0.5"
              max="3"
              step="0.1"
              value={factor}
              onChange={(e) => setFactor(parseFloat(e.target.value))}
              className="w-full accent-[#22d3ee]"
            />
            <span className="w-16 shrink-0 rounded-xl bg-ink/5 px-3 py-1.5 text-center font-display text-sm font-bold text-ink dark:text-paper">
              ×{factor.toFixed(1)}
            </span>
            <button
              onClick={() => applyScale(factor)}
              className="flex shrink-0 items-center gap-1.5 rounded-full bg-ink px-5 py-2.5 text-sm font-semibold text-paper transition hover:bg-ink-soft"
            >
              <RefreshCcw size={14} /> Apply
            </button>
          </div>
        </div>

        <div className="flex flex-col justify-center rounded-panel bg-ink p-6 text-white shadow-card">
          <p className="text-[11px] font-bold uppercase tracking-widest text-white/40">Live inventory</p>
          <p className="mt-1 font-display text-3xl font-extrabold text-neon">{totalCount}</p>
          <p className="text-xs text-white/45">domain-batch cells broadcasting to the public site</p>
          <p className="mt-2 flex items-center gap-1 text-xs text-white/40">
            <ArrowUpRight size={12} /> changes reflect instantly on Home & Domains pages
          </p>
        </div>
      </div>

      {/* per-cell controls */}
      <div className="grid gap-4 lg:grid-cols-2">
        {programmes.map((p) => {
          const color = DOMAIN_COLORS[p.color]
          const cells = seats[p.id] || {}
          return (
            <div key={p.id} className="rounded-panel border border-ink/8 bg-white dark:border-paper/10 dark:bg-ink-soft p-5 shadow-card">
              <div className="mb-4 flex items-center gap-3">
                <span className="grid h-10 w-10 place-items-center rounded-xl" style={{ background: color.bg, color: color.fg }}>
                  <DomainIcon name={p.icon} size={18} />
                </span>
                <div className="min-w-0">
                  <p className="truncate text-sm font-bold text-ink dark:text-paper">{p.title}</p>
                  <p className="text-[11px] text-ink/45 dark:text-paper/45">{p.sub}</p>
                </div>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                {Object.entries(cells).map(([dur, cell]) => (
                  <CellEditor
                    key={dur}
                    duration={dur}
                    total={cell.total}
                    remaining={cell.remaining}
                    onChange={(patch) => setSeat(p.id, Number(dur), patch)}
                  />
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function CellEditor({ duration, total, remaining, onChange }) {
  const setTotal = (v) => onChange({ total: Math.max(0, Number(v)) })
  const setRemaining = (v) => onChange({ remaining: Math.max(0, Math.min(total, Number(v))) })

  return (
    <div className="rounded-2xl border border-ink/8 dark:border-paper/8 bg-paper p-3.5">
      <div className="flex items-center justify-between">
        <span className="rounded-bubble bg-ink/5 dark:bg-paper/5 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-ink/45 dark:text-paper/45">
          {duration} month{duration > 1 ? 's' : ''}
        </span>
        <span className="text-[11px] font-bold text-ink/50 dark:text-paper/50 tabular-nums">{remaining}/{total} left</span>
      </div>
      <div className="mt-3 grid grid-cols-2 gap-2">
        <label className="block">
          <span className="block text-[10px] font-semibold uppercase tracking-wider text-ink/40 dark:text-paper/40">Max seats</span>
          <input type="number" min="0" value={total} onChange={(e) => setTotal(e.target.value)} className="mt-1 w-full rounded-lg border border-ink/12 bg-white dark:border-paper/15 dark:bg-ink dark:text-paper px-2.5 py-1.5 text-sm font-bold outline-none focus:border-cyan-snap/60" />
        </label>
        <label className="block">
          <span className="block text-[10px] font-semibold uppercase tracking-wider text-ink/40 dark:text-paper/40">Remaining</span>
          <input type="number" min="0" max={total} value={remaining} onChange={(e) => setRemaining(e.target.value)} className="mt-1 w-full rounded-lg border border-ink/12 bg-white dark:border-paper/15 dark:bg-ink dark:text-paper px-2.5 py-1.5 text-sm font-bold outline-none focus:border-cyan-snap/60" />
        </label>
      </div>
      <div className="mt-2.5 h-1.5 overflow-hidden rounded-full bg-ink/8 dark:bg-paper/8">
        <div className="h-full rounded-full transition-all" style={{ width: `${total ? (remaining / total) * 100 : 0}%`, background: total && remaining / total <= 0.22 ? '#ff5c7a' : '#38ffb0' }} />
      </div>
    </div>
  )
}
