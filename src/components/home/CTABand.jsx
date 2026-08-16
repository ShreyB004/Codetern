import { ArrowRight } from 'lucide-react'
import { Button } from '../ui/Button.jsx'
import { useLoginModal } from '../ui/LoginModal.jsx'
import { useAuth } from '../../context/AppContext.jsx'
import { useRevealScope } from '../../hooks/useReveal.js'
import { useNavigate } from 'react-router-dom'
import { useMagnetic } from '../../hooks/useMagnetic.js'
import { AuroraBackground } from '../ui/backgrounds/AuroraBackground.jsx'
import { ScrollReveal } from '../ui/effects/ScrollReveal.jsx'

/**
 * CTABand — a quiet, centered close. No side panels, no stat spam — just the
 * honest urgency of the open cohort and one way forward.
 */
export function CTABand() {
  const scope = useRevealScope()
  const openLogin = useLoginModal()
  const { isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const magRef = useMagnetic(0.15)

  const go = () => (isAuthenticated ? navigate('/dashboard') : openLogin('signup'))

  return (
    <section ref={scope} className="bg-paper px-5 pb-24 pt-2 lg:px-8 dark:bg-ink">
      <div
        data-reveal
        className="cdt-lively relative mx-auto max-w-5xl overflow-hidden rounded-[3rem] border border-ink/10 bg-ink p-8 text-center text-paper shadow-float sm:p-14 lg:p-20"
      >
        <div className="grid-lines absolute inset-0 opacity-10" />
        <AuroraBackground className="opacity-60" />
        <div className="cdt-blob pointer-events-none absolute left-[-6%] top-[-20%] h-80 w-80 rounded-full bg-neon/12 blur-[120px]" />
        <div className="cdt-blob pointer-events-none absolute bottom-[-30%] right-[-4%] h-96 w-96 rounded-full bg-violet-deep/20 blur-[130px]" />
        <div className="pointer-events-none absolute inset-0 rounded-[3rem] p-px" aria-hidden>
          <div className="h-full w-full rounded-[3rem] bg-gradient-to-br from-cyan-snap/40 via-transparent to-neon/30 opacity-40" />
        </div>

        <div className="relative mx-auto max-w-3xl">
          <span className="mb-6 inline-flex items-center gap-2 rounded-bubble border border-neon/40 bg-neon/10 px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-neon">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-neon" />
            Applications open · next cohort starts in 12 days
          </span>

          <ScrollReveal
            as="h2"
            className="font-display mx-auto max-w-2xl text-balance text-3xl font-extrabold leading-tight tracking-tight text-white sm:text-5xl"
            colors={['transparent', 'transparent', 'transparent', 'transparent', 'transparent', '#22d3ee', 'transparent', '#b4ff39']}
          >
            Your first job starts with work to show.
          </ScrollReveal>

          <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-paper/60">
            No referrals, no networks — just a quiz, a mock interview, and weeks of mentor-reviewed production work.
          </p>

          <div className="mt-9 flex flex-wrap items-center justify-center gap-4">
            <span ref={magRef} className="inline-block">
              <Button size="lg" variant="neon" onClick={go}>
                Start my internship
                <ArrowRight size={17} />
              </Button>
            </span>
            <Button size="lg" variant="lightGhost" magnetic={false} onClick={() => navigate('/portfolio')}>
              See the work it produces
            </Button>
          </div>

          <p className="mt-6 text-xs text-paper/45">
            14 domains · one flat price · 7-day refund · free retake
          </p>
        </div>
      </div>
    </section>
  )
}