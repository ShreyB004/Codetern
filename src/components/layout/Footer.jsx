import { Link } from 'react-router-dom'
import { Github, Instagram, Linkedin, Twitter, Zap } from 'lucide-react'

const COLUMNS = [
  {
    title: 'Programmes',
    links: [
      { label: 'Full-Stack (MERN)', to: '/domains' },
      { label: 'AI & LLM Development', to: '/domains' },
      { label: 'Cybersecurity', to: '/domains' },
      { label: 'UI/UX Design', to: '/domains' },
      { label: 'View all domains', to: '/domains' },
    ],
  },
  {
    title: 'Platform',
    links: [
      { label: 'About Codetern', to: '/about' },
      { label: 'Live projects', to: '/portfolio' },
      { label: 'Certificate verification', to: '/certification' },
      { label: 'Student dashboard', to: '/dashboard' },
      { label: 'Contact', to: '/contact' },
    ],
  },
]

export function Footer() {
  return (
    <footer className="relative overflow-hidden bg-ink text-paper">
      <div className="dot-grid pointer-events-none absolute inset-0 opacity-40" style={{ backgroundImage: 'radial-gradient(rgb(255 255 255 / 0.06) 1px, transparent 1px)' }} />
      <div className="relative mx-auto max-w-7xl px-5 py-16 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-[1.4fr_1fr_1fr]">
          <div>
            <Link to="/" className="flex items-center gap-2.5">
              <span className="grid h-9 w-9 place-items-center rounded-xl bg-white/10 text-cyan-snap">
                <Zap size={18} strokeWidth={2.4} />
              </span>
              <span className="font-display text-xl font-bold">
                Code<span className="text-cyan-snap">tern</span>
              </span>
            </Link>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-white/55">
              An elite internship simulator. Get real work done before your first job — through quizzes, AI mock
              interviews and studio-grade projects across 14 domains.
            </p>
            <div className="mt-6 flex gap-2.5">
              {[Twitter, Instagram, Linkedin, Github].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  onClick={(e) => e.preventDefault()}
                  className="grid h-9 w-9 place-items-center rounded-xl border border-white/15 text-white/60 transition hover:border-neon/50 hover:text-neon"
                  aria-label="Social link"
                >
                  <Icon size={16} />
                </a>
              ))}
            </div>
          </div>

          {COLUMNS.map((col) => (
            <div key={col.title}>
              <h4 className="text-xs font-bold uppercase tracking-[0.18em] text-white/40">{col.title}</h4>
              <ul className="mt-4 flex flex-col gap-2.5">
                {col.links.map((l) => (
                  <li key={l.label}>
                    <Link to={l.to} className="text-sm text-white/70 transition hover:text-neon">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-14 flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-6 sm:flex-row">
          <p className="text-xs text-white/40">© {new Date().getFullYear()} Codetern. Crafted for career acceleration.</p>
          <p className="text-xs text-white/40">
            Built with React · GSAP · Tailwind <span className="text-neon">— get real work done.</span>
          </p>
        </div>
      </div>
    </footer>
  )
}