import { useEffect, useRef, useState } from 'react'
import { BadgeCheck, Camera, Check, Clock3, Mic, MicOff, Scan, Sparkles, Video, VideoOff } from 'lucide-react'
import { StepShell } from './JourneyTracker.jsx'
import { Button } from '../ui/Button.jsx'
import { useApp } from '../../context/AppContext.jsx'
import { INTERVIEW_QUESTIONS, INTERVIEW_FEEDBACK } from '../../data/workspace.js'
import { gsap } from '../../lib/gsap.js'
import { cn } from '../../lib/utils.js'

const PHASES = ['idle', 'recording', 'analyzing', 'done']

export function InterviewStep({ onComplete }) {
  const { candidate, saveInterview, claimCert } = useApp()
  const [phase, setPhase] = useState(() => (candidate?.interview ? 'done' : 'idle'))
  const [qIndex, setQIndex] = useState(0)
  const [typed, setTyped] = useState('')
  const [micOn, setMicOn] = useState(true)
  const [camOn, setCamOn] = useState(true)
  const [certId, setCertId] = useState(candidate?.cert?.id || '')
  const cam = useRef(null)

  // GSAP cam intro + screen-glow
  useEffect(() => {
    if (phase === 'idle' || phase === 'recording') {
      gsap.fromTo(cam.current, { scale: 0.94, opacity: 0.6 }, { scale: 1, opacity: 1, duration: 0.6, ease: 'expo.out' })
    }
  }, [phase])

  // GSAP typing effect for questions
  useEffect(() => {
    if (phase !== 'recording') return
    const text = INTERVIEW_QUESTIONS[qIndex]
    setTyped('')
    const obj = { n: 0 }
    const tl = gsap.to(obj, {
      n: text.length,
      duration: 1.8,
      ease: 'none',
      onUpdate: () => setTyped(text.slice(0, Math.round(obj.n))),
    })
    return () => tl.kill()
  }, [phase, qIndex])

  const start = () => {
    setPhase('recording')
    setQIndex(0)
  }

  const answerOk = () => {
    if (qIndex + 1 < INTERVIEW_QUESTIONS.length) {
      setQIndex((i) => i + 1)
    } else {
      setPhase('analyzing')
      // unlock milestone + issue certificate right after the interview
      setTimeout(() => {
        const score = 84
        saveInterview({ score, feedback: INTERVIEW_FEEDBACK, done: true })
        const id = claimCert()
        if (id) setCertId(id)
        setPhase('done')
      }, 2400)
    }
  }

  const done = phase === 'done'
  const analyzing = phase === 'analyzing'

  return (
    <StepShell step={5}>
      {done ? (
        <div className="flex flex-col items-center py-4 text-center">
          <span className="grid h-20 w-20 place-items-center rounded-full bg-mint-deep/15 text-mint-deep dark:bg-mint/15 dark:text-mint">
            <Sparkles size={34} />
          </span>
          <h3 className="mt-5 font-display text-3xl font-bold text-ink dark:text-paper">Milestone unlocked</h3>
          <p className="mt-2 max-w-md text-sm text-ink/60 dark:text-paper/55">
            Your AI scorecard: <span className="font-display text-xl font-extrabold text-ink dark:text-paper">{candidate?.interview?.score || 84}%</span>.{' '}
            {INTERVIEW_FEEDBACK.next}
          </p>
          <div className="mt-5 grid w-full max-w-md gap-3 text-left">
            {Object.entries(INTERVIEW_FEEDBACK).filter(([k]) => k !== 'next').map(([k, v]) => (
              <div key={k} className="flex gap-3 rounded-2xl border border-ink/8 bg-paper px-4 py-3 dark:border-paper/10 dark:bg-ink">
                <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-mint-deep/15 text-xs font-bold text-mint-deep dark:bg-mint/15 dark:text-mint">
                  <Check size={13} />
                </span>
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-ink/60 dark:text-paper/45">{k}</p>
                  <p className="text-sm text-ink/70 dark:text-paper/70">{v}</p>
                </div>
              </div>
            ))}
          </div>

          {/* certificate issued right after the interview */}
          <div className="mt-6 w-full max-w-md rounded-2xl border border-mint-deep/30 bg-mint-deep/8 p-5 text-left dark:border-mint/30 dark:bg-mint/8">
            <div className="flex items-center gap-3">
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-mint-deep/15 text-mint-deep dark:bg-mint/15 dark:text-mint">
                <BadgeCheck size={22} />
              </span>
              <div className="min-w-0">
                <p className="text-[11px] font-bold uppercase tracking-widest text-mint-deep dark:text-mint">Certificate issued</p>
                <p className="mt-0.5 font-mono text-sm font-bold text-ink dark:text-paper">{certId}</p>
              </div>
            </div>
            <p className="mt-3 flex items-center gap-1.5 text-xs text-ink/60 dark:text-paper/55">
              <Clock3 size={13} className="text-mint-deep dark:text-mint" />
              Verify it on the public Certification page. Your Letter of Recommendation unlocks 24 hours from now.
            </p>
          </div>

          <Button size="lg" variant="accent" className="mt-7" onClick={onComplete}>
            Complete my journey →
          </Button>
        </div>
      ) : (
        <div className="grid gap-8 lg:grid-cols-[1.4fr_1fr]">
          {/* camera frame */}
          <div className="relative overflow-hidden rounded-3xl border border-ink/12 dark:border-paper/12 bg-ink shadow-float">
            {/* gradient avatar backdrop */}
            <div className="relative aspect-[16/11] w-full">
              <div className="absolute inset-0 bg-gradient-to-br from-ink-soft via-ink to-[#0b0e1a]" />
              <div className="dot-grid absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(rgb(255 255 255 / 0.1) 1px, transparent 1px)' }} />

              {/* silhouette mock */}
              <div className="absolute inset-x-0 bottom-0 flex justify-center">
                <div className="relative h-52 w-44 rounded-t-full border-4 border-b-0 border-white/15 bg-gradient-to-b from-white/10 to-white/[0.02]" />
              </div>

              {/* scan line overlays */}
              {analyzing && (
                <div className="pointer-events-none absolute inset-x-0 h-full overflow-hidden">
                  <Scan className="absolute inset-x-0 mx-auto h-12 w-12 animate-pulse text-neon" style={{ top: '38%' }} />
                  <div className="cdt-scanline absolute inset-x-0 h-16 bg-gradient-to-b from-transparent via-neon/40 to-transparent" />
                  <p className="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-bubble bg-ink/70 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-neon">
                    Analyzing video · emotion · clarity
                  </p>
                </div>
              )}

              {/* recording badge */}
              {phase === 'recording' && (
                <div className="absolute left-4 top-4 flex items-center gap-2 rounded-bubble bg-coral/90 px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-white">
                  <span className="h-2 w-2 animate-pulse rounded-full bg-white" />
                  REC {qIndex + 1}/{INTERVIEW_QUESTIONS.length}
                </div>
              )}

              {/* question overlay */}
              <div className="absolute inset-x-4 bottom-4 sm:inset-x-6 sm:bottom-6">
                <div className="rounded-2xl border border-white/12 bg-ink-soft/85 px-5 py-4 backdrop-blur-md">
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-neon">AI Interviewer</p>
                  <p ref={cam} className="mt-1 min-h-[48px] text-sm font-medium leading-relaxed text-white/90 sm:text-base">
                    {analyzing && !typed ? 'Reading your responses…' : typed || INTERVIEW_QUESTIONS[qIndex]}
                  </p>
                </div>
              </div>
            </div>

            {/* controls bar */}
            <div className="flex items-center justify-center gap-3 border-t border-white/10 bg-ink-soft px-4 py-4">
              <button
                onClick={() => setMicOn((v) => !v)}
                className={cn(
                  'grid h-11 w-11 place-items-center rounded-full transition',
                  micOn ? 'bg-white/10 text-white' : 'bg-coral text-white',
                )}
                aria-label={micOn ? 'Mute' : 'Unmute'}
              >
                {micOn ? <Mic size={18} /> : <MicOff size={18} />}
              </button>
              <button
                onClick={() => setCamOn((v) => !v)}
                className={cn(
                  'grid h-11 w-11 place-items-center rounded-full transition',
                  camOn ? 'bg-white/10 text-white' : 'bg-coral text-white',
                )}
                aria-label={camOn ? 'Camera off' : 'Camera on'}
              >
                {camOn ? <Video size={18} /> : <VideoOff size={18} />}
              </button>
              <span className="mx-2 h-8 w-px bg-white/10" />
              <Button
                size="sm"
                variant={phase === 'recording' ? 'danger' : 'accent'}
                onClick={phase === 'recording' ? answerOk : start}
                disabled={analyzing}
              >
                {phase === 'idle' ? 'Start mock interview' : analyzing ? 'Analyzing…' : 'Next question'}
              </Button>
            </div>
          </div>

          {/* side info */}
          <div className="flex flex-col gap-4">
            <div className="rounded-panel border border-ink/8 bg-white p-5 shadow-card dark:border-paper/10 dark:bg-ink-soft dark:shadow-none">
              <div className="flex items-center gap-3">
                <span className="grid h-10 w-10 place-items-center rounded-xl bg-ink text-neon">
                  <Camera size={18} />
                </span>
                <div>
                  <p className="text-sm font-bold text-ink dark:text-paper">How this milestone works</p>
                  <p className="text-xs text-ink/60 dark:text-paper/45">100% simulated · no real uploads</p>
                </div>
              </div>
              <ul className="mt-4 space-y-2.5 text-sm text-ink/60 dark:text-paper/60">
                {['Answer on camera as the prompts auto-advance', 'Our engine scores clarity, structure & poise', 'Finishing unlocks your final scorecard & certificate route'].map((t, i) => (
                  <li key={t} className="flex gap-2.5">
                    <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-mint-deep/15 text-[10px] font-bold text-mint-deep dark:bg-mint/15 dark:text-mint">{i + 1}</span>
                    {t}
                  </li>
                ))}
              </ul>
            </div>
            <div className="flex-1 rounded-panel border border-dashed border-ink/15 bg-paper/60 p-5 dark:border-paper/15 dark:bg-ink">
              <p className="text-xs font-bold uppercase tracking-widest text-ink/60 dark:text-paper/40">Prep notes</p>
              <p className="mt-2 text-sm leading-relaxed text-ink/60 dark:text-paper/55">
                Treat it like a real call — the “recording” is a beauty pass captured locally in your browser session.
                Nerves are normal; articulating your trade-offs is the skill being measured.
              </p>
            </div>
          </div>
        </div>
      )}
    </StepShell>
  )
}
