import { CalendarCheck, CheckCircle2, FileQuestion, Rocket, ScanFace, UserRound } from 'lucide-react'
import { useRevealScope } from '../../hooks/useReveal.js'
import { Carousel } from '../ui/effects/Carousel.jsx'

const STEPS = [
  {
    n: '01',
    icon: UserRound,
    title: 'Build your intern profile',
    tag: 'Profile',
    gradient: 'linear-gradient(135deg, #22d3ee, #38ffb0)',
    body: (
      <div className="mt-4 space-y-2">
        {[
          ['Domain', 'Full-Stack · Data · Design'],
          ['Stack', 'MERN · Next.js · Python'],
          ['Timeline', '1 · 3 · 6 months'],
        ].map(([k, v]) => (
          <div
            key={k}
            className="flex items-center justify-between rounded-xl bg-white/10 px-3.5 py-2 text-xs backdrop-blur-sm"
          >
            <span className="text-white/65">{k}</span>
            <span className="font-semibold text-white">{v}</span>
          </div>
        ))}
        <p className="pt-1 text-[11px] leading-relaxed text-white/55">
          Your verifiable work trail starts the day you join.
        </p>
      </div>
    ),
  },
  {
    n: '02',
    icon: FileQuestion,
    title: 'Baseline screening quiz',
    tag: 'Graded',
    gradient: 'linear-gradient(135deg, #7c5cff, #22d3ee)',
    body: (
      <div className="mt-4 space-y-2">
        <div className="rounded-xl bg-white/10 px-3.5 py-2.5 text-xs backdrop-blur-sm">
          <p className="text-[10px] uppercase tracking-wider text-white/55">Sample question</p>
          <p className="mt-0.5 font-semibold text-white">“What does useState return in React?”</p>
        </div>
        <div className="flex gap-1.5">
          {[
            ['12 questions', true],
            ['40 minutes', true],
            ['70% to pass', true],
            ['1 free retake', false],
          ].map(([label, solid]) => (
            <span
              key={label}
              className={`flex-1 rounded-lg px-1 py-1.5 text-center text-[10px] font-bold ${
                solid ? 'bg-white/15 text-white' : 'bg-white/5 text-white/55'
              }`}
            >
              {label}
            </span>
          ))}
        </div>
        <p className="pt-1 text-[11px] leading-relaxed text-white/55">
          The same entry bar every employer-verifiable certificate must pass.
        </p>
      </div>
    ),
  },
  {
    n: '03',
    icon: ScanFace,
    title: 'AI mock interview',
    tag: 'AI-scored',
    gradient: 'linear-gradient(135deg, #38ffb0, #b4ff39)',
    body: (
      <div className="mt-4 space-y-2.5">
        {[
          ['Communication', 84],
          ['Technical', 91],
          ['Clarity', 80],
        ].map(([k, v]) => (
          <div key={k} className="flex items-center gap-3">
            <span className="w-[6.5rem] text-xs text-white/65">{k}</span>
            <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/15">
              <div className="h-full rounded-full bg-white/85" style={{ width: `${v}%` }} />
            </div>
            <span className="w-10 text-right text-xs font-bold text-white">{v}/100</span>
          </div>
        ))}
        <p className="pt-1 text-[11px] leading-relaxed text-white/55">
          Recruiters can request the shareable scorecard to verify your interview.
        </p>
      </div>
    ),
  },
  {
    n: '04',
    icon: CalendarCheck,
    title: 'Book your seat',
    tag: 'Live seats',
    gradient: 'linear-gradient(135deg, #b4ff39, #7c5cff)',
    body: (
      <div className="mt-4 space-y-2">
        <div className="flex items-center justify-between rounded-xl bg-white/10 px-3.5 py-2.5 text-xs backdrop-blur-sm">
          <span className="text-white/65">Live seats left</span>
          <span className="font-display text-lg font-extrabold text-white">
            17 <span className="text-xs font-semibold text-white/55">/ 24</span>
          </span>
        </div>
        <div className="rounded-xl bg-white/10 px-3.5 py-2 text-xs backdrop-blur-sm">
          <p className="text-[10px] uppercase tracking-wider text-white/55">Next cohort</p>
          <p className="mt-0.5 font-semibold text-white">MERN · 3 months · starts in 12 days</p>
        </div>
        <p className="pt-1 text-[11px] leading-relaxed text-white/55">
          Refer a friend → ₹500 credit each, applied at checkout.
        </p>
      </div>
    ),
  },
  {
    n: '05',
    icon: Rocket,
    title: 'Ship & graduate',
    tag: 'Verified',
    gradient: 'linear-gradient(135deg, #ff5c7a, #7c5cff)',
    body: (
      <div className="mt-4 space-y-1.5">
        {[
          ['Live project', 'Deployed on your own repo'],
          ['Mentor reviews', 'Weekly feedback until it ships'],
          ['LOR unlock', 'Employer-verifiable in 24h'],
        ].map(([k, v]) => (
          <div key={k} className="flex items-center gap-2.5 rounded-lg bg-white/10 px-3 py-1.5 text-xs backdrop-blur-sm">
            <CheckCircle2 size={14} className="shrink-0 text-white/80" />
            <span className="font-semibold text-white">{k}</span>
            <span className="ml-auto text-right text-white/60">{v}</span>
          </div>
        ))}
      </div>
    ),
  },
]

