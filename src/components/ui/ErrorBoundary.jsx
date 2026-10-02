import { Component } from 'react'
import { AlertTriangle, Home, RotateCcw } from 'lucide-react'

// Catches render crashes anywhere below it so one bad widget
// never blanks the whole app. Reset on navigation via `resetKey`.
export class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { error: null }
  }

  static getDerivedStateFromError(error) {
    return { error }
  }

  componentDidCatch(error, info) {
    if (import.meta.env.DEV) {
      console.error('[ErrorBoundary]', error, info?.componentStack)
    }
    import('../../lib/sentry.js').then(({ reportError }) =>
      reportError(error, { componentStack: info?.componentStack?.slice(0, 2000) }),
    ).catch(() => {})
  }

  componentDidUpdate(prevProps) {
    if (prevProps.resetKey !== this.props.resetKey && this.state.error) {
      this.setState({ error: null })
    }
  }

  render() {
    if (this.state.error) {
      return (
        <div className="grid min-h-[60vh] place-items-center px-5 py-20">
          <div className="w-full max-w-md rounded-[2rem] border border-ink/10 bg-white p-8 text-center shadow-card dark:border-paper/10 dark:bg-ink-soft dark:shadow-none">
            <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-amber-500/15 text-amber-700 dark:text-amber-300">
              <AlertTriangle size={24} />
            </span>
            <h1 className="mt-4 font-display text-2xl font-extrabold">Something broke on this page</h1>
            <p className="mt-2 text-sm opacity-60">
              Nothing was lost — your data is safe. Try reloading, or head back home.
            </p>
            {import.meta.env.DEV && (
              <pre className="mt-4 max-h-32 overflow-auto rounded-xl bg-ink p-3 text-left font-mono text-[11px] text-rose-300 dark:bg-black">
                {String(this.state.error?.message || this.state.error)}
              </pre>
            )}
            <div className="mt-6 flex justify-center gap-2">
              <button
                onClick={() => window.location.reload()}
                className="flex items-center gap-1.5 rounded-full bg-ink px-5 py-2.5 text-sm font-bold text-white transition hover:-translate-y-0.5 dark:bg-paper dark:text-ink"
              >
                <RotateCcw size={14} /> Reload page
              </button>
              <a
                href="/"
                className="flex items-center gap-1.5 rounded-full border border-ink/15 px-5 py-2.5 text-sm font-bold transition hover:-translate-y-0.5 dark:border-paper/15"
              >
                <Home size={14} /> Home
              </a>
            </div>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}
