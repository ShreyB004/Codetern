import { useEffect, useState } from 'react'
import { subscribeList } from '../lib/rtdb.js'

export function useRtdbList(path) {
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  useEffect(() => {
    const off = subscribeList(path, (data) => {
      setRows(data)
      setLoading(false)
    })
    return off
  }, [path])
  return { rows, loading }
}
