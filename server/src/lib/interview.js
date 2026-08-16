import { env } from '../env.js'
import { unavailable } from './errors.js'

// AI-scored interview. With OPENAI_API_KEY → structured rubric scoring with a
// request timeout + strict JSON re-parse. Without a key → deterministic local
// rubric scoring so the feature is fully functional offline.

const RUBRIC = `You are a senior hiring manager at Codetern scoring an intern's
final interview answers. For each of the 3 questions (clarity, depth, confidence),
score 0-10. Respond ONLY with valid JSON:
{"scores":[0-10,0-10,0-10],"feedback":{"clarity":"...","depth":"...","confidence":"...","next":"..."}}`

export async function scoreInterview(answers) {
  const normalized = (answers ?? []).map((a) => String(typeof a === 'string' ? a : a?.answer ?? a?.transcript ?? '')).filter(Boolean)

  if (env.aiConfigured) {
    try {
      const res = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${env.OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: env.AI_SCORER_MODEL,
          messages: [
            { role: 'system', content: RUBRIC },
            { role: 'user', content: JSON.stringify(normalized) },
          ],
          temperature: 0.2,
          max_tokens: 500,
          response_format: { type: 'json_object' },
        }),
        signal: AbortSignal.timeout(20_000),
      })
      if (!res.ok) throw new Error(`openai ${res.status}`)
      const data = await res.json()
      const text = data?.choices?.[0]?.message?.content || ''
      const parsed = parseStrictJson(text)
      const scores = (parsed?.scores || []).map(Number)
      if (scores.length !== 3 || scores.some((s) => !Number.isFinite(s))) throw new Error('malformed ai output')
      return { score: Math.round(scores.reduce((a, b) => a + b, 0) / 3), feedback: parsed.feedback || {}, source: 'ai' }
    } catch (err) {
      console.error('[interview] ai scoring failed, falling back to local:', err.message)
    }
  }

  // Deterministic local scoring — length/coverage heuristics, 0–100.
  const scores = normalized.map(localScore)
  while (scores.length < 3) scores.push(45)
  const score = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
  return {
    score,
    feedback: {
      clarity: score >= 70 ? 'Clear, structured answers with concrete examples.' : 'Answers were brief — expand with concrete examples.',
      depth: score >= 80 ? 'Strong domain awareness and reasoning.' : 'Add technical depth and trade-off analysis.',
      confidence: score >= 60 ? 'Confident, steady pacing.' : 'Pace yourself and structure thoughts before answering.',
      next: 'Your scorecard has been saved. Review the feedback and book your seat to continue.',
    },
    source: 'local',
  }
}

function localScore(text) {
  const t = text.trim()
  if (t.length < 10) return 25
  const words = t.split(/\s+/).length
  const hasTech = /\b(api|database|bug|deploy|auth|design|code|test|scal|stack|code|role|team|deadline|production|log|error)\b/i.test(t)
  const structured = /because|so|which|however|i think|we|my role/i.test(t)
  return Math.min(95, 40 + words * 2 + (hasTech ? 12 : 0) + (structured ? 10 : 0))
}

function parseStrictJson(text) {
  const clean = text.trim().replace(/^```json\s*/i, '').replace(/```$/, '')
  try {
    return JSON.parse(clean)
  } catch {
    const match = clean.match(/\{[\s\S]*\}/)
    if (!match) throw new Error('no json object in ai output')
    return JSON.parse(match[0])
  }
}

export async function fetchInterviewQuestions() {
  // Interview prompt-bank is static data; returns stable order.
  return [
    'Walk me through the last project you shipped and the biggest engineering decision you made.',
    'How would you debug a production bug you cannot reproduce locally?',
    'Describe a time you had to collaborate under a tight deadline — what was your role?',
  ]
}