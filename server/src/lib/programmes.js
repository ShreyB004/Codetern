import { readFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

// Static reference data mirrors the frontend (extracted at seed time).
let cache = null

export async function getProgrammesData() {
  if (cache) return cache
  const p = path.join(path.dirname(fileURLToPath(import.meta.url)), '../../db/seed-data/programmes.json')
  cache = JSON.parse(await readFile(p, 'utf8'))
  return cache
}

export async function getProgramme(id) {
  const list = await getProgrammesData()
  return list.find((p) => p.id === id) || null
}