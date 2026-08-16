import bcrypt from 'bcryptjs'

const ROUNDS = 10

export const hashPassword = (plain) => bcrypt.hash(plain, ROUNDS)

export const verifyPassword = (plain, hash) => {
  if (!plain || !hash) return false
  return bcrypt.compare(plain, hash)
}