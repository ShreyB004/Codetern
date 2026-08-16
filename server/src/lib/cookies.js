import { env } from '../env.js'

const REFRESH_COOKIE_MS = 7 * 24 * 3600 * 1000

export function setRefreshCookie(reply, token) {
  reply.setCookie(env.COOKIE_NAME, token, {
    path: '/',
    httpOnly: true,
    secure: env.COOKIE_SECURE,
    sameSite: env.COOKIE_SAME_SITE,
    maxAge: REFRESH_COOKIE_MS,
  })
}

export function clearRefreshCookie(reply) {
  reply.clearCookie(env.COOKIE_NAME, { path: '/' })
}

export function readRefreshCookie(request) {
  return request.cookies?.[env.COOKIE_NAME] || null
}