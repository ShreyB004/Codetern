#!/usr/bin/env node
// run-all.mjs — programmatic test runner for server/test/*.test.mjs.
//
// Uses node:test's run() API (no extra dependencies) with the same TAP output
// you get from `node --test`, then aggregates pass/fail/skip counts and sets
// the process exit code (1 on any failure). Orchestrates every suite in this
// directory, so `npm test` == "run the full integration + hardening suites".
//
// Usage: npm test   (or)   node test/run-all.mjs
import { run } from 'node:test'
import { readdir } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const here = path.resolve(path.dirname(fileURLToPath(import.meta.url)))
const files = (await readdir(here))
  .filter((f) => f.endsWith('.test.mjs'))
  .map((f) => path.join(here, f))
  .sort()

if (files.length === 0) {
  console.error('[run-all] no test files found in server/test/')
  process.exit(1)
}

console.log(`[run-all] suites: ${files.map((f) => path.basename(f)).join(', ')}`)

// Sequential execution is intentional, not a perf fallback:
//   1. Every suite boots a server on PORT 4010 (some also hard-code it) —
//      parallel boots would collide on the port.
//   2. @fastify/rate-limit counters are per-IP in the shared Redis (db 0),
//      so concurrent suites starve each other's budgets (security.test.mjs
//      even exhausts /auth/login on purpose); one file at a time keeps each
//      suite inside its own windows.
const counts = { pass: 0, fail: 0, skip: 0, total: 0 }
const failures = []

const stream = run({
  files,
  concurrency: false, // see note above
  stdout: process.stdout, // stream the native TAP output
})

for await (const event of stream) {
  switch (event.type) {
    case 'test:pass':
      counts.pass += 1
      break
    case 'test:fail':
      counts.fail += 1
      failures.push(event.data?.name || event.data?.file || '<unnamed>')
      break
    case 'test:skip':
      counts.skip += 1
      break
    case 'test:start':
      counts.total += 1
      break
    default:
      break
  }
}

console.log('')
console.log(
  `[run-all] ${counts.total} tests — ${counts.pass} passed, ${counts.fail} failed, ${counts.skip} skipped`,
)
if (failures.length) {
  console.log('[run-all] failing tests:')
  for (const f of failures) console.log(`  - ${f}`)
  process.exitCode = 1
} else {
  process.exitCode = 0
}