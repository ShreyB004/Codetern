import { mkdir, writeFile, unlink, stat } from 'node:fs/promises'
import path from 'node:path'
import { randomBytes, createHash } from 'node:crypto'
import { env } from '../env.js'
import { badRequest, unavailable, notFound } from './errors.js'

const ALLOWED_MIME = new Map([
  ['image/jpeg', '.jpg'],
  ['image/png', '.png'],
  ['image/webp', '.webp'],
  ['image/svg+xml', '.svg'],
  ['image/gif', '.gif'],
  ['application/pdf', '.pdf'],
  ['text/plain', '.txt'],
  ['application/json', '.json'],
  ['application/zip', '.zip'],
])

// Storage lives behind one interface so moving to S3/R2 later is a single swap.
export const storage = {
  async init() {
    await mkdir(path.resolve(env.UPLOAD_DIR), { recursive: true })
  },

  async save(fields, file) {
    const mime = file?.mimetype || ''
    const ext = ALLOWED_MIME.get(mime)
    if (!ext) throw badRequest(`File type "${mime || 'unknown'}" is not allowed.`)

    const maxBytes = env.UPLOAD_MAX_MB * 1024 * 1024
    if (file?.size !== undefined && Number(file.size) > maxBytes) {
      throw badRequest(`File exceeds the ${env.UPLOAD_MAX_MB} MB limit.`)
    }

    const data = await file.toBuffer?.()
    if (!data || data.length === 0) throw badRequest('Uploaded file is empty.')
    if (data.length > maxBytes) throw badRequest(`File exceeds the ${env.UPLOAD_MAX_MB} MB limit.`)

    const filename = `${Date.now().toString(36)}-${randomBytes(6).toString('hex')}${ext}`
    const abs = path.resolve(env.UPLOAD_DIR, filename)
    try {
      await writeFile(abs, data, { flag: 'wx' })
    } catch (err) {
      if (err.code === 'EEXIST') throw unavailable('Upload collision, please retry.')
      throw unavailable('Could not store file.')
    }

    return {
      filename,
      url: new URL(path.join('/files', filename), env.PUBLIC_BASE_URL).toString(),
      size: data.length,
      mime: mime || 'application/octet-stream',
      sha256: createHash('sha256').update(data).digest('hex'),
    }
  },

  async remove(filename) {
    if (!safeName(filename)) return
    try {
      await unlink(path.resolve(env.UPLOAD_DIR, filename))
    } catch (err) {
      if (err.code !== 'ENOENT') throw notFound('File not found.')
    }
  },

  async exists(filename) {
    if (!safeName(filename)) return false
    try {
      await stat(path.resolve(env.UPLOAD_DIR, filename))
      return true
    } catch {
      return false
    }
  },
}

// A stored filename must be a plain basename inside the upload dir — no
// separators, no "..", and the resolved path must stay within UPLOAD_DIR.
function safeName(filename) {
  if (!filename || typeof filename !== 'string') return false
  if (path.basename(filename) !== filename) return false
  if (filename.includes('..') || path.isAbsolute(filename)) return false
  const abs = path.resolve(env.UPLOAD_DIR, filename)
  return abs.startsWith(path.resolve(env.UPLOAD_DIR) + path.sep)
}