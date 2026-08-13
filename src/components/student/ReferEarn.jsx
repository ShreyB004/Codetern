import { useState } from 'react'
import { Check, Copy, Gift, Link2, MessageCircle, Share2, Users, Wallet } from 'lucide-react'
import { useApp } from '../../context/AppContext.jsx'
import { useToast } from '../../context/ToastContext.jsx'
import { cn } from '../../lib/utils.js'

export function ReferEarn() {
  const { candidate, candidates } = useApp()
  const { push } = useToast()
  const [copied, setCopied] = useState(false)

  if (!candidate) return null

  const link = `${window.location.origin}/?ref=${candidate.referralCode}`
  const balance = candidate.wallet?.balance || 0
  const transactions = candidate.wallet?.transactions || []
  const referrals = candidates.filter((c) => c.referredBy === candidate.id)
  const confirmed = referrals.filter((c) => c.booking)

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(link)
      setCopied(true)
      push('Referral link copied to clipboard', 'success')
      setTimeout(() => setCopied(false), 1800)
    } catch {
      push('Could not copy — select the link manually', 'error')
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
      {/* referral link card */}
      <div className="rounded-panel border border-ink/10 bg-white p-6 shadow-card dark:border-paper/10 dark:bg-ink-soft dark:shadow-none">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="grid h-11 w-11 place-items-center rounded-2xl bg-violet-deep/15 text-violet-deep">
              <Gift size={20} />
            </span>
            <div>
              <h3 className="font-display text-lg font-bold text-ink dark:text-paper">Refer & earn ₹50 cash</h3>
              <p className="text-xs text-ink/50 dark:text-paper/50">
                For every friend who books their seat with your link, ₹50 lands in your internship wallet.
              </p>
            </div>
          </div>
          <span className="rounded-bubble border border-neon/30 bg-neon/10 px-3.5 py-1.5 text-[11px] font-bold uppercase tracking-wider text-neon">
            <Wallet size={12} className="mr-1 inline" /> ₹{balance} in wallet
          </span>
        </div>

        <div className="mt-5 flex flex-col gap-3 sm:flex-row">
          <div className="flex flex-1 items-center gap-3 rounded-2xl border border-dashed border-violet-deep/40 bg-violet-deep/5 px-4 py-3">
            <Link2 size={16} className="shrink-0 text-violet-deep" />
            <div className="min-w-0 flex-1">
              <p className="text-[10px] font-bold uppercase tracking-wider text-ink/40 dark:text-paper/40">Your code</p>
              <code className="block truncate font-mono text-sm font-semibold text-ink dark:text-paper">{link}</code>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={copy}
              className={cn(
                'flex items-center justify-center gap-2 rounded-2xl px-5 py-3 text-sm font-bold transition',
                copied ? 'bg-mint text-ink' : 'bg-violet-deep text-white hover:bg-violet-deep/85',
              )}
            >
              {copied ? <Check size={16} /> : <Copy size={16} />}
              {copied ? 'Copied!' : 'Copy link'}
            </button>
            <a
              href={`https://wa.me/?text=${encodeURIComponent(`Join me at Codetern — an internship simulator with real projects! ${link}`)}`}
              target="_blank"
              rel="noreferrer"
              className="grid w-12 place-items-center rounded-2xl border border-ink/10 text-ink/60 transition hover:border-mint/50 hover:text-mint dark:border-paper/15 dark:text-paper/60"
              aria-label="Share on WhatsApp"
            >
              <MessageCircle size={17} />
            </a>
            <a
              href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(link)}`}
              target="_blank"
              rel="noreferrer"
              className="grid w-12 place-items-center rounded-2xl border border-ink/10 text-ink/60 transition hover:border-cyan-snap/50 hover:text-cyan-snap dark:border-paper/15 dark:text-paper/60"
              aria-label="Share on LinkedIn"
            >
              <Share2 size={17} />
            </a>
          </div>
        </div>

        <div className="mt-5 grid gap-3 rounded-2xl bg-gradient-to-br from-violet-deep/10 to-cyan-snap/10 p-4 sm:grid-cols-3">
          <div className="flex items-center gap-3">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-violet-deep/15 text-violet-deep"><Users size={15} /></span>
            <div>
              <p className="font-display text-lg font-extrabold text-ink dark:text-paper">{referrals.length}</p>
              <p className="text-[10px] font-bold uppercase tracking-wider text-ink/45 dark:text-paper/45">Friends referred</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-mint/15 text-mint"><Wallet size={15} /></span>
            <div>
              <p className="font-display text-lg font-extrabold text-ink dark:text-paper">{confirmed.length}</p>
              <p className="text-[10px] font-bold uppercase tracking-wider text-ink/45 dark:text-paper/45">Seats confirmed</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-neon/15 text-neon"><Gift size={15} /></span>
            <div>
              <p className="font-display text-lg font-extrabold text-ink dark:text-paper">₹{confirmed.length * 50}</p>
              <p className="text-[10px] font-bold uppercase tracking-wider text-ink/45 dark:text-paper/45">Earned so far</p>
            </div>
          </div>
        </div>
      </div>

      {/* wallet ledger */}
      <div className="flex flex-col gap-4">
        <div className="rounded-2xl border border-ink/10 bg-white p-5 dark:border-paper/10 dark:bg-ink-soft">
          <p className="mb-3 text-[11px] font-bold uppercase tracking-widest text-ink/45 dark:text-paper/45">Wallet ledger</p>
          {transactions.length > 0 ? (
            <ul className="grid gap-2.5">
              {transactions.map((t) => (
                <li key={t.id} className="flex items-center justify-between gap-3 rounded-xl bg-paper px-3.5 py-2.5 dark:bg-ink">
                  <div className="min-w-0">
                    <p className="truncate text-xs font-semibold text-ink dark:text-paper">{t.reason}</p>
                    <p className="text-[10px] text-ink/40 dark:text-paper/40">{new Date(t.at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</p>
                  </div>
                  <span className="shrink-0 font-display text-sm font-bold text-mint">+₹{t.amount}</span>
                </li>
              ))}
            </ul>
          ) : (
            <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-ink/15 py-8 text-center dark:border-paper/15">
              <Gift size={20} className="text-ink/25 dark:text-paper/25" />
              <p className="text-sm font-semibold text-ink/55 dark:text-paper/55">No rewards yet</p>
              <p className="max-w-xs text-xs text-ink/40 dark:text-paper/40">
                Share your link and earn ₹50 for every friend who confirms their seat.
              </p>
            </div>
          )}
        </div>

        <div className="rounded-2xl border border-ink/10 bg-white p-5 dark:border-paper/10 dark:bg-ink-soft">
          <p className="text-[11px] font-bold uppercase tracking-widest text-ink/45 dark:text-paper/45">How it pays out</p>
          <ol className="mt-3 grid gap-2.5">
            {[
              'Your friend signs up with your link',
              'They pick a track and lock their seat',
              '₹50 lands in your wallet automatically',
            ].map((t, i) => (
              <li key={t} className="flex items-start gap-3 text-xs text-ink/60 dark:text-paper/60">
                <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-violet-deep/15 text-[10px] font-black text-violet-deep">{i + 1}</span>
                {t}
              </li>
            ))}
          </ol>
        </div>
      </div>
    </div>
  )
}