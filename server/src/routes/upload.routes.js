import { requireAdmin } from '../auth/guards.js'
import { storage } from '../lib/storage.js'
import { query } from '../db/pool.js'
import { badRequest } from '../lib/errors.js'
import { parse } from '../lib/validate.js'
import { z } from 'zod'

const mediaFieldSchema = z.object({
  name: z.string().trim().min(1).max(160).default('upload'),
  slot: z.string().trim().min(1).max(60).default('home-hero'),
  kind: z.string().trim().min(1).max(20).default('image'),
})

// In @fastify/multipart v10 `part.destroy()` is synchronous (returns the part
// or undefined) — it is NOT thenable. Never chain .catch() off it; that throws
// a TypeError on every rejected upload and masks the real error.
function destroyFile(file) {
  try {
    if (file && typeof file.destroy === 'function') file.destroy()
    if (file?.file && typeof file.file.destroy === 'function') file.file.destroy()
  } catch { /* stream already consumed */ }
}

export async function uploadRoutes(app) {
  // Asset upload (admin only). Returns the stored URL for media records.
  app.post('/uploads', { preHandler: requireAdmin }, async (request, reply) => {
    const file = await request.file()
    if (!file) throw badRequest('No file provided.')

    let result
    try {
      result = await storage.save({}, file)
    } catch (err) {
      destroyFile(file)
      throw err
    }
    destroyFile(file)

    reply.code(201)
    return { ok: true, url: result.url, filename: result.filename, mime: result.mime, size: result.size, sha256: result.sha256 }
  })

  // Register an uploaded file with the media manager in one call.
  app.post('/uploads/media', { preHandler: requireAdmin }, async (request, reply) => {
    const file = await request.file()
    if (!file) throw badRequest('No file provided.')
    const raw = file.fields || {}
    const { name, slot, kind } = parse(mediaFieldSchema, {
      name: raw.name?.value,
      slot: raw.slot?.value,
      kind: raw.kind?.value,
    })

    let result
    try {
      result = await storage.save({}, file)
    } catch (err) {
      destroyFile(file)
      throw err
    }
    destroyFile(file)

    const { rows } = await query(
      `INSERT INTO media (id, name, kind, slot, url) VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [`m-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`, name, kind, slot, result.url],
    )
    reply.code(201)
    return { ok: true, media: rows[0] }
  })
}