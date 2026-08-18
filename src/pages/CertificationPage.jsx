import { useEffect, useRef, useState } from 'react'
import { BadgeCheck, Search, ShieldCheck, Sparkles, X } from 'lucide-react'
import { Page } from '../components/layout/Page.jsx'
import { useRevealScope } from '../hooks/useReveal.js'
import { useTheme } from '../context/ThemeContext.jsx'
import { gsap } from '../lib/gsap.js'
import { buildCandidateSeed, CERT_SAMPLE_ID } from '../data/seed.js'
import { getProgramme } from '../data/programmes.js'
import { DotGrid } from '../components/ui/backgrounds/DotGrid.jsx'
import { ScrollReveal } from '../components/ui/effects/ScrollReveal.jsx'

const CANDIDATES = buildCandidateSeed()

function Certificate({ candidate }) {
  const seal = useRef(null)
  const p = getProgramme(candidate.domain)

  useEffect(() => {
    if (seal.current) {
      const tl = gsap.timeline()
      tl.fromTo(seal.current, { scale: 0, rotate: -120, opacity: 0 }, { scale: 1, rotate: 0, opacity: 1, duration: 1, ease: 'elastic.out(1,0.5)' })
      tl.to('.cdt-cert-ring', { rotate: 360, duration: 8, repeat: -1, ease: 'linear' }, 0)
    }
  }, [])

  return (
    <div className="relative overflow-hidden rounded-[2.25rem] border border-ink/10 bg-gradient-to-br from-white to-mist p-1 shadow-float dark:border-paper/15 dark:from-ink-soft dark:to-ink">
      <div className="dot-grid absolute inset-0 opacity-25" />
      <div className="relative rounded-[2rem] border border-ink/8 bg-white dark:border-paper/10 dark:bg-ink-soft/80 p-8 backdrop-blur-sm sm:p-12">
        <div className="flex flex-wrap items-start justify-between gap-6">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-cyan-deep dark:text-cyan-snap">Codetern · Verified Certificate</p>
            <h2 className="mt-2 font-display text-2xl font-extrabold text-ink dark:text-paper sm:text-3xl">Certificate of Completion</h2>
          </div>
          <div ref={seal} className="relative grid place-items-center">
            <div className="cdt-cert-ring absolute inset-0 rounded-full border-2 border-dashed border-cyan-deep/40 dark:border-cyan-snap/40" />
            <div className="grid h-20 w-20 place-items-center rounded-full bg-ink text-neon shadow-card">
              <BadgeCheck size={34} />
            </div>
          </div>
        </div>

        <p className="mt-8 text-xs font-medium uppercase tracking-[0.2em] text-ink/60 dark:text-paper/60">This certifies that</p>
        <p className="mt-1 font-display text-3xl font-extrabold text-ink dark:text-paper sm:text-4xl">{candidate.name}</p>
        <p className="mt-4 max-w-lg text-sm leading-relaxed text-ink/60 dark:text-paper/60">
          has successfully completed the{' '}
          <span className="font-bold text-ink dark:text-paper">{p?.title || candidate.domainTitle}</span> internship programme at Codetern,
          delivering verifiable production work and passing all screening milestones.
        </p>

        <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
          {[
            { label: 'Verification ID', value: candidate.cert?.id || '—' },
            { label: 'Screening quiz', value: candidate.quizScore ? `${candidate.quizScore}%` : '—' },
            { label: 'Mock interview', value: candidate.interviewScore ? `${candidate.interviewScore}%` : '—' },
            { label: 'Applied', value: candidate.appliedAt || '—' },
          ].map((s) => (
            <div key={s.label} className="rounded-2xl border border-ink/8 bg-paper px-4 py-3 dark:border-paper/10 dark:bg-ink">
              <p className="text-[10px] font-bold uppercase tracking-wider text-ink/60 dark:text-paper/60">{s.label}</p>
              <p className="mt-1 font-display text-base font-bold text-ink dark:text-paper">{s.value}</p>
            </div>
          ))}
        </div>

        <div className="mt-8 flex items-center gap-3 border-t border-ink/8 dark:border-paper/8 pt-6">
          <div
            className="grid h-10 w-10 place-items-center rounded-full text-white"
            style={{
              background:
                'linear-gradient(rgba(11,14,26,0.45), rgba(11,14,26,0.45)), linear-gradient(135deg, var(--color-cyan-snap), var(--color-violet-deep))',
            }}
          >
            <Sparkles size={18} />
          </div>
          <p className="text-sm text-ink/60 dark:text-paper/55">
            Digitally verified by <span className="font-bold text-ink dark:text-paper">Codetern</span> — key matched to on-chain record.
          </p>
          <span className="ml-auto hidden items-center gap-1.5 rounded-bubble bg-mint-deep/10 px-3 py-1 text-[11px] font-bold text-mint-deep sm:inline-flex dark:bg-mint/10 dark:text-mint">
            <ShieldCheck size={13} />
            Authentic
          </span>
        </div>
      </div>
    </div>
  )
}

