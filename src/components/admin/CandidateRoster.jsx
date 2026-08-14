import { useMemo, useState } from 'react'
import { ChevronLeft, ChevronRight, Search, Trash2 } from 'lucide-react'
import { useApp } from '../../context/AppContext.jsx'
import { useToast } from '../../context/ToastContext.jsx'
import { useTheme } from '../../context/ThemeContext.jsx'
import { getProgramme, DOMAIN_COLORS } from '../../data/programmes.js'
import { formatDate } from '../../lib/utils.js'
import { cn, domainChip } from '../../lib/utils.js'

const STATUSES = ['all', 'pending', 'active', 'retake', 'graduated']
const PAGE_SIZE = 6

const STEPS = {
  1: 'Booking',
  2: 'Profile',
  3: 'Workspace',
  4: 'Assessment',
  5: 'Interview',
}

export function CandidateRoster() {
  const { candidates, programmes, removeCandidate, updateCandidateAdmin } = useApp()
  const { isDark } = useTheme()
  const { push } = useToast()
  const [q, setQ] = useState('')
  const [domain, setDomain] = useState('all')
  const [status, setStatus] = useState('all')
  const [page, setPage] = useState(0)

  const filtered = useMemo(() => {
    return candidates
      .filter((c) => {
        const matchQ = c.name.toLowerCase().includes(q.toLowerCase()) || c.email.toLowerCase().includes(q.toLowerCase())
        const matchD = domain === 'all' || c.domain === domain
        const matchS = status === 'all' || (status === 'graduated' ? c.step >= 5 : c.status === status)
        return matchQ && matchD && matchS
      })
      .sort((a, b) => new Date(b.appliedAt) - new Date(a.appliedAt))
  }, [candidates, q, domain, status])

  const pages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const safePage = Math.min(page, pages - 1)
  const rows = filtered.slice(safePage * PAGE_SIZE, safePage * PAGE_SIZE + PAGE_SIZE)

  const stepUp = (id) => {
    const c = candidates.find((x) => x.id === id)
    if (c && c.step < 5) {
      updateCandidateAdmin(id, { step: c.step + 1 })
      push(`${c.name} advanced to ${STEPS[c.step + 1]}`, 'info')
    }
  }

  return (
    <div>
      {/* filters */}
      <div className="mb-6 flex flex-col gap-3 lg:flex-row lg:items-center">
        <div className="relative flex-1">
          <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-ink/30 dark:text-paper/30">
            <Search size={16} />
          </span>
          <input
            value={q}
            onChange={(e) => { setQ(e.target.value); setPage(0) }}
            placeholder="Search by name or email…"
            className="w-full rounded-xl border border-ink/12 bg-white dark:border-paper/15 dark:bg-ink dark:text-paper py-2.5 pl-10 pr-4 text-sm outline-none focus:border-cyan-snap/60"
          />
        </div>
        <select value={domain} onChange={(e) => { setDomain(e.target.value); setPage(0) }} className="rounded-xl border border-ink/12 bg-white dark:border-paper/15 dark:bg-ink dark:text-paper px-4 py-2.5 text-sm outline-none">
          <option value="all">All domains</option>
          {programmes.map((p) => <option key={p.id} value={p.id}>{p.title}</option>)}
        </select>
        <select value={status} onChange={(e) => { setStatus(e.target.value); setPage(0) }} className="rounded-xl border border-ink/12 bg-white dark:border-paper/15 dark:bg-ink dark:text-paper px-4 py-2.5 text-sm outline-none">
          {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      {/* table */}
      <div className="overflow-hidden rounded-panel border border-ink/8 bg-white dark:border-paper/10 dark:bg-ink-soft shadow-card dark:border-paper/10 dark:bg-ink-soft dark:shadow-none">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[860px] text-left text-sm">
            <thead>
              <tr className="border-b border-ink/8 bg-paper/60 dark:bg-ink/60 text-[11px] font-bold uppercase tracking-wider text-ink/45 dark:text-paper/45">
                <th className="px-5 py-3.5">Candidate</th>
                <th className="px-5 py-3.5">Domain</th>
                <th className="px-5 py-3.5">Step</th>
                <th className="px-5 py-3.5">Quiz</th>
                <th className="px-5 py-3.5">Interview</th>
                <th className="px-5 py-3.5">Applied</th>
                <th className="px-5 py-3.5">Status</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((c) => {
                const p = getProgramme(c.domain)
                const color = p ? DOMAIN_COLORS[p.color] : null
                return (
                  <tr key={c.id} className="border-b border-ink/5 dark:border-paper/5 transition-colors hover:bg-paper/50 dark:hover:bg-ink-soft/40">
                    <td className="px-5 py-3.5">
                      <p className="font-semibold text-ink dark:text-paper">{c.name}</p>
                      <p className="text-xs text-ink/45 dark:text-paper/45">{c.email}</p>
                    </td>
                    <td className="px-5 py-3.5">
                      {p ? (
                        <span className="rounded-full px-2.5 py-1 text-[11px] font-semibold" style={domainChip(color, isDark)}>
                          {p.title}
                        </span>
                      ) : (
                        <span className="text-ink/35 dark:text-paper/35">—</span>
                      )}
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-ink dark:text-paper">{STEPS[c.step]}</span>
                        <span className="text-[10px] text-ink/35 dark:text-paper/35">· {c.step}/5</span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      {c.quizScore != null ? (
                        <span className={cn('font-bold tabular-nums', c.quizPassed ? 'text-mint-deep dark:text-mint' : 'text-coral-deep dark:text-coral')}>
                          {c.quizScore}%
                        </span>
                      ) : (
                        <span className="text-ink/30 dark:text-paper/30">—</span>
                      )}
                    </td>
                    <td className="px-5 py-3.5">
                      {c.interviewScore != null ? (
                        <span className="font-bold tabular-nums text-violet-ink dark:text-violet-deep">{c.interviewScore}%</span>
                      ) : (
                        <span className="text-ink/30 dark:text-paper/30">—</span>
                      )}
                    </td>
                    <td className="px-5 py-3.5 text-ink/55 dark:text-paper/55">{formatDate(c.appliedAt)}</td>
                    <td className="px-5 py-3.5">
                      <span className={cn(
                        'rounded-bubble px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider',
                        c.status === 'active' && 'bg-mint-deep/10 text-mint-deep dark:bg-mint/10 dark:text-mint',
                        c.status === 'pending' && 'bg-ink/5 dark:bg-paper/5 text-ink/50 dark:text-paper/50',
                        c.status === 'retake' && 'bg-coral-deep/10 text-coral-deep dark:bg-coral/10 dark:text-coral',
                        c.step >= 5 && 'bg-neon-deep/15 text-neon-deep dark:bg-neon/15 dark:text-neon',
                      )}>
                        {c.step >= 5 ? 'graduated' : c.status}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => stepUp(c.id)}
                          disabled={c.step >= 5}
                          className="rounded-lg border border-ink/10 dark:border-paper/10 px-2.5 py-1.5 text-[11px] font-semibold text-ink/60 dark:text-paper/60 transition hover:bg-ink/5 dark:bg-paper/5 disabled:opacity-40"
                        >
                          Advance step
                        </button>
                        <button
                          onClick={() => { removeCandidate(c.id); push(`${c.name} removed`, 'error') }}
                          className="grid h-8 w-8 place-items-center rounded-lg border border-coral-deep/20 text-coral-deep transition hover:bg-coral-deep/10 dark:border-coral/20 dark:text-coral dark:hover:bg-coral/10"
                          aria-label="Delete candidate"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {rows.length === 0 && (
          <div className="px-6 py-16 text-center text-sm text-ink/45 dark:text-paper/45">No candidates match your filters.</div>
        )}

        {/* pagination */}
        <div className="flex items-center justify-between border-t border-ink/8 dark:border-paper/8 px-5 py-3.5">
          <p className="text-xs text-ink/45 dark:text-paper/45">
            Showing {rows.length} of {filtered.length} candidates
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={safePage === 0}
              className="grid h-8 w-8 place-items-center rounded-lg border border-ink/10 dark:border-paper/10 disabled:opacity-40"
              aria-label="Previous page"
            >
              <ChevronLeft size={14} />
            </button>
            <span className="text-xs font-semibold text-ink/60 dark:text-paper/60">{safePage + 1} / {pages}</span>
            <button
              onClick={() => setPage((p) => Math.min(pages - 1, p + 1))}
              disabled={safePage >= pages - 1}
              className="grid h-8 w-8 place-items-center rounded-lg border border-ink/10 dark:border-paper/10 disabled:opacity-40"
              aria-label="Next page"
            >
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
