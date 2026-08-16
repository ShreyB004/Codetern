import { randomBytes } from 'node:crypto'

const ALPHABET = 'abcdefghijklmnopqrstuvwxyz0123456789'

function randChars(length) {
  const bytes = randomBytes(length)
  let out = ''
  for (let i = 0; i < length; i += 1) {
    out += ALPHABET[bytes[i] % ALPHABET.length]
  }
  return out
}

// Frontend-compatible ids: prefix-<base36 timestamp>-<5 random chars>
export function uid(prefix = 'id') {
  const time = Date.now().toString(36)
  return `${prefix}-${time}-${randChars(5)}`
}

// Referral codes mirror the frontend format: NAME-XXXX
export function referralCodeFor(name = '') {
  const base =
    name
      .trim()
      .replace(/[^a-zA-Z]/g, '')
      .slice(0, 4)
      .toUpperCase() || 'CDT'
  return `${base}-${randChars(4).toUpperCase()}`
}

// Short readable ids for certs/LORs: CDT-2026-1427 / LOR-2026-3917
export function certId(year = new Date().getFullYear()) {
  const num = 1000 + Math.floor(Math.random() * 8999)
  return `CDT-${year}-${num}`
}

export function lorId(year = new Date().getFullYear()) {
  const num = 2000 + Math.floor(Math.random() * 7999)
  return `LOR-${year}-${num}`
}

export const randomId = (length = 24) => randomBytes(length).toString('hex')