export default function CertificationPage() {
  const scope = useRevealScope()
  const { isDark } = useTheme()
  const [query, setQuery] = useState('')
  const [result, setResult] = useState(null)

  const lookup = (e) => {
    e.preventDefault()
    const allCerts = CANDIDATES.filter((c) => c.cert)
    const found = allCerts.find((c) => (c.cert?.id || '').toLowerCase() === query.trim().toLowerCase())
    setResult(found || null)
  }

  return (
    <Page className="overflow-hidden">
      <section className="relative overflow-hidden bg-paper py-20 text-ink dark:bg-ink dark:text-paper">
        <div className="grid-lines absolute inset-0 opacity-20" />
        <DotGrid className="absolute inset-0 opacity-80" />
        <div className="relative mx-auto max-w-4xl px-5 text-center lg:px-8">
          <span data-enter className="mb-5 inline-block rounded-bubble border border-neon-deep/40 bg-neon-deep/10 px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-neon-deep dark:border-neon/40 dark:bg-neon/10 dark:text-neon">
            Employer verification
          </span>
          <ScrollReveal
            as="h1"
            className="font-display text-4xl font-extrabold leading-tight tracking-tight sm:text-6xl"
            colors={isDark ? ['transparent', 'transparent', '#7c5cff', '#22d3ee'] : ['transparent', 'transparent', '#5b21b6', '#0e7490']}
          >
            Verify a Codetern certificate.
          </ScrollReveal>
          <p data-enter className="mx-auto mt-5 max-w-2xl text-base text-ink/60 dark:text-paper/60">
            Every certificate carries a unique ID tied to quiz, interview and project data. Enter the ID below to
            inspect the interactive record.
          </p>
        </div>
      </section>

      <section ref={scope} className="bg-paper py-20 dark:bg-ink">
        <div className="mx-auto max-w-3xl px-5 lg:px-8">
          <form onSubmit={lookup} className="relative" data-reveal>
            <span className="pointer-events-none absolute left-5 top-1/2 -translate-y-1/2 text-ink/50 dark:text-paper/50">
              <Search size={18} />
            </span>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={`Enter certificate ID — e.g. ${CERT_SAMPLE_ID}`}
              aria-label="Certificate ID"
              className="focus-ring w-full rounded-full border border-ink/15 bg-white px-12 py-4 pr-32 text-sm text-ink dark:border-paper/20 dark:bg-ink dark:text-paper shadow-card outline-none transition placeholder:text-ink/45 dark:placeholder:text-paper/45"
            />
            <button
              type="submit"
              className="focus-ring absolute right-2 top-1/2 flex min-h-11 -translate-y-1/2 items-center rounded-full bg-ink px-6 py-2.5 text-sm font-semibold text-paper transition hover:bg-ink-soft"
            >
              Verify
            </button>
          </form>

          <div className="mt-4 text-center" data-reveal>
            <p className="text-sm text-ink/60 dark:text-paper/60">
              Try sample ID{' '}
              <button onClick={() => setQuery(CERT_SAMPLE_ID)} className="focus-ring rounded font-semibold text-cyan-deep underline underline-offset-2 dark:text-cyan-snap">
                {CERT_SAMPLE_ID}
              </button>
            </p>
          </div>

          {result === null && query !== '' && (
            <div role="alert" className="mt-8 flex items-center justify-between rounded-2xl border border-coral/30 bg-coral/8 px-5 py-4">
              <p className="text-sm font-medium text-coral-deep dark:text-coral">No certificate matches this ID. Double-check the format.</p>
              <button onClick={() => setQuery('')} aria-label="Clear"><X size={16} className="text-coral-deep/70 dark:text-coral/70" /></button>
            </div>
          )}

          {result && (
            <div className="mt-10" data-reveal>
              <Certificate candidate={result} />
            </div>
          )}

          {!result && query === '' && (
            <div className="mt-12 rounded-panel border border-dashed border-ink/15 bg-white/60 dark:bg-ink-soft/60 p-8 text-center" data-reveal>
              <h3 className="font-display text-lg font-bold text-ink dark:text-paper">Not sure what to enter?</h3>
              <p className="mx-auto mt-2 max-w-md text-sm text-ink/60 dark:text-paper/55">
                You’ll find the ID at the top-right of the certificate you received, e.g. CDT-2026-0007. Production
                certificates are also mailed from certificates@codetern.dev.
              </p>
            </div>
          )}
        </div>
      </section>
    </Page>
  )
}
