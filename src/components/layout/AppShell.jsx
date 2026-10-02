import { useMemo } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { LayoutDashboard, BookOpen, ListChecks, CalendarCheck, GitPullRequest, MessagesSquare, LogOut, ShieldCheck, Users, ClipboardCheck, Inbox, User } from 'lucide-react'
import { useAuth } from '../../context/AuthContext.jsx'
import { useRtdbList } from '../../hooks/useRtdbList.js'
import { useRead, maxTs } from '../../lib/readState.js'
import { sameEmail } from '../../lib/rtdb.js'
import { cn } from '../../lib/utils.js'

export const STUDENT_LINKS = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/learn', label: 'My courses', icon: BookOpen },
  { to: '/tasks', label: 'Tasks', icon: ListChecks },
  { to: '/attendance', label: 'Attendance', icon: CalendarCheck },
  { to: '/reviews', label: 'PR reviews', icon: GitPullRequest },
  { to: '/messages', label: 'Messages', icon: MessagesSquare },
  { to: '/profile', label: 'Profile', icon: User },
]

export const ADMIN_LINKS = [
  { to: '/admin', label: 'Overview', icon: ShieldCheck },
  { to: '/admin/approvals', label: 'Approvals', icon: ClipboardCheck },
  { to: '/admin/students', label: 'Students', icon: Users },
  { to: '/admin/tasks', label: 'Tasks', icon: ListChecks },
  { to: '/admin/attendance', label: 'Attendance', icon: CalendarCheck },
  { to: '/admin/reviews', label: 'PR queue', icon: GitPullRequest },
  { to: '/admin/messages', label: 'Messages', icon: MessagesSquare },
  { to: '/admin/inbox', label: 'Inbox', icon: Inbox },
]

// Realtime badges for every inbox-like surface.
// Student: tasks (open in my courses), PR reviews (mine pending), messages (unread).
// Admin: approvals (requested), PR queue (pending), inbox (new), messages (fresh in 24h).
function useNavBadges() {
  const { user, isAdmin } = useAuth()
  const { rows: everyone } = useRtdbList('messages/everyone')
  const { rows: mentor } = useRtdbList(user && !isAdmin ? `mentorChats/${user.uid}` : 'mentorChats/_none')
  const { rows: mentorAll } = useRtdbList(isAdmin ? 'mentorChats' : 'mentorChats/_none')
  const { rows: enrollments } = useRtdbList('enrollments')
  const { rows: tasks } = useRtdbList('tasks')
  const { rows: reviews } = useRtdbList('reviews')
  const { rows: joins } = useRtdbList('joinRequests')
  const { rows: leads } = useRtdbList('leads')
  const { rows: contacts } = useRtdbList('contacts')
  const readEveryone = useRead('everyone')
  const readMentor = useRead('mentor')
  const readAdminFeed = useRead('admin-feed')

  return useMemo(() => {
    if (!user) return { counts: {}, important: false }
    if (isAdmin) {
      // unread = anything newer than the last time admin opened Messages
      let fresh = everyone.filter((m) => (m.ts || 0) > readAdminFeed && m.uid !== user.uid).length
      let important = everyone.some((m) => (m.ts || 0) > readAdminFeed && m.uid !== user.uid && m.important)
      mentorAll.forEach((n) => {
        Object.entries(n).forEach(([k, v]) => {
          if (k !== 'id' && v && typeof v === 'object' && (v.ts || 0) > readAdminFeed && v.uid !== user.uid) {
            fresh += 1
            if (v.important) important = true
          }
        })
      })
      return {
        counts: {
          '/admin/approvals': joins.filter((j) => j.status === 'requested').length,
          '/admin/reviews': reviews.filter((r) => r.status === 'pending').length,
          '/admin/inbox': [...leads, ...contacts].filter((r) => (r.status || 'new') === 'new').length,
          '/admin/messages': fresh,
        },
        important,
      }
    }
    const myCourses = enrollments
      .filter((e) => e.status === 'active' && (e.uid === user.uid || sameEmail(e.email, user.email)))
      .map((e) => e.courseId)
    const fresh = [
      ...everyone.filter((m) => (m.ts || 0) > readEveryone && m.uid !== user.uid),
      ...mentor.filter((m) => (m.ts || 0) > readMentor && m.uid !== user.uid),
    ]
    return {
      counts: {
        '/tasks': tasks.filter((t) => myCourses.includes(t.courseId)).length,
        '/reviews': reviews.filter((r) => r.uid === user.uid && r.status === 'pending').length,
        '/messages': fresh.length,
      },
      important: fresh.some((m) => m.important),
    }
  }, [user, isAdmin, everyone, mentor, mentorAll, enrollments, tasks, reviews, joins, leads, contacts, readEveryone, readMentor, readAdminFeed])
}

