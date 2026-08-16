// Internship pricing (2026) — universal per-batch fee (mirrors src/data/plans.js)
export const DURATION_PRICES = {
  1: { original: 249, price: 149 },
  2: { original: 449, price: 299 },
  3: { original: 649, price: 429 },
  6: { original: 1299, price: 799 },
}

export function batchPrice(months) {
  const d = DURATION_PRICES[months] ?? { original: 249, price: 149 }
  const total = d.price
  const original = d.original
  return { total, original, perMonth: Math.round(total / months), saved: original - total, discount: 1 - total / original }
}

export async function getPricing() {
  return DURATION_PRICES
}