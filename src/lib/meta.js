import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

const SITE_NAME = 'Codetern'

// Marketing routes are indexable; app/LMS routes stay out of search results.
const ROUTES = [
  { match: /^\/$/, title: 'Codetern — Learn Production Code, Ship It, Get Reviewed', desc: 'Weekend engineering school: rebuild real systems from scratch, pass GitHub PR reviews, ship to production, train inside a team simulation.' },
  { match: /^\/courses/, title: 'Courses — Codetern', desc: 'Four production tracks: AI & LLMs, Web Development, Databases, API Architecture. From-scratch builds, PR reviews, live deploys.' },
  { match: /^\/pricing/, title: 'Pricing — Codetern', desc: 'One payment, no subscription. Starter, Builder and Pro 1:1 plans for production-code courses.' },
  { match: /^\/about/, title: 'About — Codetern', desc: 'Why Codetern exists: classroom code gets views, production code gets hired. Our method, lines we won’t cross, and who thrives here.' },
  { match: /^\/contact/, title: 'Contact — Codetern', desc: 'Talk to a mentor about courses, joining, teams and reviews. Replies within a day.' },
  { match: /^\/join/, title: 'Join Codetern', desc: 'Apply in 2 minutes: tell us about you, finish the Google Form, get approved and unlock your LMS.' },
  { match: /^\/privacy/, title: 'Privacy Policy — Codetern', desc: 'How Codetern collects, uses and protects student data, and your rights under India’s DPDP Act.' },
  { match: /^\/terms/, title: 'Terms of Service — Codetern', desc: 'Course terms: payments and refunds, responsibilities, certificates, accounts and liability.' },
]

function ensureTag(selector, create) {
  let el = document.head.querySelector(selector)
  if (!el) {
    el = create()
    document.head.appendChild(el)
  }
  return el
}

export function useRouteMeta() {
  const { pathname } = useLocation()
  useEffect(() => {
    const route = ROUTES.find((r) => r.match.test(pathname))
    const title = route ? route.title : `${SITE_NAME} — My Learning`
    const desc = route
      ? route.desc
      : 'Your Codetern LMS: courses, tasks, attendance, PR reviews and messages.'
    document.title = title
    ensureTag('meta[name="description"]', () => {
      const m = document.createElement('meta')
      m.setAttribute('name', 'description')
      return m
    }).setAttribute('content', desc)
    ensureTag('meta[name="robots"]', () => {
      const m = document.createElement('meta')
      m.setAttribute('name', 'robots')
      return m
    }).setAttribute('content', route ? 'index, follow' : 'noindex, nofollow')
    try {
      ensureTag('link[rel="canonical"]', () => {
        const l = document.createElement('link')
        l.setAttribute('rel', 'canonical')
        return l
      }).setAttribute('href', window.location.origin + pathname)
    } catch { /* noop */ }
  }, [pathname])
}
