import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Flag } from 'lucide-react'
import { Page } from '../components/layout/Page.jsx'
import { StudentShell } from '../components/layout/AppShell.jsx'
import { MessageThread } from '../components/lms/MessageThread.jsx'
import { CustomSelect } from '../components/ui/CustomSelect.jsx'
import { Loader, Empty } from '../components/ui/StateBits.jsx'
import { useRtdbList } from '../hooks/useRtdbList.js'
import { useMyEnrollments } from '../hooks/useMyEnrollments.js'
import { useRead, setRead, maxTs } from '../lib/readState.js'
import { useAuth } from '../context/AuthContext.jsx'

export default function MessagesPage() {
  const { user } = useAuth()
  const { courseIds, loading } = useMyEnrollments()
  const [scope, setScope] = useState('mentor') // default: mentor
  const { rows: everyoneRows } = useRtdbList('messages/everyone')
  const { rows: mentorRows } = useRtdbList(user ? `mentorChats/${user.uid}` : 'mentorChats/_none')
  const readMentor = useRead('mentor')
  const readEveryone = useRead('everyone')

  const unreadEveryone = useMemo(() => {
    const fresh = everyoneRows.filter((m) => (m.ts || 0) > readEveryone && m.uid !== user?.uid)
    return { count: fresh.length, important: fresh.some((m) => m.important) }
  }, [everyoneRows, user, readEveryone])
  const unreadMentor = useMemo(() => {
    const fresh = mentorRows.filter((m) => (m.ts || 0) > readMentor && m.uid !== user?.uid)
    return { count: fresh.length, important: fresh.some((m) => m.important) }
  }, [mentorRows, user, readMentor])

  // viewing a thread marks everything in it read — badges clear instantly
  useEffect(() => {
    if (scope === 'mentor' && mentorRows.length) setRead('mentor', maxTs(mentorRows))
    if (scope === 'everyone' && everyoneRows.length) setRead('everyone', maxTs(everyoneRows))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scope, mentorRows.length, everyoneRows.length])

  const options = [
    { value: 'mentor', label: 'Mentor', sub: unreadMentor.count ? `${unreadMentor.count} unread` : 'Private thread' },
    { value: 'everyone', label: 'Everyone', sub: unreadEveryone.count ? `${unreadEveryone.count} unread` : 'Batch broadcast' },
  ]
  const importantPending = (scope === 'mentor' ? unreadMentor.important : unreadEveryone.important)

  return (
    <Page>
      <StudentShell>
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="font-display text-3xl font-extrabold tracking-tight">Messages</h1>
            <p className="mt-1 text-sm opacity-60">One inbox. Your mentor by default, the whole batch when you need it.</p>
          </div>
          <div className="flex items-center gap-2">
            {importantPending && (
              <span className="flex items-center gap-1 rounded-full bg-rose-600 px-2.5 py-1 text-[11px] font-extrabold text-white">
                <Flag size={11} /> Important
              </span>
            )}
            {((scope === 'mentor' ? unreadMentor.count : unreadEveryone.count) > 0) && (
              <span className="rounded-full bg-ink px-2.5 py-1 text-[11px] font-extrabold text-white dark:bg-paper dark:text-ink">
                {scope === 'mentor' ? unreadMentor.count : unreadEveryone.count} unread
              </span>
            )}
            <div className="w-52">
              <CustomSelect value={scope} onChange={setScope} options={options} compact />
            </div>
          </div>
        </div>

        {loading && <Loader text="Opening your inbox…" />}
        {!loading && courseIds.length === 0 && (
          <div className="mt-5"><Empty text="No approved courses yet — your inbox unlocks after admin approval." action={<Link to="/join" className="rounded-full bg-ink px-4 py-2 text-xs font-bold text-white dark:bg-paper dark:text-ink">Check join status</Link>} /></div>
        )}
        {!loading && courseIds.length > 0 && (
          <div className="mt-5">
            {scope === 'mentor' ? (
              <MessageThread
                path={`mentorChats/${user.uid}`} sendTo="mentor" sendUid={user.uid}
                onRead={(rows) => setRead('mentor', maxTs(rows))}
                title="Mentor" subtitle="Private — only you and the mentors"
              />
            ) : (
              <MessageThread
                path="messages/everyone" sendTo="everyone"
                onRead={(rows) => setRead('everyone', maxTs(rows))}
                title="Everyone" subtitle="The whole batch reads this" announce
              />
            )}
          </div>
        )}
      </StudentShell>
    </Page>
  )
}
