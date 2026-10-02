import { useEffect, useMemo, useState } from 'react'
import { useRtdbList } from './useRtdbList.js'
import { claimEnrollments, sameEmail } from '../lib/rtdb.js'
import { useAuth } from '../context/AuthContext.jsx'

// Enrollments belonging to the logged-in student.
// Matches by uid OR email (join form is filled before login, so approved
// rows often carry only an email). Auto-claims email-matched rows by
// writing the uid back — this is the LMS "unlock".
export function useMyEnrollments() {
  const { user } = useAuth()
  const { rows, loading } = useRtdbList('enrollments')
  const [claimed, setClaimed] = useState(false)

  useEffect(() => {
    if (loading || !user || claimed) return
    claimEnrollments(user.uid, user.email, rows)
      .then(() => setClaimed(true))
      .catch(() => setClaimed(true))
  }, [loading, user, rows, claimed])

  const mine = useMemo(() => {
    if (!user) return []
    return rows.filter(
      (e) => e.status === 'active' && (e.uid === user.uid || sameEmail(e.email, user.email)),
    )
  }, [rows, user])

  const courseIds = useMemo(() => [...new Set(mine.map((m) => m.courseId))], [mine])

  return { enrollments: mine, courseIds, loading, all: rows }
}
