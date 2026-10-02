import { Page } from '../components/layout/Page.jsx'
import { Pill } from '../components/ui/Pill.jsx'
import { Reveal } from '../components/ui/Reveal.jsx'

const SECTIONS = [
  ['What we collect', 'Account data (name, email, profile photo via Google sign-in), application details (phone, education background, LinkedIn/GitHub links, course choice), learning activity (tasks, submissions, PR links, attendance, messages), and basic analytics (page views, device type). We do not collect payment details — payments are confirmed manually with a mentor.'],
  ['Why we collect it', 'To run admissions (reviewing applications), operate the LMS (tracking progress, reviews, attendance, certificates), communicate (announcements, mentor messages), and improve the platform (aggregated analytics).'],
  ['Where it lives', 'Google Firebase (Realtime Database + Authentication) in the asia-southeast1 region, and Google Forms for the formal application step. Backups follow Google’s retention policies.'],
  ['Who sees it', 'Mentors/admins see student data to operate courses. We never sell data or share it with advertisers. Links you submit (GitHub, live demos) are visible inside your batch by design.'],
  ['Your rights (India DPDP Act, 2023)', 'Access, correct, or delete your personal data at any time: edit it in Profile, or email shreybhangale@gmail.com with “Delete my data” and we will erase your records within 30 days, excluding records we must retain for legal reasons.'],
  ['Children', 'Codetern is intended for learners 16 and older. Younger students may join only with verifiable parental consent — contact us first.'],
  ['Changes', 'Material changes to this policy will be announced in Messages at least 7 days before taking effect. Continued use after that means acceptance.'],
]

export default function PrivacyPage() {
  return (
    <Page>
      <section className="mx-auto max-w-3xl px-5 pb-24 pt-28 lg:px-8">
        <Reveal>
          <Pill tone="cyan">Last updated: October 2026</Pill>
          <h1 className="mt-4 font-display text-5xl font-extrabold tracking-tight">Privacy Policy</h1>
          <p className="mt-3 text-[15px] opacity-60">Plain language, no legalese fog. If anything here is unclear, ask a mentor — that’s what we’re for.</p>
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
