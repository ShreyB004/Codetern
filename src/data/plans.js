// Internship pricing (2026) — universal per-batch fee.
// One flat price per batch length, regardless of domain. The highlighted price
// is a fixed fee for the whole batch (1, 2, 3 or 6 months) — not a per-month
// subscription. Strikethrough "original" is a healthy-launch marker only.
// Benchmarked against Indian student programmes (Internshala ₹1,250–₹4,500).

export const DURATIONS = [1, 2, 3, 6]

// batch length → { original (strikethrough), price (fixed, whole batch) }
export const DURATION_PRICES = {
  1: { original: 249, price: 149 },
  2: { original: 449, price: 299 },
  3: { original: 649, price: 429 },
  6: { original: 1299, price: 799 },
}

// fallback for any odd duration that slips through
export function batchPrice(months) {
  const d = DURATION_PRICES[months] ?? { original: 249, price: 149 }
  const total = d.price
  const original = d.original
  return { total, original, perMonth: Math.round(total / months), saved: original - total, discount: 1 - total / original }
}

// every batch ships with the same core experience; the domain decides the work
export const INCLUDED = [
  'All live project tasks + resources',
  'Sprint grader reviews code, not attendance',
  'Final assessment & AI-scored interview',
  'Employer-verifiable certificate',
  'Letter of recommendation (LOR)',
  'Refer & earn ₹50 per friend',
]