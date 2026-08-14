import { ArrowRight } from 'lucide-react'
import { Button } from '../ui/Button.jsx'
import { useLoginModal } from '../ui/LoginModal.jsx'
import { useAuth } from '../../context/AppContext.jsx'
import { useRevealScope } from '../../hooks/useReveal.js'
import { useTheme } from '../../context/ThemeContext.jsx'
import { useNavigate } from 'react-router-dom'
import { useMagnetic } from '../../hooks/useMagnetic.js'
import { AuroraBackground } from '../ui/backgrounds/AuroraBackground.jsx'
import { ScrollReveal } from '../ui/effects/ScrollReveal.jsx'

export function CTABand() {
  const scope = useRevealScope()
  const { isDark } = useTheme()
  const openLogin = useLoginModal()
  const { isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const magRef = useMagnetic(0.15)

  const go = () => (isAuthenticated ? navigate('/dashboard') : openLogin('signup'))

  return (
    <section ref={scope} className="bg-paper px-5 pb-24 lg:px-8 dark:bg-ink">
      <div className="relative mx-auto max-w-6xl overflow-hidden rounded-[2.5rem] border border-ink/8 bg-mist px-6 py-16 text-center text-ink shadow-float sm:px-16 sm:py-20 dark:border-paper/10 dark:bg-ink dark:text-paper" data-reveal>
        <div className="grid-lines absolute inset-0 opacity-15" />
        <AuroraBackground className="opacity-50" />

        <div className="relative">
          <span className="mb-5 inline-block rounded-bubble border border-neon-deep/40 bg-neon-deep/10 px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-neon-deep dark:border-neon/40 dark:bg-neon/10 dark:text-neon">
            Limited seats · batch starts soon
          </span>
          <ScrollReveal
            as="h2"
            className="font-display mx-auto max-w-2xl text-balance text-3xl font-extrabold leading-tight tracking-tight sm:text-5xl"
            colors={isDark ? ['transparent', 'transparent', 'transparent', 'transparent', 'transparent', '#22d3ee', 'transparent', '#b4ff39'] : ['transparent', 'transparent', 'transparent', 'transparent', 'transparent', '#0e7490', 'transparent', '#4d7c0f']}
          >
            Your first job starts with work to show.
          </ScrollReveal>
          <p className="mx-auto mt-4 max-w-xl text-base text-ink/60 dark:text-paper/60">
            Complete the 5-step simulation — profile, screening quiz, AI mock interview, seat booking, live projects —
            and walk out with an employer-verifiable portfolio.
          </p>
          <div className="mt-9 inline-block" ref={magRef}>
            <Button size="lg" variant="neon" onClick={go}>
              Begin the journey now
              <ArrowRight size={17} />
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}