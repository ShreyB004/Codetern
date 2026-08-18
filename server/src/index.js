import Fastify from 'fastify'
import cors from '@fastify/cors'
import helmet from '@fastify/helmet'
import cookie from '@fastify/cookie'
import rateLimit from '@fastify/rate-limit'
import multipart from '@fastify/multipart'
import staticPlugin from '@fastify/static'
import { fileURLToPath } from 'node:url'
import path from 'node:path'
import { mkdir } from 'node:fs/promises'
import { v4 as uuid } from 'uuid'
import { env } from './env.js'
import { isHttpError, pgErrorCode, badRequest, forbidden } from './lib/errors.js'
import { closePool, ping as pingDb } from './db/pool.js'
import redis, { ping as pingRedis } from './db/redis.js'
import { storage } from './lib/storage.js'
import { authRoutes } from './routes/auth.routes.js'
import { publicRoutes } from './routes/public.routes.js'
import { meRoutes } from './routes/me.routes.js'
import { bookingRoutes } from './routes/booking.routes.js'
import { adminRoutes } from './routes/admin.routes.js'
import { uploadRoutes } from './routes/upload.routes.js'
import { seatWorker, emailWorker, seatQueue, emailQueue, HOLD_TTL_MS } from './queues.js'

const ROOT = path.dirname(fileURLToPath(import.meta.url))

// Safe public labels for framework-raised HTTP statuses. Never echo err.message
// here — router-level errors can embed the full request URL.
const STATUS_CODES = {
  400: ['bad_request', 'Bad request.'],
  401: ['unauthorized', 'Authentication required.'],
  403: ['forbidden', 'You do not have permission to do that.'],
  404: ['not_found', 'Not found.'],
  405: ['method_not_allowed', 'Method not allowed.'],
  406: ['not_acceptable', 'Not acceptable.'],
  413: ['payload_too_large', 'Request body too large.'],
  414: ['uri_too_long', 'Request URI is too long.'],
  415: ['unsupported_media_type', 'Unsupported media type.'],
  422: ['invalid_entity', 'Invalid entity.'],
}

export async function buildApp() {
  const app = Fastify({
    logger: {
      level: env.isProd ? 'info' : 'debug',
      redact: ['req.headers.authorization', 'req.headers.cookie', 'res.headers["set-cookie"]'],
    },
    trustProxy: env.isProd, // behind Caddy/nginx
    bodyLimit: 8 * 1024 * 1024,
    // Router-level failures (max-param-length, bad URL) bypass the normal
    // lifecycle; this is the only place they can be enveloped safely.
    frameworkErrors(err, request, reply) {
      const [code, message] = STATUS_CODES[err.statusCode] || ['bad_request', 'Request could not be processed.']
      request.log.warn({ err }, 'framework error')
      return reply.code(err.statusCode || 400).send({ error: { code, message } })
    },
  })

  // ── request ids ─────────────────────────────────────────────────────
  app.addHook('onRequest', async (request, reply) => {
    const id = request.headers['x-request-id'] || uuid()
    request.id = id
    reply.header('x-request-id', id)
  })

  // ── security / protocol plugins ─────────────────────────────────────
  await app.register(helmet, { contentSecurityPolicy: false })
  await app.register(cors, {
    origin: (origin, cb) => {
      // No origin (curl, server-to-server) is always allowed; browser
      // origins must be on the allowlist or match the PUBLIC URL host.
      if (!origin || env.CORS_ORIGINS.includes(origin)) return cb(null, true)
      try {
        const publicHost = new URL(env.PUBLIC_BASE_URL).host
        if (new URL(origin).host === publicHost) return cb(null, true)
      } catch {
        /* ignore malformed origin */
      }
      // 403 (not 500) so a rejected origin is clearly a client-side problem.
      return cb(forbidden('Origin not allowed by CORS.'), false)
    },
    credentials: true,
  })
  await app.register(cookie)
  await app.register(rateLimit, {
    global: { max: 300, timeWindow: '1 minute' },
    redis,
  })
  await app.register(multipart, { limits: { fileSize: env.UPLOAD_MAX_MB * 1024 * 1024, files: 1 } })
  // sendFile decoration only — serving is an explicit validated route below
  // (serve:false avoids the plugin's boot-time file glob, which can never see
  // files uploaded after startup).
  await app.register(staticPlugin, {
    root: path.resolve(env.UPLOAD_DIR),
    prefix: '/files/',
    decorateReply: true, // powers /files/:filename and auth.routes /api/files/:filename
    serve: false,
  })

  // ── raw body for signature verification (webhook) ─────────────────
  app.addContentTypeParser('application/json', { parseAs: 'string' }, (request, body, done) => {
    request.rawBody = body
    try {
      done(null, JSON.parse(body))
    } catch {
      done(badRequest('Invalid JSON body.'), undefined)
    }
  })

  // ── global error handler (must be registered BEFORE routes) ─────────
  app.setErrorHandler(async (err, request, reply) => {
    if (isHttpError(err)) {
      return reply.code(err.status).send({ error: { code: err.code, message: err.message, details: err.details || undefined } })
    }

    const code = pgErrorCode(err)
    if (code === '23505') {
      return reply.code(409).send({ error: { code: 'conflict', message: 'That record already exists.' } })
    }
    if (code === '23503') {
      return reply.code(400).send({ error: { code: 'bad_request', message: 'Linked record does not exist.' } })
    }
    if (code === '22P02' || code === '22P04') {
      return reply.code(400).send({ error: { code: 'bad_request', message: 'Invalid value in the request.' } })
    }
    if (err.statusCode === 429 || code === 'rate_limited') {
      return reply.code(429).send({ error: { code: 'rate_limited', message: 'Too many requests. Try again shortly.' } })
    }
    if (err && err.validation) {
      return reply.code(400).send({ error: { code: 'bad_request', message: 'Invalid request.', details: err.validation } })
    }
    // Plugin/infrastructure errors that already carry an HTTP status (body
    // too large, media type, multipart limits, …) must keep their status
    // while staying inside the error envelope — never a raw 500.
    if (err.statusCode && err.statusCode >= 400) {
      const [sc, message] = STATUS_CODES[err.statusCode] || (err.statusCode < 500 ? ['bad_request', 'Request could not be processed.'] : ['internal', 'Something went wrong on our side. Please try again.'])
      return reply.code(err.statusCode).send({ error: { code: sc, message } })
    }

    request.log.error({ err, reqId: request.id }, 'unhandled error')
    return reply.code(500).send({ error: { code: 'internal', message: 'Something went wrong on our side. Please try again.' } })
  })

  // Safety net: any response still carrying a raw framework error body (the
  // default {statusCode, error, message} JSON or a sent Error instance) is
  // wrapped into the app envelope so no 4xx/5xx ever leaks internals. This is
  // the only path that reaches router-level replies (414 max-param-length,
  // malformed URL, static misses) which bypass the error handler.
  app.addHook('onSend', async (request, reply, payload) => {
    if (reply.statusCode < 400) return payload
    const raw = payload instanceof Error
      || (payload && typeof payload === 'object' && typeof payload.error === 'string'
        && typeof payload.message === 'string' && typeof payload.statusCode === 'number')
    if (!raw) return payload
    const [code, message] = STATUS_CODES[reply.statusCode] || ['bad_request', 'Request could not be processed.']
    return { error: { code, message } }
  })

  // 404 handler
  app.setNotFoundHandler((request, reply) => {
    reply.code(404).send({ error: { code: 'not_found', message: `No route for ${request.method} ${request.url}` } })
  })

  // ── health ──────────────────────────────────────────────────────────
  app.get('/health', async () => {
    const checks = await Promise.allSettled([pingDb(), pingRedis()])
    const dbOk = checks[0].status === 'fulfilled' && checks[0].value === true
    const redisOk = checks[1].status === 'fulfilled' && checks[1].value === true
    const ok = dbOk && redisOk
    return { ok, db: dbOk, redis: redisOk, uptime: process.uptime(), time: new Date().toISOString() }
  })

  app.get('/health/live', async () => ({ ok: true }))

  // ── static file serving ────────────────────────────────────────────
  // Explicit single-segment route: no directory listing, no wildcard or
  // dot-path lookups, and sendFile() resolves strictly inside UPLOAD_DIR.
  app.get('/files/:filename', async (request, reply) => {
    const filename = request.params.filename
    if (!filename) return reply.callNotFound()
    if (filename.includes('..') || path.isAbsolute(filename) || path.basename(filename) !== filename) {
      throw badRequest('Invalid file name.')
    }
    return reply.sendFile(filename)
  })

  // ── routes ──────────────────────────────────────────────────────────
  await app.register(
    async (child) => {
      await child.register(authRoutes)
      await child.register(publicRoutes)
      await child.register(meRoutes)
      await child.register(bookingRoutes)
      await child.register(uploadRoutes)
    },
    { prefix: '/api' },
  )
  await app.register(async (child) => {
    await child.register(adminRoutes)
  }, { prefix: '/api' })

  return app
}

