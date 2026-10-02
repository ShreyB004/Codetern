import { useEffect, useMemo, useRef, useState } from 'react'
import { Send, Loader2, Pencil, Trash2, Check, X, Megaphone, Flag, Video, ExternalLink } from 'lucide-react'
import { Loader } from '../ui/StateBits.jsx'
import { Avatar, RoleBadge } from '../ui/Avatar.jsx'
import { useRtdbList } from '../../hooks/useRtdbList.js'
import { sendMessage, sendMentorMessage, deleteThreadMessage, updateThreadMessage } from '../../lib/rtdb.js'
import { useAuth } from '../../context/AuthContext.jsx'
import { useToast } from '../../context/ToastContext.jsx'
import { cn } from '../../lib/utils.js'

export function timeAgo(ts) {
  if (!ts) return ''
  const s = Math.max(1, Math.floor((Date.now() - ts) / 1000))
  if (s < 60) return `${s}s`
  const m = Math.floor(s / 60)
  if (m < 60) return `${m}m`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h`
  const d = Math.floor(h / 24)
  if (d < 7) return `${d}d`
  return new Date(ts).toLocaleDateString()
}

const URL_RE = /(https?:\/\/[^\s)]+)/g
const isMeet = (u) => /meet\.google\.com|zoom\.us|teams\.microsoft\.com/i.test(u || '')

function RichText({ text, onDark = false }) {
  const parts = String(text || '').split(URL_RE)
  const links = parts.filter((p, i) => i % 2 === 1)
  const linkCls = onDark
    ? 'break-all text-cyan-300 underline hover:opacity-80'
    : 'break-all text-sky-700 underline hover:opacity-80 dark:text-sky-400'
  return (
    <div>
      <p className="whitespace-pre-wrap break-words text-sm leading-relaxed">
        {parts.map((p, i) =>
          i % 2 === 1
            ? isMeet(p)
              ? <span key={i} className="opacity-60">[meeting link below]</span>
              : <a key={i} href={p} target="_blank" rel="noreferrer" className={linkCls}>{p.length > 48 ? `${p.slice(0, 48)}…` : p}</a>
            : <span key={i}>{p}</span>,
        )}
      </p>
      {links.filter(isMeet).map((u) => (
        <a key={u} href={u} target="_blank" rel="noreferrer"
          className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-emerald-600 px-4 py-2 text-xs font-extrabold text-white shadow-card transition hover:-translate-y-0.5 hover:shadow-float">
          <Video size={14} /> Join the meeting <ExternalLink size={11} className="opacity-70" />
        </a>
      ))}
      {links.filter((u) => !isMeet(u)).length > 1 && (
        <span className="mt-1 block text-[11px] opacity-40">{links.filter((u) => !isMeet(u)).length} links in this message</span>
      )}
    </div>
  )
}

function dayLabel(ts) {
  if (!ts) return ''
  const d = new Date(ts)
  const today = new Date()
  const yest = new Date(Date.now() - 86400000)
  const sameDay = (a, b) => a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate()
  if (sameDay(d, today)) return 'Today'
  if (sameDay(d, yest)) return 'Yesterday'
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
}

function MessageRow({ m, profile, own, canEdit, onSave, onDelete, saving, deleting }) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(m.text)
  const [leaving, setLeaving] = useState(false)

  const save = () => {
    if (!draft.trim() || draft === m.text) return setEditing(false)
    onSave(m.id, draft, () => setEditing(false))
  }

  const remove = () => {
    if (leaving) return
    setLeaving(true)
    setTimeout(() => onDelete(m.id), 220)
  }

  return (
    <div className={cn('group flex w-full msg-in', own ? 'justify-end' : 'justify-start', leaving && 'msg-leave')}>
      <div className={cn(
        'relative max-w-[88%] px-3 pb-1 pt-1.5 shadow-card sm:max-w-[76%]',
        own
          ? 'rounded-xl rounded-br-sm bg-ink text-white dark:bg-paper dark:text-ink'
          : 'rounded-xl rounded-bl-sm border border-ink/8 bg-white dark:border-paper/10 dark:bg-ink-soft',
        m.important && !own && 'border-rose-500/40 ring-1 ring-rose-500/30 dark:border-rose-400/40',
        m.important && own && 'ring-2 ring-rose-500/60',
      )}>
        <p className="flex flex-wrap items-center gap-x-1.5 gap-y-0.5 text-[11px]">
          <b className={own ? 'opacity-80' : 'text-cyan-deep dark:text-cyan-snap'}>{own ? 'You' : m.name}</b>
          <RoleBadge role={profile?.role} />
          {m.important && <span className="flex items-center gap-0.5 rounded-full bg-rose-600 px-1.5 py-px text-[9px] font-extrabold uppercase tracking-wider text-white"><Flag size={8} /> Important</span>}
        </p>
        {editing ? (
          <div className="mt-1.5 grid gap-1.5">
            <textarea value={draft} onChange={(e) => setDraft(e.target.value)} rows={2} autoFocus
              className={cn('w-full rounded-xl border px-3 py-2 text-sm outline-none',
                own ? 'border-white/20 bg-white/10 placeholder:text-white/40' : 'border-ink/15 bg-paper dark:border-paper/15 dark:bg-ink')} />
            <div className="flex gap-1.5">
              <button onClick={save} disabled={saving} className={cn('flex items-center gap-1 rounded-full px-3 py-1.5 text-[11px] font-bold disabled:opacity-50',
                own ? 'bg-white text-ink dark:bg-ink dark:text-white' : 'bg-ink text-white dark:bg-paper dark:text-ink')}>
                {saving ? <Loader2 size={11} className="animate-spin" /> : <Check size={11} />} Save
              </button>
              <button onClick={() => { setEditing(false); setDraft(m.text) }} className="flex items-center gap-1 rounded-full border border-current px-3 py-1.5 text-[11px] font-bold opacity-70">
                <X size={11} /> Cancel
              </button>
            </div>
          </div>
        ) : (
          <div className="mt-0.5"><RichText text={m.text} onDark={own} /></div>
        )}
        <span className={cn('mt-1 block text-right text-[10px]', own ? 'opacity-50' : 'opacity-40')}>
          {m.edited ? 'edited · ' : ''}{new Date(m.ts || Date.now()).toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit' })}
        </span>
        {canEdit && !editing && (
          <span className={cn('absolute top-1.5 flex gap-1 opacity-0 transition group-hover:opacity-100 focus-within:opacity-100', own ? '-left-[4.25rem]' : '-right-[4.25rem]')}>
            <button onClick={() => { setDraft(m.text); setEditing(true) }} title="Edit message" aria-label="Edit message" className="rounded-full bg-ink/70 p-1.5 text-white shadow-card backdrop-blur hover:scale-110 dark:bg-paper/85 dark:text-ink">
              <Pencil size={12} />
            </button>
            <button onClick={remove} disabled={deleting} title="Delete message" aria-label="Delete message" className="rounded-full bg-ink/70 p-1.5 text-white shadow-card backdrop-blur transition hover:scale-110 hover:!bg-rose-600 dark:bg-paper/85 dark:text-ink">
              {deleting ? <Loader2 size={12} className="animate-spin" /> : <Trash2 size={12} />}
            </button>
          </span>
        )}
      </div>
    </div>
  )
}

// Oldest on top, newest at the bottom (WhatsApp order) + stick to bottom.
function ThreadList({ rows, loading, user, isAdmin, profileFor, save, del, savingId, deletingId }) {
  const box = useRef(null)
  const [stuck, setStuck] = useState(true)

  const ordered = useMemo(
    () => [...rows].sort((a, b) => (a.ts || 0) - (b.ts || 0)),
    [rows],
  )

  useEffect(() => {
    const el = box.current
    if (el && stuck) el.scrollTop = el.scrollHeight
  }, [ordered.length, loading, stuck])

  const onScroll = () => {
    const el = box.current
    if (!el) return
    setStuck(el.scrollHeight - el.scrollTop - el.clientHeight < 90)
  }

  const jump = () => {
    const el = box.current
    if (el) {
      el.scrollTop = el.scrollHeight
      setStuck(true)
    }
  }

  let lastDay = ''
  return (
    <div className="relative min-h-0 flex-1">
      <div ref={box} onScroll={onScroll} className="cdt-scroll-slim max-h-96 min-h-40 space-y-2 overflow-y-auto bg-paper/40 p-3 sm:p-4 dark:bg-ink/40">
        {loading && <Loader text="Loading conversation…" />}
        {!loading && ordered.length === 0 && (
          <p className="rounded-2xl bg-paper px-4 py-6 text-center text-xs opacity-60 dark:bg-ink">
            Nothing here yet — start the conversation below.
          </p>
        )}
        {ordered.map((m) => {
          const own = m.uid && user && m.uid === user.uid
          const day = dayLabel(m.ts)
          const showDay = day && day !== lastDay
          lastDay = day
          return (
            <div key={m.id}>
              {showDay && (
                <p className="sticky top-0 z-10 mx-auto mb-2 w-fit rounded-full border border-ink/8 bg-white px-3 py-1 text-[10px] font-bold uppercase tracking-wider opacity-70 shadow-card dark:border-paper/10 dark:bg-ink-soft">
                  {day}
                </p>
              )}
              <MessageRow
                m={m} profile={profileFor(m)} own={!!own}
                canEdit={isAdmin || !!own}
                onSave={save} onDelete={del}
                saving={savingId === m.id} deleting={deletingId === m.id}
              />
            </div>
          )
        })}
      </div>
      {!stuck && ordered.length > 0 && (
        <button onClick={jump}
          className="absolute bottom-3 left-1/2 grid h-9 w-9 -translate-x-1/2 place-items-center rounded-full bg-ink text-white shadow-float transition hover:scale-110 dark:bg-paper dark:text-ink"
          aria-label="Jump to newest">
          ↓
        </button>
      )}
    </div>
  )
}

// Generic live thread. `path` is the full RTDB path (e.g. "messages/everyone"
// or "mentorChats/<uid>"). `sendTo` tells the send box where to write.
export function MessageThread({ path, sendTo, sendUid, title, subtitle, announce = false, allowImportant = false, onRead }) {
  const { user, isAdmin } = useAuth()
  const { push } = useToast()
  const { rows, loading } = useRtdbList(path)
  const { rows: users } = useRtdbList('users')
  const [text, setText] = useState('')
  const [important, setImportant] = useState(false)
  const [sending, setSending] = useState(false)
  const [savingId, setSavingId] = useState(null)
  const [deletingId, setDeletingId] = useState(null)

  const profiles = useMemo(() => {
    const map = {}
    users.forEach((u) => {
      if (u.uid) map[`uid:${u.uid}`] = u
      if (u.email) map[`email:${String(u.email).toLowerCase()}`] = u
    })
    return map
  }, [users])

  const profileFor = (m) =>
    (m.uid && profiles[`uid:${m.uid}`]) ||
    (m.name && profiles[`email:${String(m.name).toLowerCase()}`]) ||
    null

  // mark read whenever the list grows
  useMemo(() => {
    if (!loading && rows.length && onRead) onRead(rows)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, rows.length])

  const send = async (e) => {
    e.preventDefault()
    if (!text.trim()) return
    setSending(true)
    try {
      const payload = { name: user.displayName || user.email?.split('@')[0] || (isAdmin ? 'Mentor' : 'Student'), text, uid: user.uid, important: allowImportant && important }
      if (sendTo === 'mentor') await sendMentorMessage(sendUid, payload)
      else await sendMessage(sendTo, payload)
      setText('')
      setImportant(false)
    } catch {
      push('Could not send — check connection', 'error')
    } finally {
      setSending(false)
    }
  }

  const save = async (id, draft, done) => {
    setSavingId(id)
    try {
      await updateThreadMessage(path, id, draft)
      done()
    } catch {
      push('Could not save edit', 'error')
    } finally {
      setSavingId(null)
    }
  }

  const del = async (id) => {
    setDeletingId(id)
    try {
      await deleteThreadMessage(path, id)
    } catch {
      push('Could not delete', 'error')
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <section className="flex min-h-0 flex-col overflow-hidden rounded-3xl border border-ink/10 bg-white dark:border-paper/10 dark:bg-ink-soft">
      <header className="flex items-center gap-2.5 border-b border-ink/8 px-5 py-4 dark:border-paper/10">
        <Avatar name={title} size="sm" />
        <div className="min-w-0">
          <h3 className="flex items-center gap-1.5 font-display text-base font-bold leading-tight">
            {announce && <Megaphone size={15} className="shrink-0 opacity-50" />} {title}
          </h3>
          <p className="truncate text-xs opacity-50">{subtitle || `${rows.length} messages`}</p>
        </div>
        <span className="ml-auto flex shrink-0 items-center gap-1.5 rounded-full bg-emerald-500/12 px-2.5 py-1 text-[11px] font-bold text-emerald-700 dark:text-emerald-300">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-current" /> Live
        </span>
      </header>

      <ThreadList
        rows={rows} loading={loading} user={user} isAdmin={isAdmin}
        profileFor={profileFor} save={save} del={del}
        savingId={savingId} deletingId={deletingId}
      />

      <form onSubmit={send} className="border-t border-ink/8 bg-paper/60 p-3 dark:border-paper/10 dark:bg-ink/60">
        {allowImportant && (
          <label className="mb-2 flex cursor-pointer items-center gap-2 px-1 text-xs font-bold text-rose-600 dark:text-rose-400">
            <input type="checkbox" checked={important} onChange={(e) => setImportant(e.target.checked)} className="h-4 w-4 accent-rose-600" />
            Mark as important (red badge for students)
          </label>
        )}
        <div className="flex items-center gap-2">
          <input
            value={text} onChange={(e) => setText(e.target.value)}
            placeholder={`Message ${title}…`}
            aria-label={`Message ${title}`}
            maxLength={800}
            className="cdt-input min-w-0 flex-1 rounded-full px-4 py-2.5 text-sm"
          />
          <button disabled={sending || !text.trim()} aria-label="Send"
            className={cn('grid h-10 w-10 shrink-0 place-items-center rounded-full transition',
              text.trim() ? 'bg-ink text-white hover:-translate-y-0.5 dark:bg-paper dark:text-ink' : 'bg-ink/8 opacity-50 dark:bg-paper/10')}>
            {sending ? <Loader2 size={15} className="animate-spin" /> : <Send size={15} />}
          </button>
        </div>
      </form>
    </section>
  )
}
