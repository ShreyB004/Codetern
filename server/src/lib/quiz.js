import { query } from '../db/pool.js'
import { badRequest, notFound } from './errors.js'

export const PASS_RATIO = 0.7

// Server-side scoring of a submitted quiz. Answers: array of option indices.
export async function scoreQuiz(domain, answers) {
  const { rows } = await query('SELECT minutes, questions FROM quiz_banks WHERE domain = $1', [domain])
  if (!rows[0]) throw notFound('No question bank exists for this domain.')
  const { questions } = rows[0]

  if (!Array.isArray(answers)) throw badRequest('answers must be an array.')
  if (answers.length !== questions.length) {
    throw badRequest(`Expected ${questions.length} answers, got ${answers.length}.`)
  }
  for (const a of answers) {
    if (!Number.isInteger(a)) throw badRequest('Every answer must be an integer option index. If you skipped a question, send null.')
  }

  let correct = 0
  const detailed = questions.map((q, i) => {
    const ok = answers[i] === q.answer
    if (ok) correct += 1
    return { index: i, correct: ok }
  })

  const passMark = Math.ceil(PASS_RATIO * questions.length)
  const score = Math.round((correct / questions.length) * 100)
  const passed = correct >= passMark

  return {
    domain,
    total: questions.length,
    correct,
    score,
    passed,
    passMark,
    detailed,
  }
}

export async function createReferralCode(client, name) {
  const base =
    name
      .trim()
      .replace(/[^a-zA-Z]/g, '')
      .slice(0, 4)
      .toUpperCase() || 'CDT'
  for (let attempt = 0; attempt < 10; attempt += 1) {
    const code = `${base}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`
    const { rows } = await client.query('SELECT 1 FROM users WHERE referral_code = $1', [code])
    if (rows.length === 0) return code
  }
  throw new Error('Could not generate a unique referral code.')
}