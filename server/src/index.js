import Fastify from 'fastify'
import cors from '@fastify/cors'
import helmet from '@fastify/helmet'
import cookie from '@fastify/cookie'
import rateLimit from '@fastify/rate-limit'
import multipart from '@fastify/multipart'
import staticPlugin from '@fastify/static'
import { fileURLToPath } from 'node:url'
import path from 'node:path'
import { v4 as uuid } from 'uuid'
import { env } from './env.js'
import { isHttpError, pgErrorCode } from './lib/errors.js'
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

export async function buildApp() {
  const app = Fastify({
    logger: {
      level: env.isProd ? 'info' : 'debug',
      redact: ['req.headers.authorization', 'req.headers.cookie', 'res.headers["set-cookie"]'],
    },
    trustProxy: env.isProd, // behind Caddy/nginx
    bodyLimit: 8 * 1024 * 1024,
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
      return cb(new Error('Origin not allowed by CORS.'), false)
    },
    credentials: true,
  })
  await app.register(cookie)
  await app.register(rateLimit, {
    global: { max: 300, timeWindow: '1 minute' },
    redis,
  })
  await app.register(multipart, { limits: { fileSize: env.UPLOAD_MAX_MB * 1024 * 1024, files: 1 } })
  await app.register(staticPlugin, {
    root: path.resolve(env.UPLOAD_DIR),
    prefix: '/files/',
    decorateReply: false,
    wildcard: false,
  })

  // ── raw body for signature verification (webhook) ─────────────────
  app.addContentTypeParser('application/json', { parseAs: 'string' }, (request, body, done) => {
    request.rawBody = body
    try {
      done(null, JSON.parse(body))
    } catch (err) {
      done(err, undefined)
    }
  })

  // ── global error handler (must be registered BEFORE routes) ─────────
  app.setErrorHandler(async (err, request, reply) => {
    if (isHttpError(err)) {
      return reply.code(err.status).send({ error: { code: err.code, message: err.message, details: err.details } })
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

    request.log.error({ err, reqId: request.id }, 'unhandled error')
    return reply.code(500).send({ error: { code: 'internal', message: 'Something went wrong on our side. Please try again.' } })
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
  const app = await buildApp()

  const shutdown = async (signal) => {
    app.log.info({ signal }, 'shutting down')
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