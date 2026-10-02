// Creative section separator: hairline gradient with a pulsing core.
export function Divider({ className = '' }) {
  return (
    <div aria-hidden className={`mx-auto flex max-w-6xl items-center gap-3 px-5 lg:px-8 ${className}`}>
      <span className="h-px flex-1 bg-gradient-to-r from-transparent via-ink/15 to-ink/15 dark:via-paper/20 dark:to-paper/20" />
      <span className="relative grid h-2.5 w-2.5 place-items-center">
        <span className="absolute h-full w-full rotate-45 rounded-[3px] bg-neon-deep/60 dark:bg-neon/60" />
        <span className="absolute h-full w-full rotate-45 animate-ping rounded-[3px] bg-neon-deep/30 dark:bg-neon/30" />
      </span>
      <span className="h-px flex-1 bg-gradient-to-l from-transparent via-ink/15 to-ink/15 dark:via-paper/20 dark:to-paper/20" />
    </div>
  )
}
