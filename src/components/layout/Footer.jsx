import { Link } from 'react-router-dom'
import { Github, Instagram, Linkedin, Twitter, ArrowUpRight } from 'lucide-react'
import { useSite } from '../../hooks/useSite.js'

const SOCIALS = [
  { label: 'Codetern on X (Twitter)', href: 'https://x.com/codetern', Icon: Twitter },
  { label: 'Codetern on Instagram', href: 'https://instagram.com/codetern', Icon: Instagram },
  { label: 'Codetern on LinkedIn', href: 'https://linkedin.com/company/codetern', Icon: Linkedin },
  { label: 'Codetern on GitHub', href: 'https://github.com/codetern', Icon: Github },
]

const COLUMNS = [
  {
    title: 'Courses',
    links: [
      { label: 'AI & LLMs', to: '/learn/ai-llms' },
      { label: 'Web Development', to: '/learn/web-dev' },
      { label: 'Databases', to: '/learn/databases' },
      { label: 'API Architecture', to: '/learn/api-arch' },
    ],
  },
  {
    title: 'Platform',
    links: [
      { label: 'All courses', to: '/courses' },
      { label: 'Pricing', to: '/pricing' },
      { label: 'About', to: '/about' },
      { label: 'Join now', to: '/join' },
      { label: 'Privacy', to: '/privacy' },
      { label: 'Terms', to: '/terms' },
    ],
  },
]

export function Footer() {
  const site = useSite('footer')
  return (
    <footer className="relative overflow-hidden border-t border-ink/10 bg-paper text-ink dark:border-paper/10 dark:bg-ink dark:text-paper">
      <div className="dot-grid pointer-events-none absolute inset-0 opacity-40" />
      <div className="relative mx-auto max-w-7xl px-5 py-16 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-[1.4fr_1fr_1fr]">
          <div>
            <Link to="/" className="flex items-center gap-2.5">
              <img src="/favicon.png" alt="Codetern logo" className="h-9 w-9 rounded-xl object-contain" />
              <span className="font-display text-xl font-bold">
                Code<span className="text-cyan-deep dark:text-cyan-snap">tern</span>
              </span>
            </Link>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-ink/60 dark:text-paper/60">
              {site.tagline}
            </p>
            <div className="mt-6 flex gap-2.5">
              {SOCIALS.map(({ label, href, Icon }) => (
                <a key={label} href={href} target="_blank" rel="noopener noreferrer" aria-label={label}
                  className="grid h-11 w-11 place-items-center rounded-xl border border-ink/15 text-ink/70 transition hover:-translate-y-0.5 hover:border-neon-deep/50 hover:text-neon-deep dark:border-white/15 dark:text-paper/70 dark:hover:border-neon/50 dark:hover:text-neon">
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
                    <Link to={l.to} className="group inline-flex items-center gap-1 rounded text-sm text-ink/70 transition hover:text-neon-deep dark:text-paper/70 dark:hover:text-neon">
                      {l.label}
                      <ArrowUpRight size={12} className="opacity-0 transition group-hover:opacity-100" />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-14 flex flex-col items-center justify-between gap-4 border-t border-ink/10 pt-6 sm:flex-row dark:border-white/10">
          <p className="text-xs text-ink/60 dark:text-paper/60">© {new Date().getFullYear()} Codetern. Learn production code.</p>
          <p className="text-xs text-ink/60 dark:text-paper/60">
            No internships · 4 courses · <span className="text-neon-deep dark:text-neon">ship real work.</span>
          </p>
        </div>
      </div>
    </footer>
  )
}
