export function cn(...classes) {
  return classes.filter(Boolean).join(' ')
}

export function formatDate(iso) {
  if (!iso) return '—'
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return iso
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
}

export function formatNumber(n) {
  return Number(n || 0).toLocaleString('en-IN')
}

export function initials(name = '') {
  return name
    .split(' ')
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()
}

export function clamp(v, min, max) {
  return Math.max(min, Math.min(max, v))
}

/**
 * Theme-aware style for domain tinted chips (icon tiles / badges).
 * Light mode: ink glyph on the tinted wash (readable). Dark mode: bright
 * domain fg on the tinted wash (readable). Pass `isDark` from useTheme().
 */
export function domainChip(color, isDark) {
  return { background: color.bg, color: isDark ? color.fg : 'var(--color-ink)' }
}