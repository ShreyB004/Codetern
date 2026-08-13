import { cn } from '../../lib/utils.js'

export function Skeleton({ className }) {
  return <div className={cn('animate-pulse rounded-xl bg-ink/8 dark:bg-paper/8', className)} />
}

export function SkeletonPage({ rows = 6 }) {
  return (
    <div className="mx-auto w-full max-w-6xl px-6 py-16">
      <Skeleton className="mx-auto mb-10 h-10 w-72" />
      <Skeleton className="mx-auto mb-4 h-6 w-96 max-w-full" />
      <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="rounded-panel border border-ink/8 bg-white p-6 shadow-card dark:border-paper/10 dark:bg-ink-soft">
            <Skeleton className="mb-4 h-8 w-8 rounded-lg" />
            <Skeleton className="mb-3 h-5 w-3/4" />
            <Skeleton className="h-3 w-full" />
            <Skeleton className="mt-2 h-3 w-5/6" />
          </div>
        ))}
      </div>
    </div>
  )
}
