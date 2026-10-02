import { Page } from '../components/layout/Page.jsx'
import { Pill } from '../components/ui/Pill.jsx'
import { Reveal } from '../components/ui/Reveal.jsx'

const SECTIONS = [
  ['The deal', 'Codetern sells weekend engineering courses: pre-recorded direction, live Google Meet sessions (Builder and Pro plans), GitHub PR reviews, team simulations, and mentor messages. Self-paced plans include messages and community access, but no live sessions or PR queue.'],
  ['Payments & refunds', 'Course fees are split into 3 installments published in the LMS. Full refund within 7 days of enrollment, no questions. After that, completed installments are non-refundable; LMS access may pause while an installment is pending.'],
  ['Your responsibilities', 'Submit your own work (plagiarised PRs are rejected and can end enrollment), attend live sessions for attendance, keep login credentials private, and communicate respectfully. Mentors may remove disruptive accounts.'],
  ['Certificates', 'Issued only when attendance is above 75% and every course task is mentor-approved. Certificates are verifiable proof-of-work, not government accreditation and not a job guarantee.'],
  ['Accounts & access', 'Sign-in is via Google and stays valid 30 days at a time. Admins may revoke LMS access for unpaid fees or policy violations; data deletion requests follow the Privacy Policy.'],
  ['Liability', 'Courses are educational and provided “as is”. To the maximum extent permitted by law, liability is limited to the fees you paid in the 3 months before a claim. Disputes are governed by the laws of India, jurisdiction Pune, Maharashtra.'],
  ['Contact', 'Questions about these terms: shreybhangale@gmail.com. Continued use of the platform after updates means acceptance.'],
]

export default function TermsPage() {
  return (
    <Page>
      <section className="mx-auto max-w-3xl px-5 pb-24 pt-28 lg:px-8">
        <Reveal>
          <Pill tone="neon">Last updated: October 2026</Pill>
          <h1 className="mt-4 font-display text-5xl font-extrabold tracking-tight">Terms of Service</h1>
          <p className="mt-3 text-[15px] opacity-60">Short, readable, fair both ways.</p>
        </Reveal>
        <div className="mt-8 grid gap-3">
          {SECTIONS.map(([t, d], i) => (
            <Reveal key={t} delay={Math.min(i * 50, 150)}>
              <div className="rounded-3xl border border-ink/10 bg-white p-6 dark:border-paper/10 dark:bg-ink-soft">
                <h2 className="font-display text-lg font-bold">{t}</h2>
                <p className="mt-1.5 text-sm leading-relaxed opacity-70">{d}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>
    </Page>
  )
}