export function StepsCarousel() {
  const scope = useRevealScope()

  return (
    <section ref={scope} className="relative overflow-hidden bg-paper py-24 dark:bg-ink">
      <div className="relative mx-auto max-w-7xl px-5 lg:px-8">
        <div className="mb-10 text-center" data-reveal>
          <span className="mb-4 inline-block rounded-bubble border border-violet-ink/30 bg-violet-ink/10 px-3.5 py-1.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-violet-ink dark:border-violet-deep/30 dark:bg-violet-deep/10 dark:text-violet-deep">
            How it works
          </span>
          <h2 className="font-display text-3xl font-bold tracking-tight text-ink dark:text-paper sm:text-5xl">
            Five steps to a <span className="text-gradient-pop-deep dark:text-gradient-pop">verifiable portfolio.</span>
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-sm leading-relaxed text-ink/60 dark:text-paper/60">
            One engine behind every internship — build a profile, pass the bar, interview with AI, lock a seat,
            then ship until it&apos;s employer-verifiable.
          </p>
        </div>

        <div data-reveal>
          <Carousel itemsToShow={1.2} autoPlay interval={4500} showDots containerClassName="carousel-steps">
            {STEPS.map(({ n, icon: Icon, title, tag, gradient, body }) => (
              <div
                key={n}
                className="relative flex h-[340px] flex-col justify-end overflow-hidden rounded-panel bg-white p-7 text-white shadow-float"
              >
                <div className="absolute inset-0" style={{ background: gradient }} />
                <div className="absolute inset-0 bg-ink/60" />
                <div className="dot-grid absolute inset-0 opacity-15" />
                <span className="pointer-events-none absolute -top-4 right-4 font-display text-7xl font-extrabold text-white/15">
                  {n}
                </span>
                <div className="relative">
                  <span className="grid h-11 w-11 place-items-center rounded-2xl bg-white/15 backdrop-blur-sm">
                    <Icon size={20} />
                  </span>
                  <h3 className="mt-4 font-display text-2xl font-bold">{title}</h3>
                  <div className="mt-1 text-[10px] font-bold uppercase tracking-wider text-white/70">
                    <span className="rounded-bubble bg-white/12 px-3 py-1">{tag}</span>
                  </div>
                  {body}
                </div>
              </div>
            ))}
          </Carousel>
        </div>
      </div>
    </section>
  )
}