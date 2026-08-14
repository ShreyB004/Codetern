import { useState } from 'react'
import { CheckCircle2, Eye, EyeOff, Pencil, Plus, Save, Trash2, X } from 'lucide-react'
import { useApp } from '../../context/AppContext.jsx'
import { useToast } from '../../context/ToastContext.jsx'
import { useTheme } from '../../context/ThemeContext.jsx'
import { getProgramme, DOMAIN_COLORS } from '../../data/programmes.js'
import { Modal } from '../ui/Modal.jsx'
import { cn, domainChip } from '../../lib/utils.js'

export function QuestionManager() {
  const { programmes, quizBanks, setQuestionEnabled, upsertQuestion, removeQuestion } = useApp()
  const { push } = useToast()
  const { isDark } = useTheme()
  const [domain, setDomain] = useState(programmes[0]?.id || '')
  const [editing, setEditing] = useState(null)

  const bank = quizBanks?.[domain] || { minutes: 5, questions: [] }
  const p = getProgramme(domain)
  const color = p ? DOMAIN_COLORS[p.color] : null
  const enabledCount = bank.questions.filter((q) => q.enabled !== false).length

  const allEnabled = enabledCount === bank.questions.length

  const toggleAll = () => {
    const next = !allEnabled
    bank.questions.forEach((_, i) => setQuestionEnabled(domain, i, next))
    push(`All ${bank.questions.length} questions ${next ? 'enabled' : 'disabled'} for ${p?.title}`, 'success')
  }

  return (
    <div>
      {/* toolbar */}
      <div className="mb-6 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap items-center gap-3">
          <select value={domain} onChange={(e) => setDomain(e.target.value)} className="cdt-input rounded-xl px-4 py-2.5 text-sm font-semibold outline-none">
            {programmes.map((pr) => <option key={pr.id} value={pr.id}>{pr.title}</option>)}
          </select>
          {p && (
            <span className="flex items-center gap-2 rounded-bubble px-3 py-1.5 text-xs font-bold" style={domainChip(color, isDark)}>
              {p.sub}
            </span>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-2.5">
          <span className="rounded-bubble bg-ink/5 px-3.5 py-1.5 text-xs font-semibold text-ink/55 dark:bg-paper/10 dark:text-paper/55">
            {enabledCount}/{bank.questions.length} shown in the Final Assessment
          </span>
          <button onClick={toggleAll} className="rounded-xl border border-ink/12 px-4 py-2 text-sm font-semibold text-ink/60 hover:bg-ink/5 dark:border-paper/15 dark:text-paper/60 dark:hover:bg-paper/5">
            {allEnabled ? 'Disable all' : 'Enable all'}
          </button>
          <button
            onClick={() => setEditing({ index: null, question: { q: '', options: ['', '', '', ''], answer: 0, why: '' } })}
            className="flex items-center gap-2 rounded-xl bg-ink px-4 py-2 text-sm font-semibold text-paper transition hover:bg-ink-soft dark:bg-paper dark:text-ink dark:hover:bg-paper/85"
          >
            <Plus size={15} /> New question
          </button>
        </div>
      </div>

      {/* question list */}
      <div className="grid gap-3">
        {bank.questions.map((q, i) => (
          <div
            key={i}
            className={cn(
              'rounded-2xl border bg-white p-4 transition dark:bg-ink-soft',
              q.enabled === false ? 'border-ink/8 opacity-55 dark:border-paper/10' : 'border-ink/10 dark:border-paper/15',
            )}
          >
            <div className="flex items-start gap-3">
              <button
                onClick={() => setQuestionEnabled(domain, i, !(q.enabled !== false))}
                className={cn(
                  'mt-0.5 flex shrink-0 items-center gap-1.5 rounded-bubble border px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider transition',
                  q.enabled === false ? 'border-ink/15 text-ink/40 dark:border-paper/20 dark:text-paper/40' : 'border-mint-deep/40 bg-mint-deep/10 text-mint-deep dark:border-mint/40 dark:bg-mint/10 dark:text-mint',
                )}
                title={q.enabled === false ? 'Click to enable' : 'Click to disable'}
              >
                {q.enabled === false ? <EyeOff size={12} /> : <Eye size={12} />}
                {q.enabled === false ? 'Hidden' : 'Shown'}
              </button>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-bold leading-snug text-ink dark:text-paper">
                  {i + 1}. {q.q}
                </p>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {q.options.map((opt, oi) => (
                    <span
                      key={oi}
                      className={cn(
                        'rounded-bubble px-2.5 py-0.5 text-[11px] font-medium',
                        oi === q.answer ? 'bg-mint-deep/15 font-bold text-mint-deep dark:bg-mint/15 dark:text-mint' : 'bg-ink/5 text-ink/60 dark:bg-paper/5 dark:text-paper/55',
                      )}
                    >
                      {String.fromCharCode(65 + oi)}. {opt}
                    </span>
                  ))}
                </div>
                {q.why && <p className="mt-1.5 text-xs text-ink/45 dark:text-paper/45">Why: {q.why}</p>}
              </div>
              <div className="flex shrink-0 gap-1.5">
                <button onClick={() => setEditing({ index: i, question: { ...q } })} className="grid h-8 w-8 place-items-center rounded-lg border border-ink/10 text-ink/60 transition hover:bg-ink/5 dark:border-paper/15 dark:text-paper/60 dark:hover:bg-paper/5" aria-label="Edit question">
                  <Pencil size={14} />
                </button>
                <button onClick={() => { removeQuestion(domain, i); push('Question removed', 'info') }} className="grid h-8 w-8 place-items-center rounded-lg border border-coral-deep/20 text-coral-deep transition hover:bg-coral-deep/10 dark:border-coral/20 dark:text-coral dark:hover:bg-coral/10" aria-label="Delete question">
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          </div>
        ))}

        {bank.questions.length === 0 && (
          <p className="rounded-2xl border border-dashed border-ink/15 py-16 text-center text-sm text-ink/45 dark:border-paper/15 dark:text-paper/45">
            No questions for this domain yet — add your first one.
          </p>
        )}
      </div>

      {editing && (
        <QuestionForm
          question={editing.question}
          isNew={editing.index === null}
          onClose={() => setEditing(null)}
          onSave={(q) => {
            upsertQuestion(domain, q, editing.index)
            push(editing.index === null ? 'Question added' : 'Question updated', 'success')
            setEditing(null)
          }}
        />
      )}
    </div>
  )
}

function QuestionForm({ question, isNew, onClose, onSave }) {
  const [q, setQ] = useState({ ...question })
  const set = (k) => (e) => setQ((prev) => ({ ...prev, [k]: e.target.value }))
  const setOption = (i, v) => setQ((prev) => ({ ...prev, options: prev.options.map((o, oi) => (oi === i ? v : o)) }))
  const addOption = () => setQ((prev) => ({ ...prev, options: [...prev.options, ''] }))

  const save = () => {
    if (!q.q.trim()) return
    onSave({ q: q.q, options: q.options.map((o) => o.trim()).filter(Boolean), answer: q.answer, why: q.why, enabled: q.enabled !== false })
  }

  return (
    <Modal open onClose={onClose} size="md" labelledBy="qm-questionform-title" className="p-7">
      <h3 id="qm-questionform-title" className="font-display text-lg font-bold text-ink dark:text-paper">{isNew ? 'Add a question' : 'Edit question'}</h3>

        <div className="mt-5 flex flex-col gap-4">
          <label className="block">
            <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-ink/50 dark:text-paper/50">Question</span>
            <textarea value={q.q} onChange={set('q')} rows={2} className="cdt-input w-full resize-none rounded-xl px-4 py-2.5 text-sm outline-none focus:border-cyan-snap/60" />
          </label>

          <div>
            <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-ink/50 dark:text-paper/50">Options</span>
            <div className="grid gap-2">
              {q.options.map((opt, i) => (
                <div key={i} className="flex items-center gap-2">
                  <button
                    onClick={() => setQ((prev) => ({ ...prev, answer: i }))}
                    className={cn(
                      'flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border text-xs font-black transition',
                      q.answer === i ? 'border-mint bg-mint text-ink' : 'border-ink/15 text-ink/40 dark:border-paper/20 dark:text-paper/40',
                    )}
                    title="Mark as correct answer"
                  >
                    {q.answer === i ? <CheckCircle2 size={14} /> : String.fromCharCode(65 + i)}
                  </button>
                  <input
                    value={opt}
                    onChange={(e) => setOption(i, e.target.value)}
                    className="cdt-input min-w-0 flex-1 rounded-xl px-3 py-2 text-sm outline-none focus:border-cyan-snap/60"
                    placeholder={`Option ${String.fromCharCode(65 + i)}`}
                  />
                </div>
              ))}
            </div>
            <button onClick={addOption} className="mt-2 rounded-full border border-dashed border-ink/25 px-4 py-1.5 text-xs font-semibold text-ink/60 transition hover:border-cyan-deep/50 hover:text-cyan-deep dark:border-paper/25 dark:text-paper/50 dark:hover:border-cyan-snap/50 dark:hover:text-cyan-snap">
              + Add option
            </button>
          </div>

          <label className="block">
            <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-ink/50 dark:text-paper/50">Explanation (why)</span>
            <textarea value={q.why || ''} onChange={set('why')} rows={2} className="cdt-input w-full resize-none rounded-xl px-4 py-2.5 text-sm outline-none focus:border-cyan-snap/60" />
          </label>

          <label className="flex items-center gap-2.5 text-sm font-medium text-ink/70 dark:text-paper/70">
            <input
              type="checkbox"
              checked={q.enabled !== false}
              onChange={(e) => setQ((prev) => ({ ...prev, enabled: e.target.checked }))}
              className="h-4 w-4 accent-cyan-snap"
            />
            Show in the Final Assessment
          </label>
        </div>

        <div className="mt-7 flex justify-end gap-3 border-t border-ink/8 pt-5 dark:border-paper/10">
          <button onClick={onClose} className="flex items-center gap-2 rounded-full border border-ink/12 px-5 py-2.5 text-sm font-semibold text-ink/60 hover:bg-ink/5 dark:border-paper/15 dark:text-paper/60 dark:hover:bg-paper/5">
            <X size={15} /> Cancel
          </button>
          <button onClick={save} className="flex items-center gap-2 rounded-full bg-ink px-6 py-2.5 text-sm font-semibold text-paper transition hover:bg-ink-soft dark:bg-paper dark:text-ink dark:hover:bg-paper/85">
            <Save size={15} /> {isNew ? 'Add question' : 'Save changes'}
          </button>
        </div>
    </Modal>
  )
}
