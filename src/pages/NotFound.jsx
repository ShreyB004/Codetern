import { Link } from 'react-router-dom'
import { ArrowRight, Compass, Home } from 'lucide-react'
import { Page } from '../components/layout/Page.jsx'

export default function NotFound() {
  return (
    <Page>
      <section className="mx-auto max-w-2xl px-5 py-28 text-center lg:px-8">
        <span className="mx-auto grid h-16 w-16 place-items-center rounded-[1.25rem] bg-ink/5 dark:bg-paper/10">
          <Compass size={28} className="opacity-60" />
        </span>
        <p className="mt-6 font-display text-7xl font-extrabold tracking-tight opacity-15">404</p>
        <h1 className="mt-2 font-display text-3xl font-extrabold tracking-tight">This page doesn’t exist.</h1>
        <p className="mx-auto mt-3 max-w-md text-[15px] opacity-60">
          The link may be old, or you typed something creative. Either way — the courses are all still here.
        </p>
        <div className="mt-7 flex flex-wrap justify-center gap-3">
          <Link to="/" className="flex items-center gap-1.5 rounded-full bg-ink px-6 py-3 text-sm font-bold text-white transition hover:-translate-y-0.5 dark:bg-paper dark:text-ink">
            <Home size={15} /> Back home
          </Link>
          <Link to="/courses" className="flex items-center gap-1.5 rounded-full border border-ink/15 px-6 py-3 text-sm font-bold transition hover:-translate-y-0.5 dark:border-paper/15">
            Browse courses <ArrowRight size={15} />
          </Link>
        </div>
      </section>
    </Page>
  )
}
