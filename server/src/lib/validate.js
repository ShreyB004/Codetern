import { z } from 'zod'
import { badRequest } from '../lib/errors.js'

const emailSchema = z.string().trim().toLowerCase().email()

export const signupSchema = z.object({
  name: z.string().trim().min(2, 'Name must be at least 2 characters.').max(80),
  email: emailSchema,
  password: z.string().min(8, 'Password must be at least 8 characters.').max(128),
  referralCode: z.string().trim().toUpperCase().optional().nullable(),
})

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Password is required.').max(128),
})

export const profileSchema = z.object({
  name: z.string().trim().min(2).max(80).optional(),
  email: emailSchema.optional(),
  linkedin: z.string().trim().max(200).nullable().optional(),
  github: z.string().trim().max(200).nullable().optional(),
  bio: z.string().trim().max(1000).nullable().optional(),
  mobile: z.string().trim().max(20).nullable().optional(),
  domain: z.string().trim().min(1).max(40).optional(),
})

// Strict: unknown keys are dropped, not silently accepted.
export function parse(schema, data) {
  const result = schema.safeParse(data)
  if (!result.success) {
    const first = result.error.issues[0]
    throw badRequest(first?.message || 'Invalid request body.', result.error.issues)
  }
  return result.data
}

export const idParamSchema = z.object({ id: z.string().min(1).max(120) })
export const durationParamSchema = z.object({ duration: z.coerce.number().int().min(1).max(6) })
export const taskIndexParamSchema = z.object({ index: z.coerce.number().int().min(0).max(100) })