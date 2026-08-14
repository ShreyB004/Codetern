import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowRight, Award, BadgeCheck, Clock3, FileSignature, GraduationCap, History, LockKeyhole, RotateCcw, ShieldCheck } from 'lucide-react'
import { Button } from '../ui/Button.jsx'
import { useApp } from '../../context/AppContext.jsx'
import { useToast } from '../../context/ToastContext.jsx'
import { useTheme } from '../../context/ThemeContext.jsx'
import { getProgramme, DOMAIN_COLORS } from '../../data/programmes.js'
import { cn, domainChip } from '../../lib/utils.js'

const LOR_UNLOCK_MS = 24 * 60 * 60 * 1000

function fmt(ms) {
  const total = Math.max(0, Math.floor(ms / 1000))
  const h = Math.floor(total / 3600)
  const m = Math.floor((total % 3600) / 60)
  const s = total % 60
  return [h, m, s].map((n) => String(n).padStart(2, '0')).join(':')
}

export function GraduatePanel() {
  const { candidate, requestLor, startNextInternship } = useApp()
  const { push } = useToast()
  const { isDark } = useTheme()
  const navigate = useNavigate()

  const [now, setNow] = useState(Date.now())
  const unlocked = useMemo(() => {
    if (!candidate?.cert) return true
    return now - new Date(candidate.cert.at).getTime() >= LOR_UNLOCK_MS
  }, [candidate?.cert, now])

  useEffect(() => {
    if (candidate?.cert && !candidate?.lor) {
      const t = setInterval(() => setNow(Date.now()), 1000)
      return () => clearInterval(t)
    }
  }, [candidate?.cert, candidate?.lor])

  if (!candidate?.cert) return null

  const programme = getProgramme(candidate.domain)
  const lor = candidate.lor
  const remaining = unlocked ? 0 : LOR_UNLOCK_MS - (Date.now() - new Date(candidate.cert.at).getTime())
  const certDate = new Date(candidate.cert.at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
  const history = candidate.history || []

  const doLor = () => {
    const id = requestLor()
    if (id) push(`Letter of Recommendation ${id} issued — share it with confidence`, 'success')
  }

  const nextInternship = () => {
    startNextInternship()
    push('Previous internship archived — let’s find your next track!', 'success')
  }

  return (
    <section data-enter className="grid gap-6 lg:grid-cols-[1.3fr_1fr]">
      {/* certificate card */}
      <div className="relative overflow-hidden rounded-panel border border-mint-deep/30 bg-gradient-to-br from-mint-deep/10 via-white to-cyan-deep/10 p-6 shadow-card dark:border-mint/30 dark:from-mint/8 dark:via-ink-soft dark:to-cyan-snap/8 dark:shadow-none">
        <div className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-mint/20 blur-3xl" />
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <span className="grid h-14 w-14 place-items-center rounded-2xl bg-ink text-neon dark:bg-paper dark:text-ink">
              <Award size={26} />
            </span>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-widest text-mint-deep dark:text-mint">Graduate lounge</p>
              <h2 className="font-display text-2xl font-bold text-ink dark:text-paper">Certificate issued 🎓</h2>
            </div>
          </div>
          <span className="rounded-bubble border border-mint-deep/30 bg-mint-deep/10 px-3.5 py-1.5 text-[11px] font-bold uppercase tracking-wider text-mint-deep dark:border-mint/30 dark:bg-mint/10 dark:text-mint">
            <ShieldCheck size={12} className="mr-1 inline" /> Verified
          </span>
        </div>

        <div className="mt-5 grid gap-3 rounded-2xl border border-mint-deep/25 bg-white/70 p-4 dark:border-mint/25 dark:bg-ink">
          {[
            ['Verification ID', candidate.cert.id, 'font-mono text-sm font-bold text-ink dark:text-paper'],
            ['Track', programme?.title || candidate.domainTitle || '—', ''],
            ['Issued on', certDate, ''],
            ['Holder', candidate.name, ''],
          ].map(([k, v, extra]) => (
            <div key={k} className="flex items-center justify-between gap-3 text-sm">
              <span className="text-ink/45 dark:text-paper/45">{k}</span>
              <span className={cn('font-bold text-ink dark:text-paper', extra)}>{v}</span>
            </div>
          ))}
        </div>

        <div className="mt-4 flex flex-wrap gap-3">
          <Button size="md" variant="neon" onClick={() => navigate('/certification')}>
            <BadgeCheck size={15} /> Verify on public portal
          </Button>
        </div>
      </div>

      {/* LOR + next internship card */}
      <div className="flex flex-col gap-4">
        <div className={cn('rounded-panel border bg-white p-6 shadow-card dark:bg-ink-soft dark:shadow-none', lor ? 'border-mint-deep/30 dark:border-mint/30' : 'border-ink/10 dark:border-paper/10')}>
          <div className="flex items-center gap-3">
            <span className={cn('grid h-11 w-11 shrink-0 place-items-center rounded-2xl', lor ? 'bg-mint-deep/15 text-mint-deep dark:bg-mint/15 dark:text-mint' : 'bg-ink/5 text-ink/40 dark:bg-paper/5 dark:text-paper/40')}>
              {lor ? <FileSignature size={20} /> : <LockKeyhole size={20} />}
            </span>
            <div>
              <h3 className="font-display text-lg font-bold text-ink dark:text-paper">Letter of Recommendation</h3>
              <p className="text-xs text-ink/50 dark:text-paper/50">Signed by your internship mentor</p>
            </div>
          </div>

          {lor ? (
            <div className="mt-4 rounded-2xl border border-mint-deep/25 bg-mint-deep/8 px-4 py-3 dark:border-mint/25 dark:bg-mint/8">
              <p className="text-[11px] font-bold uppercase tracking-widest text-mint-deep dark:text-mint">Issued</p>
              <p className="mt-1 font-mono text-sm font-bold text-ink dark:text-paper">{lor.id}</p>
              <p className="mt-1 text-xs text-ink/55 dark:text-paper/55">
                {new Date(lor.at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })} · downloadable from your profile
              </p>
            </div>
          ) : unlocked ? (
            <>
              <p className="mt-3 text-sm text-ink/60 dark:text-paper/55">
                Your recommendation is ready — the 24-hour review window has passed. Request it now.
              </p>
              <Button size="md" variant="accent" className="mt-4" onClick={doLor}>
                <FileSignature size={15} /> Request my LOR
              </Button>
            </>
          ) : (
            <>
              <p className="mt-3 text-sm text-ink/60 dark:text-paper/55">
                Your mentor&apos;s recommendation unlocks 24 hours after your certificate is issued.
              </p>
              <div className="mt-4 flex items-center gap-3 rounded-2xl bg-ink px-4 py-3 text-white dark:bg-ink">
                <Clock3 size={16} className="shrink-0 text-neon" />
                <span className="font-mono text-lg font-extrabold tabular-nums">{fmt(remaining)}</span>
                <span className="text-xs text-white/50">until LOR unlocks</span>
              </div>
            </>
          )}
        </div>

        {lor && (
          <div className="relative overflow-hidden rounded-panel border border-violet-deep/25 bg-gradient-to-br from-violet-deep/10 to-cyan-deep/10 p-6 dark:border-violet-deep/25">
            <div className="flex items-center gap-3">
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-violet-deep/15 text-violet-ink dark:text-violet-deep">
                <GraduationCap size={20} />
              </span>
              <div>
                <h3 className="font-display text-lg font-bold text-ink dark:text-paper">Ready for your next internship?</h3>
                <p className="text-xs text-ink/55 dark:text-paper/50">
                  Alumni like you earn a fresh certificate on every new track.
                </p>
              </div>
            </div>
            <Button size="md" variant="primary" className="mt-4" onClick={nextInternship}>
              <RotateCcw size={15} /> Start another internship
            </Button>
          </div>
        )}

        {history.length > 0 && (
          <div className="rounded-panel border border-ink/10 bg-white p-5 shadow-card dark:border-paper/10 dark:bg-ink-soft dark:shadow-none">
            <p className="mb-3 flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-ink/45 dark:text-paper/45">
              <History size={13} /> Internship history
            </p>
            <ul className="grid gap-2">
              {history.map((h, i) => {
                const c = h.domain ? DOMAIN_COLORS[getProgramme(h.domain)?.color] : null
                return (
                  <li key={i} className="flex items-center gap-3 rounded-xl bg-paper px-3.5 py-2.5 dark:bg-ink">
                    <span className="grid h-7 w-7 shrink-0 place-items-center rounded-lg text-[10px] font-black" style={domainChip(c || { bg: 'rgba(34,211,238,0.12)', fg: '#22d3ee' }, isDark)}>
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-bold text-ink dark:text-paper">{h.domainTitle || h.domain}</span>
                      <span className="text-[11px] text-ink/45 dark:text-paper/45">{h.duration ? `${h.duration} months · ` : ''}{h.cert?.id}</span>
                    </span>
                    {h.lor && <span className="text-[10px] font-black uppercase tracking-wider text-mint-deep dark:text-mint">LOR ✓</span>}
                  </li>
                )
              })}
            </ul>
            <button onClick={() => navigate('/dashboard')} className="mt-3 flex items-center gap-1.5 text-xs font-semibold text-cyan-deep hover:underline dark:text-cyan-snap">
              Back to dashboard <ArrowRight size={12} />
            </button>
          </div>
        )}
      </div>
    </section>
  )
}
