import pg from 'pg'
import { env } from '../env.js'

// Any error happening inside a pool query should surface loudly.
pg.types.setTypeParser(20, (v) => Number(v)) // int8 → number (safe for our scale)

const pool = new pg.Pool({
  connectionString: env.DATABASE_URL,
  max: 10,
  idleTimeoutMillis: 30_000,
  connectionTimeoutMillis: 10_000,
  statement_timeout: 30_000,
  query_timeout: 30_000,
})

pool.on('error', (err) => {
  console.error('[db] idle client error:', err.message)
})

export const query = (text, params) => pool.query(text, params)

export const tx = async (fn) => {
  const client = await pool.connect()
  try {
    await client.query('BEGIN')
    const result = await fn(client)
    await client.query('COMMIT')
    return result
  } catch (err) {
    await client.query('ROLLBACK').catch(() => {})
    throw err
  } finally {
    client.release()
  }
}

export async function withRetry(fn, { attempts = 3, baseDelayMs = 200 } = {}) {
  let lastErr
  for (let i = 0; i < attempts; i += 1) {
    try {
      return await fn()
    } catch (err) {
      lastErr = err
      const retryable = ['ECONNRESET', '57P01', '57P02', '53300', '08006', '08P01'].includes(err?.code)
      if (!retryable || i === attempts - 1) throw err
      await new Promise((r) => setTimeout(r, baseDelayMs * 2 ** i))
    }
  }
  throw lastErr
}

export const ping = async () => {
  const { rows } = await pool.query('SELECT 1 AS ok')
  return rows[0].ok === 1
}

export const closePool = () => pool.end()