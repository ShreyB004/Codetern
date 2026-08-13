import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { load, save } from '../lib/store.js'

const ThemeCtx = createContext(null)

function preferredTheme() {
  try {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  } catch {
    return 'light'
  }
}

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => load('theme:v1', null) || preferredTheme())

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark')
    save('theme:v1', theme)
  }, [theme])

  const toggle = useCallback(() => setTheme((t) => (t === 'dark' ? 'light' : 'dark')), [])
  const set = useCallback((t) => setTheme(t), [])

  const value = useMemo(() => ({ theme, toggle, set, isDark: theme === 'dark' }), [theme, toggle, set])
  return <ThemeCtx.Provider value={value}>{children}</ThemeCtx.Provider>
}

export function useTheme() {
  const ctx = useContext(ThemeCtx)
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider')
  return ctx
}