function Shell({ title, sub, links, dark, children }) {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()
  const { counts, important } = useNavBadges()
  return (
    <div className="mx-auto flex min-h-[78vh] max-w-7xl gap-4 px-4 pb-20 pt-24 sm:px-5 lg:px-8">
      <aside className={cn(
        'sticky top-24 hidden h-fit w-60 shrink-0 flex-col gap-1 self-start rounded-3xl p-4 md:flex',
        dark
          ? 'bg-ink text-paper dark:bg-ink-soft dark:shadow-none'
          : 'border border-ink/10 bg-white text-ink shadow-card dark:border-paper/10 dark:bg-ink-soft dark:text-paper dark:shadow-none',
      )}>
        <p className="px-2 text-[11px] font-bold uppercase tracking-[0.18em] opacity-50">{title}</p>
        <p className="px-2 text-xs opacity-50">{sub}</p>
        <nav className="mt-3 grid gap-1">
          {links.map((l) => (
            <NavLink key={l.to} to={l.to} end={l.to === '/admin' || l.to === '/dashboard' || l.to === '/learn'}
              className={({ isActive }) => cn(
                'flex items-center gap-2.5 rounded-2xl px-3 py-2.5 text-sm font-bold transition hover:-translate-x-0.5',
                isActive
                  ? dark
                    ? 'bg-neon text-ink'
                    : 'bg-ink text-white dark:bg-paper dark:text-ink'
                  : 'opacity-65 hover:bg-black/5 hover:opacity-100 dark:hover:bg-white/5',
              )}>
              <l.icon size={15} /> <span className="flex-1">{l.label}</span>
              {(counts[l.to] || 0) > 0 && (
                <span className={cn('rounded-full px-1.5 py-0.5 text-[10px] font-extrabold',
                  important && (l.to === '/messages' || l.to === '/admin/messages')
                    ? 'bg-rose-600 text-white'
                    : dark ? 'bg-paper text-ink' : 'bg-ink text-white')}>
                  {counts[l.to] > 99 ? '99+' : counts[l.to]}
                </span>
              )}
            </NavLink>
          ))}
        </nav>
        <div className="mt-6 flex items-center gap-2.5 rounded-2xl bg-black/5 p-3 dark:bg-white/5">
          <span className="grid h-9 w-9 shrink-0 place-items-center overflow-hidden rounded-full bg-ink font-bold text-white dark:bg-paper dark:text-ink">
            {user?.photoURL
              ? <img src={user.photoURL} alt="" className="h-full w-full object-cover" />
              : (user?.displayName || user?.email || 'S').slice(0, 1).toUpperCase()}
          </span>
          <span className="min-w-0 flex-1">
            <span className="block truncate text-xs font-bold">{user?.displayName || 'Student'}</span>
            <button onClick={() => signOut().then(() => navigate('/'))} className="flex items-center gap-1 text-[11px] font-bold opacity-60 underline hover:opacity-100"><LogOut size={11} /> Sign out</button>
          </span>
        </div>
      </aside>
      <main className="min-w-0 flex-1">{children}</main>
    </div>
  )
}

export function StudentShell({ children }) {
  return <Shell title="My learning" sub="LMS" links={STUDENT_LINKS}>{children}</Shell>
}

export function AdminShell({ children }) {
  return <Shell dark title="Admin" sub="Full control" links={ADMIN_LINKS}>{children}</Shell>
}
