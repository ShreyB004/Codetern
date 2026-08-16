import Redis from 'ioredis'
import { env } from '../env.js'

const url = new URL(env.REDIS_URL)

const redis = new Redis({
  host: url.hostname,
  port: Number(url.port || 6379),
  password: url.password || undefined,
  username: url.username || undefined,
  tls: url.protocol === 'rediss:' ? {} : undefined,
  maxRetriesPerRequest: 2,
  enableReadyCheck: true,
  lazyConnect: false,
  retryStrategy: (times) => Math.min(times * 250, 3000),
})

redis.on('error', (err) => {
  console.error('[redis] error:', err.message)
})

export const ping = async () => {
  const pong = await redis.ping()
  return pong === 'PONG'
}

export default redis