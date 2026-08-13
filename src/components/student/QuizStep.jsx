import { useEffect, useRef, useState } from 'react'
import { AlertTriangle, ChevronRight, Play, RotateCcw, Timer, Trophy } from 'lucide-react'
import { StepShell } from './JourneyTracker.jsx'
import { Button } from '../ui/Button.jsx'
import { useApp } from '../../context/AppContext.jsx'
import { useToast } from '../../context/ToastContext.jsx'
import { passMark } from '../../data/quizData.js'
import { gsap } from '../../lib/gsap.js'
import { cn } from '../../lib/utils.js'

function CountdownBar({ total, onExpire }) {
  const ref = useRef(null)

  useEffect(() => {
    const tl = gsap.fromTo(
      ref.current,
      { scaleX: 1 },
      {
        scaleX: 0,
        duration: total,
        ease: 'none',
        onComplete: onExpire,
      },
    )
    return () => tl.kill()
  }, [total]) // eslint-disable-line react-hooks/exhaustive-deps

  return <div ref={ref} className="h-2 w-full origin-left rounded-full bg-gradient-to-r from-cyan-snap to-coral" />
}

export function QuizStep({ onComplete }) {
  const { candidate, saveQuizResult, quizBanks } = useApp()
  const { push } = useToast()
  const bank = quizBanks?.[candidate?.domain]
  const questions = bank?.questions?.filter((q) => q.enabled !== false) || []

  const [phase, setPhase] = useState(() => (candidate?.quiz?.passed ? 'done' : 'intro'))
  const [index, setIndex] = useState(0)
  const [selected, setSelected] = useState(null)
  const [score, setScore] = useState(0)
  const [answered, setAnswered] = useState([])
  const [retakeKey, setRetakeKey] = useState(0)

  if (!bank) {
    return (
      <StepShell step={4}>
        <p className="rounded-2xl border border-coral/30 bg-coral/8 px-4 py-3 text-sm text-coral">
          No assessment questions for this domain yet — pick another track in step 2, or ask the admin to add a question bank.
        </p>
      </StepShell>
    )
  }

  const totalTime = questions.length * 12
  const pass = passMark(candidate.domain)

  const start = () => {
    setPhase('active')
    setIndex(0)
    setScore(0)
    setSelected(null)
    setAnswered([])
    setRetakeKey((k) => k + 1)
  }

  const choose = (i) => {
    if (selected !== null) return
    setSelected(i)
    setAnswered((prev) => [...prev, i])
    if (i === questions[index].answer) setScore((s) => s + 1)
  }

  const next = () => {
    if (index + 1 < questions.length) {
      setIndex((i) => i + 1)
      setSelected(null)
    } else {
      const finalScore = score
      const passed = finalScore >= pass
      saveQuizResult(candidate.domain, Math.round((finalScore / questions.length) * 100), passed)
      setPhase('result')
      if (passed) push('Quiz passed — mock interview unlocked', 'success')
    }
  }

  const expire = () => {
    if (phase !== 'active') return
    const passed = score >= pass
    saveQuizResult(candidate.domain, Math.round((score / questions.length) * 100), passed)
    setPhase('result')
  }

  // ── intro ──
  if (phase === 'intro') {
    return (
      <StepShell step={4} onBack={() => {}}>
        <div className="flex flex-col items-center py-6 text-center">
          <span className="grid h-16 w-16 place-items-center rounded-3xl bg-ink text-neon">
            <Timer size={28} />
          </span>
          <h3 className="mt-5 font-display text-2xl font-bold text-ink dark:text-paper">{questions.length} assessment questions</h3>
          <p className="mt-2 max-w-md text-sm text-ink/55 dark:text-paper/55">
            You have <span className="font-bold text-ink dark:text-paper">{totalTime}s</span> on the live clock. Score{' '}
            <span className="font-bold text-ink dark:text-paper">{pass}+</span> to unlock the final interview. No pressure — retake is
            free.
          </p>
          <div className="mt-7 flex flex-wrap justify-center gap-2.5">
            {['MCQ', 'GSAP countdown', 'Instant feedback'].map((t) => (
              <span key={t} className="rounded-bubble bg-cyan-snap/10 px-3.5 py-1.5 text-[11px] font-bold uppercase tracking-wider text-cyan-snap">
                {t}
              </span>
            ))}
          </div>
          <Button size="lg" variant="primary" className="mt-8" onClick={start}>
            <Play size={16} /> Begin quiz
          </Button>
        </div>
      </StepShell>
    )
  }

  // ── result ──
  if (phase === 'result') {
    const pct = Math.round((score / questions.length) * 100)
    const passed = pct >= pass
    return (
      <StepShell step={4}>
        <div className="flex flex-col items-center py-4 text-center">
          <span className={cn('grid h-20 w-20 place-items-center rounded-full', passed ? 'bg-mint/15 text-mint' : 'bg-coral/15 text-coral')}>
            {passed ? <Trophy size={36} /> : <AlertTriangle size={36} />}
          </span>
          <h3 className={cn('mt-5 font-display text-3xl font-bold dark:text-paper', passed ? 'text-ink' : 'text-coral')}>
            {passed ? 'You passed!' : 'So close — retake it'}
          </h3>
          <p className="mt-2 text-sm text-ink/55 dark:text-paper/55">
            Score <span className="font-display text-2xl font-extrabold text-ink dark:text-paper">{pct}%</span> · {score}/{questions.length} correct · pass mark {pass}
          </p>
          <div className="mt-6 flex w-full max-w-sm gap-2">
            {answered.map((a, i) => (
              <span
                key={i}
                className={cn(
                  'h-2 flex-1 rounded-full',
                  a === questions[i].answer ? 'bg-mint' : 'bg-coral',
                )}
              />
            ))}
          </div>
          {passed ? (
            <Button size="lg" variant="accent" className="mt-8" onClick={onComplete}>
              Continue to final interview <ChevronRight size={16} />
            </Button>
          ) : (
            <Button size="lg" variant="primary" className="mt-8" onClick={() => setPhase('intro')}>
              <RotateCcw size={16} /> Retake quiz
            </Button>
          )}
        </div>
      </StepShell>
    )
  }

  // ── done (already passed earlier) ──
  if (candidate?.quiz?.passed && phase === 'done') {
    return (
      <StepShell step={4}>
        <div className="flex flex-col items-center py-4 text-center">
          <span className="grid h-16 w-16 place-items-center rounded-full bg-mint/15 text-mint">
            <Trophy size={30} />
          </span>
          <h3 className="mt-4 font-display text-2xl font-bold text-ink dark:text-paper">Quiz complete — {candidate.quiz.score}%</h3>
          <p className="mt-2 text-sm text-ink/55 dark:text-paper/55">You already cleared the assessment. The final interview is next.</p>
          <Button size="lg" variant="accent" className="mt-7" onClick={onComplete}>
            Go to final interview <ChevronRight size={16} />
          </Button>
        </div>
      </StepShell>
    )
  }

  // ── active question ──
  const q = questions[index]
  const progress = (index / questions.length) * 100

  return (
    <StepShell step={4}>
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-ink text-neon">
            <Timer size={17} />
          </span>
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-ink/45 dark:text-paper/45">Live clock</p>
            <p className="text-sm font-bold text-ink dark:text-paper">
              Question {index + 1} of {questions.length}
            </p>
          </div>
        </div>
        <p className="rounded-bubble bg-ink/5 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-ink/50 dark:bg-paper/10 dark:text-paper/50">
          {Math.max(0, totalTime)}s
        </p>
      </div>

      <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-ink/8 dark:bg-paper/8">
        <div className="h-full bg-gradient-to-r from-cyan-snap to-mint transition-all duration-500" style={{ width: `${progress}%` }} />
      </div>

      <div className="mt-5" key={`clock-${retakeKey}`}>
        <CountdownBar key={`bar-${retakeKey}`} total={totalTime} onExpire={expire} />
      </div>

      <h3 className="mt-6 font-display text-xl font-bold leading-snug text-ink dark:text-paper">{q.q}</h3>

      <div className="mt-6 grid gap-3">
          {q.options.map((opt, i) => {
            const isCorrect = selected !== null && i === q.answer
            const isWrong = selected === i && selected !== q.answer
            return (
              <button
                key={i}
                onClick={() => choose(i)}
                disabled={selected !== null}
                className={cn(
                  'flex items-center justify-between gap-3 rounded-2xl border px-5 py-3.5 text-left text-sm font-medium transition-all duration-300',
                  isCorrect && 'border-mint/60 bg-mint/10 text-ink',
                  isWrong && 'border-coral/60 bg-coral/10 text-coral',
                  selected === null && 'border-ink/12 bg-white text-ink/80 hover:border-cyan-snap/50 hover:bg-cyan-snap/5 dark:border-paper/15 dark:bg-ink-soft dark:text-paper/80',
                  selected !== null && !isCorrect && !isWrong && 'border-ink/8 bg-white text-ink/40 dark:border-paper/10 dark:bg-ink-soft dark:text-paper/40',
                )}
              >
                <span className="flex items-center gap-3">
                  <span className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-ink/5 text-[11px] font-bold text-ink/50 dark:bg-paper/5 dark:text-paper/50">
                    {String.fromCharCode(65 + i)}
                  </span>
                  {opt}
                </span>
                {isCorrect && <span className="text-xs font-bold text-mint">✓</span>}
                {isWrong && <span className="text-xs font-bold text-coral">✗</span>}
              </button>
            )
          })}
        </div>

        {selected !== null && (
          <div className="mt-6 flex items-center justify-between gap-4">
            <p
              className={cn(
                'text-sm font-semibold',
                selected === q.answer ? 'text-mint' : 'text-coral',
              )}
            >
              {selected === q.answer ? 'Correct — one step closer.' : `Not quite. ${q.why || 'Check the fundamentals and move on.'}`}
            </p>
            <Button size="md" variant="primary" onClick={next}>
              {index + 1 < questions.length ? 'Next' : 'See results'}
              <ChevronRight size={15} />
            </Button>
          </div>
        )}
    </StepShell>
  )
}