async function main() {
  await storage.init()
  // Log dir exists before anything (email worker / payments mock logs) writes,
  // so a missing directory can never crash a worker job.
  await mkdir(path.resolve(env.LOG_DIR), { recursive: true })
  const app = await buildApp()

  let shuttingDown = false
  const shutdown = async (signal) => {
    if (shuttingDown) return
    shuttingDown = true
    app.log.info({ signal }, 'shutting down')
    // Hard-exit safety valve: if draining workers/pool hangs, never hang forever.
    const forceExit = setTimeout(() => {
      app.log.error('graceful shutdown timed out — forcing exit')
      process.exit(1)
    }, 10_000)
    forceExit.unref()
    try {
      await app.close()
    } catch (err) {
      app.log.error({ err }, 'error during app close')
    }
    try {
      await seatWorker.close()
      await emailWorker.close()
      await seatQueue.close()
      await emailQueue.close()
    } catch (err) {
      app.log.error({ err }, 'error closing queues')
    }
    try {
      await redis.quit()
    } catch {
      /* already closed */
    }
    try {
      await closePool()
    } catch (err) {
      app.log.error({ err }, 'error closing pool')
    }
    process.exit(0)
  }

  process.on('SIGTERM', () => shutdown('SIGTERM'))
  process.on('SIGINT', () => shutdown('SIGINT'))
  process.on('uncaughtException', (err) => {
    app.log.error({ err }, 'uncaught exception')
    shutdown('uncaughtException')
  })
  process.on('unhandledRejection', (reason) => {
    app.log.error({ reason }, 'unhandled rejection')
  })

  // Startup self-check: refuse to serve traffic without working infra.
  const dbOk = await pingDb().catch(() => false)
  const redisOk = await pingRedis().catch(() => false)
  if (!dbOk || !redisOk) {
    app.log.error({ dbOk, redisOk }, 'infrastructure not ready — exiting')
    process.exit(1)
  }

  try {
    await app.listen({ port: env.PORT, host: '0.0.0.0' })
  } catch (err) {
    app.log.error(err)
    process.exit(1)
  }
}

main()