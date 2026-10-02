import { useEffect, useState } from 'react'
import { subscribeDoc } from '../lib/rtdb.js'
import { SITE_DEFAULTS, mergeSite } from '../data/site.js'

// Live site copy with instant fallback defaults (fast first paint,
// realtime admin edits after).
export function useSite(section) {
  const [doc, setDoc] = useState(null)
  useEffect(() => subscribeDoc(`siteContent/${section}`, setDoc), [section])
  return mergeSite(section, doc)
}

export { SITE_DEFAULTS }
