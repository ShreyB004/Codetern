import { useEffect, useRef } from 'react'
import { Bold, Italic, Heading1, Heading2, Heading3, Pilcrow, List, Link2, Eraser } from 'lucide-react'
import { cn } from '../../lib/utils.js'

const TOOLS = [
  { cmd: 'bold', Icon: Bold, label: 'Bold' },
  { cmd: 'italic', Icon: Italic, label: 'Italic' },
  { cmd: 'formatBlock', arg: 'h1', Icon: Heading1, label: 'Heading 1' },
  { cmd: 'formatBlock', arg: 'h2', Icon: Heading2, label: 'Heading 2' },
  { cmd: 'formatBlock', arg: 'h3', Icon: Heading3, label: 'Heading 3' },
  { cmd: 'formatBlock', arg: 'p', Icon: Pilcrow, label: 'Paragraph' },
  { cmd: 'insertUnorderedList', Icon: List, label: 'Bullets' },
]

// Minimal rich-text editor (bold, italic, headings, paragraphs, bullets).
// Stores HTML — rendered back with RichHTML below.
export function RichEditor({ value, onChange, placeholder = 'Describe the task: goal, steps, acceptance criteria…' }) {
  const ref = useRef(null)

  useEffect(() => {
    if (ref.current && ref.current.innerHTML !== (value || '')) {
      ref.current.innerHTML = value || ''
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const exec = (cmd, arg = null) => {
    ref.current?.focus()
    try {
      document.execCommand(cmd, false, arg)
    } catch { /* noop */ }
    onChange(ref.current?.innerHTML || '')
  }

  const addLink = () => {
    const url = window.prompt('Link URL (https://…)')
    if (!url || !/^https?:\/\/.+\..+/.test(url.trim())) return
    ref.current?.focus()
    try {
      document.execCommand('createLink', false, url.trim())
    } catch { /* noop */ }
    onChange(ref.current?.innerHTML || '')
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-ink/12 bg-white focus-within:border-ink/40 dark:border-paper/15 dark:bg-ink dark:focus-within:border-paper/40">
      <div className="flex flex-wrap gap-1 border-b border-ink/8 p-1.5 dark:border-paper/10">
        {TOOLS.map(({ cmd, arg, Icon, label }) => (
          <button
            key={label} type="button" title={label} aria-label={label}
            onMouseDown={(e) => { e.preventDefault(); exec(cmd, arg) }}
            className="grid h-8 w-8 place-items-center rounded-lg transition hover:bg-ink/8 dark:hover:bg-paper/10"
          >
            <Icon size={15} />
          </button>
        ))}
        <button
          type="button" title="Add link" aria-label="Add link"
          onMouseDown={(e) => { e.preventDefault(); addLink() }}
          className="grid h-8 w-8 place-items-center rounded-lg transition hover:bg-ink/8 dark:hover:bg-paper/10"
        >
          <Link2 size={15} />
        </button>
        <button
          type="button" title="Clear formatting" aria-label="Clear formatting"
          onMouseDown={(e) => { e.preventDefault(); exec('removeFormat') }}
          className="grid h-8 w-8 place-items-center rounded-lg transition hover:bg-ink/8 dark:hover:bg-paper/10"
        >
          <Eraser size={15} />
        </button>
      </div>
      <div
        ref={ref}
        contentEditable
        role="textbox"
        aria-multiline
        data-placeholder={placeholder}
        onInput={() => onChange(ref.current?.innerHTML || '')}
        className="cdt-rich min-h-28 px-4 py-3 text-sm outline-none empty:before:text-ink/35 empty:before:content-[attr(data-placeholder)] dark:empty:before:text-paper/35"
      />
    </div>
  )
}

export function RichHTML({ html, className }) {
  if (!html || !html.replace(/<[^>]*>/g, '').trim()) {
    return <p className={cn('text-sm opacity-50', className)}>No description added.</p>
  }
  return <div dangerouslySetInnerHTML={{ __html: html }} className={cn('cdt-rich text-sm leading-relaxed', className)} />
}
