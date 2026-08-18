import bcrypt from 'bcryptjs'

const ROUNDS = 10

export const hashPassword = (plain) => bcrypt.hash(plain, ROUNDS)

export const verifyPassword = (plain, hash) => {
  if (!plain || !hash) return false
  return bcrypt.compare(plain, hash)
}

// Timing equalizer: unknown emails run a real bcrypt compare against a
// dummy hash so "bad email" and "bad password" cannot be told apart by
// response time. Hash is computed once per process, lazily.
let dummyHash = null
export const verifyPasswordDummy = async (plain) => {
  if (!dummyHash) dummyHash = await bcrypt.hash('codetern-timing-equalizer', ROUNDS)
  return bcrypt.compare(plain, dummyHash)
}