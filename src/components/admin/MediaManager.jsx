import { useRef, useState } from 'react'
import { Image as ImageIcon, Pencil, Plus, Trash2, Upload } from 'lucide-react'
import { useApp } from '../../context/AppContext.jsx'
import { useToast } from '../../context/ToastContext.jsx'
import { cn } from '../../lib/utils.js'

const SLOTS = ['home-hero', 'home-realwork', 'cert-hero', 'about-hero', 'custom']

export function MediaManager() {
  const { media, addMedia, updateMedia, removeMedia } = useApp()
  const { push } = useToast()
  const [drag, setDrag] = useState(false)
  const [editing, setEditing] = useState(null)
  const inputRef = useRef(null)

  const handleFiles = (files) => {
    Array.from(files || []).slice(0, 6).forEach((file) => {
      if (!file.type.startsWith('image/')) return
      const reader = new FileReader()
      reader.onload = () => {
        addMedia({
          name: file.name,
          kind: 'image',
          slot: SLOTS[0],
          width: file.width || window.innerWidth,
          height: file.height || 600,
          src: reader.result,
        })
        push(`Uploaded ${file.name}`, 'success')
      }
      reader.readAsDataURL(file)
    })
  }

  return (
    <div>
      {/* dropzone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDrag(true) }}
        onDragLeave={() => setDrag(false)}
        onDrop={(e) => { e.preventDefault(); setDrag(false); handleFiles(e.dataTransfer.files) }}
        onClick={() => inputRef.current?.click()}
        className={cn(
          'mb-8 flex cursor-pointer flex-col items-center justify-center gap-3 rounded-panel border-2 border-dashed px-6 py-12 text-center transition-colors',
          drag ? 'border-cyan-snap/70 bg-cyan-snap/8' : 'border-ink/15 bg-white dark:border-paper/15 dark:bg-ink',
        )}
      >
        <span className="grid h-14 w-14 place-items-center rounded-2xl bg-ink text-neon">
          <Upload size={24} />
        </span>
        <div>
          <p className="font-display text-lg font-bold text-ink dark:text-paper">Drop promotional images here</p>
          <p className="text-sm text-ink/50 dark:text-paper/50">or click to browse · PNG, JPG, WEBP · assigned to a layout slot</p>
        </div>
        <input ref={inputRef} type="file" accept="image/*" multiple className="hidden" onChange={(e) => handleFiles(e.target.files)} />
      </div>

      {/* grid */}
      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {media.map((m) => (
          <div key={m.id} className="group overflow-hidden rounded-panel border border-ink/8 bg-white dark:border-paper/10 dark:bg-ink-soft shadow-card dark:border-paper/10 dark:bg-ink-soft dark:shadow-none">
            <div className="relative aspect-[16/9] overflow-hidden bg-ink/5 dark:bg-paper/5">
              {m.src ? (
                <img src={m.src} alt={m.name} className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center" style={{ background: m.gradient }}>
                  <ImageIcon size={40} className="text-white/50" />
                </div>
              )}
              <div className="absolute inset-0 flex items-center justify-center gap-2 bg-ink/60 opacity-0 backdrop-blur-sm transition group-hover:opacity-100">
                <button
                  onClick={() => setEditing(m.id)}
                  className="grid h-9 w-9 place-items-center rounded-xl bg-white text-ink dark:text-paper transition hover:scale-110"
                  aria-label="Edit"
                >
                  <Pencil size={15} />
                </button>
                <button
                  onClick={() => { removeMedia(m.id); push('Asset removed', 'info') }}
                  className="grid h-9 w-9 place-items-center rounded-xl bg-coral text-white transition hover:scale-110"
                  aria-label="Delete"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
            <div className="flex items-center justify-between gap-2 p-4">
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-ink dark:text-paper">{m.name}</p>
                <p className="text-[11px] text-ink/45 dark:text-paper/45">
                  slot: <span className="font-semibold text-cyan-snap">{m.slot}</span> · {m.width}×{m.height}
                </p>
              </div>
              <span className="shrink-0 rounded-bubble bg-ink/5 dark:bg-paper/5 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-ink/50 dark:text-paper/50">
                {m.kind}
              </span>
            </div>
          </div>
        ))}

        {/* add tile */}
        <button
          onClick={() => setEditing('__new')}
          className="grid min-h-[180px] place-items-center rounded-panel border border-dashed border-ink/20 dark:border-paper/20 text-ink/40 dark:text-paper/40 transition hover:border-cyan-snap/50 hover:text-cyan-snap"
        >
          <span className="flex flex-col items-center gap-2">
            <Plus size={26} />
            <span className="text-sm font-semibold">Add asset / slot</span>
          </span>
        </button>
      </div>

      {editing && (
        <EditModal
          asset={media.find((m) => m.id === editing)}
          onClose={() => setEditing(null)}
          onSave={({ id, ...patch }) => {
            if (id === '__new') addMedia({ name: 'new-asset.svg', kind: 'svg', width: 1600, height: 900, gradient: 'linear-gradient(135deg,#22d3ee,#7c5cff)', ...patch })
            else updateMedia(id, patch)
            setEditing(null)
            push('Asset updated', 'success')
          }}
        />
      )}
    </div>
  )
}

function EditModal({ asset, onClose, onSave }) {
  const [name, setName] = useState(asset?.name || 'untitled.svg')
  const [slot, setSlot] = useState(asset?.slot || SLOTS[0])

  return (
    <div className="fixed inset-0 z-[110] grid place-items-center p-4">
      <div className="absolute inset-0 bg-ink/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md rounded-panel bg-white p-6 shadow-float dark:bg-ink-soft dark:shadow-none">
        <h3 className="font-display text-lg font-bold text-ink dark:text-paper">{asset ? 'Edit asset' : 'New asset slot'}</h3>
        <div className="mt-5 flex flex-col gap-4">
          <label className="block">
            <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-ink/50 dark:text-paper/50">Asset name</span>
            <input value={name} onChange={(e) => setName(e.target.value)} className="w-full rounded-xl border border-ink/12 dark:border-paper/12 px-4 py-2.5 text-sm outline-none focus:border-cyan-snap/60" />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-ink/50 dark:text-paper/50">Layout slot</span>
            <select value={slot} onChange={(e) => setSlot(e.target.value)} className="w-full rounded-xl border border-ink/12 dark:border-paper/12 px-4 py-2.5 text-sm outline-none focus:border-cyan-snap/60">
              {SLOTS.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </label>
        </div>
        <div className="mt-6 flex justify-end gap-3">
          <button onClick={onClose} className="rounded-full border border-ink/12 px-5 py-2.5 text-sm font-semibold text-ink/60 hover:bg-ink/5 dark:border-paper/15 dark:text-paper/60 dark:hover:bg-paper/5">Cancel</button>
          <button onClick={() => onSave({ id: asset?.id || '__new', name, slot })} className="rounded-full bg-ink px-5 py-2.5 text-sm font-semibold text-paper hover:bg-ink-soft">
            Save
          </button>
        </div>
      </div>
    </div>
  )
}
