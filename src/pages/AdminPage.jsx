import { useState } from 'react'
import { Image, LayoutDashboard, ListChecks, LogOut, SlidersHorizontal, Users, Wrench } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AppContext.jsx'
import { SkeletonPage } from '../components/ui/Skeleton.jsx'
import { ThemeToggle } from '../components/ui/ThemeToggle.jsx'
import { MediaManager } from '../components/admin/MediaManager.jsx'
import { CandidateRoster } from '../components/admin/CandidateRoster.jsx'
import { DomainManager } from '../components/admin/DomainManager.jsx'
import { SeatController } from '../components/admin/SeatController.jsx'
import { QuestionManager } from '../components/admin/QuestionManager.jsx'
import { WorkspaceManager } from '../components/admin/WorkspaceManager.jsx'
import { cn } from '../lib/utils.js'

const MODULES = [
  { key: 'media', label: 'Media & Assets', desc: 'Drag-drop promotional images & layout slots', icon: Image },
  { key: 'roster', label: 'Candidate Roster', desc: 'Filter, inspect & manage applicants', icon: Users },
  { key: 'domains', label: 'Domain Management', desc: 'Add, edit & delete career tracks', icon: Wrench },
  { key: 'seats', label: 'Seat Controller', desc: 'Scale limits & remaining seats globally', icon: SlidersHorizontal },
  { key: 'questions', label: 'Question Banks', desc: 'Enable, edit & write final-assessment questions', icon: ListChecks },
  { key: 'workspaces', label: 'Workspace Defaults', desc: 'Seed task lists & resources for each domain', icon: LayoutDashboard },
]

export default function AdminPage() {
  const { isAuthenticated, isAdmin, logout } = useAuth()
  const navigate = useNavigate()
  const [module, setModule] = useState('roster')

  if (!isAuthenticated || !isAdmin) return <SkeletonPage />

  return (
    <div className="min-h-screen bg-paper dark:bg-ink">
      <div className="flex min-h-screen">
        {/* sidebar */}
        <aside className="sticky top-0 flex h-screen w-full max-w-[260px] flex-col border-r border-ink/8 bg-ink text-white dark:border-white/10">
          <div className="flex items-center gap-2.5 px-6 py-6">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-white/10 text-cyan-snap">
              <LayoutDashboard size={18} />
            </span>
            <div>
              <p className="font-display text-base font-bold leading-none">Codetern</p>
              <p className="mt-0.5 text-[10px] font-bold uppercase tracking-[0.2em] text-neon">Admin suite</p>
            </div>
          </div>

          <nav className="flex flex-1 flex-col gap-1.5 overflow-y-auto px-4">
            {MODULES.map((m) => {
              const Icon = m.icon
              return (
                <button
                  key={m.key}
                  onClick={() => setModule(m.key)}
                  className={cn(
                    'flex items-start gap-3 rounded-2xl px-4 py-3 text-left transition-all',
                    module === m.key ? 'bg-white/10 text-white' : 'text-white/55 hover:bg-white/5 hover:text-white',
                  )}
                >
                  <Icon size={18} className="mt-0.5 shrink-0" strokeWidth={2} />
                  <span>
                    <span className="block text-sm font-semibold">{m.label}</span>
                    <span className="mt-0.5 block text-[11px] leading-tight text-white/40">{m.desc}</span>
                  </span>
                </button>
              )
            })}
          </nav>

          <div className="flex flex-col gap-2 border-t border-white/10 p-4">
            <div className="flex items-center justify-between px-2 py-1">
              <span className="text-[11px] font-bold uppercase tracking-widest text-white/40">Appearance</span>
              <ThemeToggle />
            </div>
            <button
              onClick={() => navigate('/')}
              className="rounded-xl px-4 py-2.5 text-left text-sm text-white/60 transition hover:bg-white/5 hover:text-white"
            >
              ← View public site
            </button>
            <button
              onClick={logout}
              className="flex items-center gap-2 rounded-xl px-4 py-2.5 text-left text-sm text-coral transition hover:bg-coral/10"
            >
              <LogOut size={15} /> Sign out
            </button>
          </div>
        </aside>

        {/* content */}
        <main className="flex-1 overflow-hidden">
          <div className="border-b border-ink/8 bg-white px-8 py-5 dark:border-white/10 dark:bg-ink-soft">
            <h1 className="font-display text-2xl font-bold text-ink dark:text-paper">{MODULES.find((m) => m.key === module)?.label}</h1>
            <p className="text-sm text-ink/50 dark:text-paper/50">{MODULES.find((m) => m.key === module)?.desc}</p>
          </div>
          <div className="px-8 py-8" key={module}>
            {module === 'media' && <MediaManager />}
            {module === 'roster' && <CandidateRoster />}
            {module === 'domains' && <DomainManager />}
            {module === 'seats' && <SeatController />}
            {module === 'questions' && <QuestionManager />}
            {module === 'workspaces' && <WorkspaceManager />}
          </div>
        </main>
      </div>
    </div>
  )
}