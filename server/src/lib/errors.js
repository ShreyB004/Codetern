// Central error model. Every handler throws only these; the global error
// handler turns them into consistent JSON responses. Unknown errors never
// leak internals to the client.

export class HttpError extends Error {
  constructor(status, code, message, details = null) {
    super(message)
    this.name = 'HttpError'
    this.status = status
    this.code = code
    this.details = details
  }
}

export const badRequest = (message, details) => new HttpError(400, 'bad_request', message, details)
export const unauthorized = (message = 'Authentication required.') => new HttpError(401, 'unauthorized', message)
export const forbidden = (message = 'You do not have permission to do that.') => new HttpError(403, 'forbidden', message)
export const notFound = (message = 'Not found.') => new HttpError(404, 'not_found', message)
export const conflict = (message, details) => new HttpError(409, 'conflict', message, details)
export const tooMany = (message = 'Too many requests. Try again shortly.') => new HttpError(429, 'rate_limited', message)
export const unavailable = (message = 'Service temporarily unavailable. Try again.') => new HttpError(503, 'unavailable', message)

export function isHttpError(err) {
  return err instanceof HttpError
}

export function pgErrorCode(err) {
  return err?.code || null // 23505 unique_violation, 23503 fk_violation, 22P02 invalid_text_representation
}