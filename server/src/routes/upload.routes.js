import { requireAdmin } from '../auth/guards.js'
import { storage } from '../lib/storage.js'
import { query } from '../db/pool.js'
import { badRequest } from '../lib/errors.js'

export async function uploadRoutes(app) {
  // Asset upload (admin only). Returns the stored URL for media records.
  app.post('/uploads', { preHandler: requireAdmin }, async (request, reply) => {
    const file = await request.file()
    if (!file) throw badRequest('No file provided.')

    let result
    try {
      result = await storage.save({}, file)
    } catch (err) {
      if (err && typeof err.destroy === 'function') err.destroy().catch(() => {})
      throw err
    } finally {
      if (file && typeof file.file?.destroy === 'function') file.file.destroy().catch(() => {})
    }

    reply.code(201)
    return { ok: true, url: result.url, filename: result.filename, mime: result.mime, size: result.size, sha256: result.sha256 }
  })

  // Register an uploaded file with the media manager in one call.
  app.post('/uploads/media', { preHandler: requireAdmin }, async (request, reply) => {
    const file = await request.file()
    if (!file) throw badRequest('No file provided.')
    const fields = file.fields || {}
    const name = String(fields.name?.value || 'upload')
    const slot = String(fields.slot?.value || 'home-hero')
    const kind = String(fields.kind?.value || 'image')

    let result
    try {
      result = await storage.save({}, file)
    } catch (err) {
      if (err && typeof err.destroy === 'function') err.destroy().catch(() => {})
      throw err
    } finally {
      if (file && typeof file.file?.destroy === 'function') file.file.destroy().catch(() => {})
    }

    const { rows } = await query(
      `INSERT INTO media (id, name, kind, slot, url) VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [`m-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`, name, kind, slot, result.url],
    )
    reply.code(201)
    return { ok: true, media: rows[0] }
  })
}