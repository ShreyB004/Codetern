import 'dotenv/config'
import { readdir, readFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import path from 'node:path'
import pg from 'pg'

const DIR = path.join(path.dirname(fileURLToPath(import.meta.url)), 'migrations')

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  max: 2,
  connectionTimeoutMillis: 30_000,
  statement_timeout: 60_000,
})

async function ensureTable() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      name TEXT PRIMARY KEY,
      hash TEXT NOT NULL,
      applied_at TIMESTAMPTZ NOT NULL DEFAULT now()
    )`)
}

async function migrateAll() {
  await ensureTable()
  const files = (await readdir(DIR)).filter((f) => f.endsWith('.sql')).sort()
  const { rows } = await pool.query('SELECT name, hash FROM schema_migrations')
  const applied = new Map(rows.map((r) => [r.name, r.hash]))

  for (const file of files) {
    const sql = await readFile(path.join(DIR, file), 'utf8')
    const hash = await sha256(sql)
    const prev = applied.get(file)
    if (prev !== undefined) {
      if (prev !== hash) throw new Error(`Migration ${file} changed after being applied — refusing to continue.`)
      continue
    }
    const client = await pool.connect()
    try {
      await client.query('BEGIN')
      await client.query(sql)
      await client.query('INSERT INTO schema_migrations (name, hash) VALUES ($1, $2)', [file, hash])
      await client.query('COMMIT')
      console.log(`applied ${file}`)
    } catch (err) {
      await client.query('ROLLBACK')
      throw new Error(`Migration ${file} failed: ${err.message}`)
    } finally {
      client.release()
    }
  }
  console.log(`migrations up to date (${files.length} total)`)
}

function sha256(text) {
  return import('node:crypto').then(({ createHash }) => createHash('sha256').update(text).digest('hex'))
}

try {
  await migrateAll()
  await pool.end()
} catch (err) {
  console.error('migrate failed:', err.message)
  await pool.end().catch(() => {})
  process.exitCode = 1
}