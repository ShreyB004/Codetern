import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { LayoutDashboard, LogOut } from 'lucide-react'
import { Page } from '../components/layout/Page.jsx'
import { JourneyTracker } from '../components/student/JourneyTracker.jsx'
import { ResumeStep } from '../components/student/ResumeStep.jsx'
import { QuizStep } from '../components/student/QuizStep.jsx'
import { InterviewStep } from '../components/student/InterviewStep.jsx'
import { BookingStep } from '../components/student/BookingStep.jsx'
import { WorkspaceStep } from '../components/student/WorkspaceStep.jsx'
import { useAuth } from '../context/AppContext.jsx'
import { useSeats } from '../context/SeatsContext.jsx'
import { SkeletonPage } from '../components/ui/Skeleton.jsx'
import { getProgramme } from '../data/programmes.js'

export default function DashboardPage() {
  const { user, candidate, logout, isAuthenticated } = useAuth()
  const { getRemaining } = useSeats()
  const navigate = useNavigate()

  const [active, setActive] = useState(candidate?.step || 1)

  useEffect(() => {
    if (candidate?.step) setActive((a) => Math.max(a, candidate.step))
  }, [candidate?.step])

  if (!isAuthenticated) return <SkeletonPage />

  const programme = candidate?.domain ? getProgramme(candidate.domain) : null
  const book = candidate?.booking
  const seatsLeft = book && programme ? getRemaining(candidate.domain, book.duration) : null
  const certDone = !!candidate?.cert

  return (
    <Page className="bg-paper">
      <div className="dot-grid relative mx-auto max-w-6xl px-5 py-10 lg:px-8">
        {/* header */}
        <div className="mb-10 flex flex-col justify-between gap-6 sm:flex-row sm:items-start">
          <div data-enter>
            <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-cyan-snap">Candidate journey</p>
            <h1 className="mt-1 font-display text-3xl font-bold tracking-tight text-ink sm:text-4xl">
              Welcome back, {user?.name?.split(' ')[0]}
            </h1>
            <div className="mt-3 flex flex-wrap items-center gap-2.5">
              {programme ? (
                <span className="rounded-bubble bg-ink/5 px-3.5 py-1.5 text-xs font-bold text-ink">
                  {programme.title}
                </span>
              ) : (
                <span className="rounded-bubble bg-mint/10 px-3.5 py-1.5 text-xs font-bold text-mint">Profile pending</span>
              )}
              {book && (
                <span className="rounded-bubble bg-cyan-snap/10 px-3.5 py-1.5 text-xs font-bold text-cyan-snap">
                  {book.duration}-month batch · {seatsLeft} seats left
                </span>
              )}
              {certDone && (
                <span className="rounded-bubble bg-neon/15 px-3.5 py-1.5 text-xs font-bold text-neon">Certificate issued ✓</span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2.5" data-enter>
            <button
              onClick={logout}
              className="flex items-center gap-2 rounded-full border border-ink/12 px-4 py-2.5 text-sm font-semibold text-ink/60 transition hover:bg-ink/5 hover:text-ink"
            >
              <LogOut size={15} /> Sign out
            </button>
            <button
              onClick={() => navigate('/')}
              className="flex items-center gap-2 rounded-full bg-ink px-4 py-2.5 text-sm font-semibold text-paper transition hover:bg-ink-soft"
            >
              <LayoutDashboard size={15} /> Back to site
            </button>
          </div>
        </div>

        {/* journey tracker */}
        <div data-enter>
          <JourneyTracker active={active} onJump={setActive} />
        </div>

        {/* active step */}
        <div className="mt-8">
          <ActiveStep active={active} onAdvance={() => setActive((a) => Math.min(a + 1, 5))} canBackToRoot />
        </div>
      </div>
    </Page>
  )
}

export function ActiveStep({ active, onAdvance }) {
  switch (active) {
    case 1:
      return <ResumeStep onComplete={onAdvance} />
    case 2:
      return <QuizStep onComplete={onAdvance} />
    case 3:
      return <InterviewStep onComplete={onAdvance} />
    case 4:
      return <BookingStep onComplete={onAdvance} />
    case 5:
      return <WorkspaceStep />
    default:
      return <ResumeStep onComplete={onAdvance} />
  }
}