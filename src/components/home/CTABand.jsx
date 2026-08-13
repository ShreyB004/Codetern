import { ArrowRight } from 'lucide-react'
import { Button } from '../ui/Button.jsx'
import { useLoginModal } from '../ui/LoginModal.jsx'
import { useAuth } from '../../context/AppContext.jsx'
import { useRevealScope } from '../../hooks/useReveal.js'
import { useNavigate } from 'react-router-dom'
import { useMagnetic } from '../../hooks/useMagnetic.js'

export function CTABand() {
  const scope = useRevealScope()
  const openLogin = useLoginModal()
  const { isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const magRef = useMagnetic(0.15)

  const go = () => (isAuthenticated ? navigate('/dashboard') : openLogin('signup'))

  return (
    <section ref={scope} className="bg-paper px-5 pb-24 lg:px-8 dark:bg-ink">
      <div className="relative mx-auto max-w-6xl overflow-hidden rounded-[2.5rem] bg-ink px-6 py-16 text-center text-white shadow-float sm:px-16 sm:py-20" data-reveal>
        <div className="grid-lines absolute inset-0 opacity-15" />
        <div className="cdt-blob pointer-events-none absolute -left-20 top-[-40%] h-72 w-72 rounded-full bg-cyan-snap/25 blur-[100px]" />
        <div className="cdt-blob pointer-events-none absolute -right-20 bottom-[-40%] h-72 w-72 rounded-full bg-violet-deep/30 blur-[100px]" style={{ animationDelay: '-7s' }} />

        <div className="relative">
          <span className="mb-5 inline-block rounded-bubble border border-neon/40 bg-neon/10 px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-neon">
            Limited seats · batch starts soon
          </span>
          <h2 className="font-display mx-auto max-w-2xl text-balance text-3xl font-extrabold leading-tight tracking-tight sm:text-5xl">
            Your first job starts with <span className="text-gradient-snap">work to show.</span>
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-base text-white/60">
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