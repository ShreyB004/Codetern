// Tiny convenience hook for async API calls from components: tracks a
// pending flag and maps ApiError messages to a plain error string.

import { useCallback, useState } from 'react'

export function useApiCall() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const run = useCallback(async (fn) => {
    setLoading(true)
    setError(null)
    try {
      return await fn()
    } catch (err) {
      setError(err?.message || 'Something went wrong. Please try again.')
      return null
    } finally {
      setLoading(false)
    }
  }, [])

  return { run, loading, error }
}