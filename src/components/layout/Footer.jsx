import { Link } from 'react-router-dom'
import { Github, Instagram, Linkedin, Twitter, Zap } from 'lucide-react'
import { StarfieldBackground } from '../ui/backgrounds/StarfieldBackground.jsx'

const SOCIALS = [
  { label: 'Codetern on X (Twitter)', href: 'https://x.com/codetern', Icon: Twitter },
  { label: 'Codetern on Instagram', href: 'https://instagram.com/codetern', Icon: Instagram },
  { label: 'Codetern on LinkedIn', href: 'https://linkedin.com/company/codetern', Icon: Linkedin },
  { label: 'Codetern on GitHub', href: 'https://github.com/codetern', Icon: Github },
]

const COLUMNS = [
  {
    title: 'Programmes',
    links: [
      { label: 'Full-Stack (MERN)', to: '/domains' },
      { label: 'AI & LLM Development', to: '/domains' },
      { label: 'Cybersecurity', to: '/domains' },
      { label: 'UI/UX Design', to: '/domains' },
    ],
  },
  {
    title: 'Platform',
    links: [
      { label: 'About Codetern', to: '/about' },
      { label: 'Pricing', to: '/pricing' },
      { label: 'Certificate verification', to: '/certification' },
      { label: 'Student dashboard', to: '/dashboard' },
      { label: 'Contact', to: '/contact' },
    ],
  },
]

export function Footer() {
  return (
    <footer className="relative overflow-hidden bg-paper text-ink dark:bg-ink dark:text-paper" data-track-section="footer">
      <StarfieldBackground count={40} speed={0.4} className="opacity-30" />
      <div className="dot-grid pointer-events-none absolute inset-0 opacity-40" />
      <div className="relative mx-auto max-w-7xl px-5 py-16 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-[1.4fr_1fr_1fr]">
          <div>
            <Link to="/" className="flex items-center gap-2.5">
              <span className="grid h-9 w-9 place-items-center rounded-xl bg-ink/10 text-cyan-deep dark:bg-white/10 dark:text-cyan-snap">
                <Zap size={18} strokeWidth={2.4} />
              </span>
              <span className="font-display text-xl font-bold">
                Code<span className="text-cyan-deep dark:text-cyan-snap">tern</span>
              </span>
            </Link>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-ink/60 dark:text-paper/60">
              Mentor-led internships with real stakes. Ship production-ready projects across 14 domains and graduate
              with deployed, reviewable work recruiters can verify — not just a certificate.
            </p>
            <div className="mt-6 flex gap-2.5">
              {SOCIALS.map(({ label, href, Icon }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="focus-ring grid h-11 w-11 place-items-center rounded-xl border border-ink/15 text-ink/70 transition hover:border-neon-deep/50 hover:text-neon-deep dark:border-white/15 dark:text-paper/70 dark:hover:border-neon/50 dark:hover:text-neon"
                >
                  <Icon size={16} />
                </a>
              ))}
            </div>
          </div>

          {COLUMNS.map((col) => (
            <div key={col.title}>
              <h4 className="text-xs font-bold uppercase tracking-[0.18em] text-ink/60 dark:text-paper/60">{col.title}</h4>
              <ul className="mt-4 flex flex-col gap-2.5">
                {col.links.map((l) => (
                  <li key={l.label}>
                    <Link to={l.to} className="focus-ring rounded text-sm text-ink/70 transition hover:text-neon-deep dark:text-paper/70 dark:hover:text-neon">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-14 flex flex-col items-center justify-between gap-4 border-t border-ink/10 pt-6 sm:flex-row dark:border-white/10">
          <p className="text-xs text-ink/60 dark:text-paper/60">© {new Date().getFullYear()} Codetern. Crafted for career acceleration.</p>
          <p className="text-xs text-ink/60 dark:text-paper/60">
            Built with React · GSAP · Tailwind <span className="text-neon-deep dark:text-neon">— get real work done.</span>
          </p>
        </div>
      </div>
    </footer>
  )
}