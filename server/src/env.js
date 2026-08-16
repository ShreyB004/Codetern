import 'dotenv/config'

function required(name, devDefault = null) {
  const v = process.env[name]
  if (v && v.trim() !== '') return v.trim()
  if (devDefault !== null && process.env.NODE_ENV !== 'production') return devDefault
  throw new Error(`Missing required environment variable: ${name}`)
}

const NODE_ENV = process.env.NODE_ENV || 'development'
const isProd = NODE_ENV === 'production'

export const env = {
  NODE_ENV,
  isProd,
  PORT: Number(required('PORT', '4000')),
  DATABASE_URL: required('DATABASE_URL'),
  REDIS_URL: required('REDIS_URL'),

  JWT_SECRET: required('JWT_SECRET'),
  JWT_REFRESH_SECRET: required('JWT_REFRESH_SECRET'),
  JWT_ACCESS_TTL: process.env.JWT_ACCESS_TTL || '15m',
  JWT_REFRESH_TTL: process.env.JWT_REFRESH_TTL || '7d',

  CORS_ORIGINS: (process.env.CORS_ORIGINS || 'http://localhost:5173')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean),

  COOKIE_NAME: process.env.COOKIE_NAME || 'ct_refresh',
  COOKIE_SECURE: (process.env.COOKIE_SECURE || 'false') === 'true',
  COOKIE_SAME_SITE: process.env.COOKIE_SAME_SITE || 'lax',

  UPLOAD_DIR: process.env.UPLOAD_DIR || './uploads',
  UPLOAD_MAX_MB: Number(process.env.UPLOAD_MAX_MB || '8'),
  PUBLIC_BASE_URL: required('PUBLIC_BASE_URL', `http://localhost:${process.env.PORT || 4000}`),

  RAZORPAY_KEY_ID: process.env.RAZORPAY_KEY_ID || '',
  RAZORPAY_KEY_SECRET: process.env.RAZORPAY_KEY_SECRET || '',
  RAZORPAY_WEBHOOK_SECRET: process.env.RAZORPAY_WEBHOOK_SECRET || '',

  RESEND_API_KEY: process.env.RESEND_API_KEY || '',
  EMAIL_FROM: process.env.EMAIL_FROM || 'Codetern <no-reply@codetern.dev>',

  OPENAI_API_KEY: process.env.OPENAI_API_KEY || '',
  AI_SCORER_MODEL: process.env.AI_SCORER_MODEL || 'gpt-4o-mini',

  paymentsConfigured: Boolean(process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET),
  emailsConfigured: Boolean(process.env.RESEND_API_KEY),
  aiConfigured: Boolean(process.env.OPENAI_API_KEY),
}

if (!isProd && (env.JWT_SECRET.startsWith('dev-') || env.JWT_REFRESH_SECRET.startsWith('dev-'))) {
  console.warn('[env] Using dev JWT secrets — generate real secrets for production.')
}