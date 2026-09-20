import { useEffect, useRef, useState, type Dispatch, type SetStateAction } from 'react'
import { parseJSON, readJSON, writeJSON } from '../lib/storage'

/**
 * `useState` that is saved to localStorage and kept in sync across browser tabs.
 *
 * Stored data is untrusted (it can be stale, hand-edited or from an older
 * version), so `sanitize` must turn whatever was read into a valid value.
 */
export function usePersistentState<T>(
  key: string,
  fallback: T,
  sanitize: (raw: unknown) => T,
): [T, Dispatch<SetStateAction<T>>] {
  const [value, setValue] = useState<T>(() => sanitize(readJSON<unknown>(key, undefined)))
  const sanitizeRef = useRef(sanitize)
  sanitizeRef.current = sanitize

  useEffect(() => {
    writeJSON(key, value)
  }, [key, value])

  useEffect(() => {
    function handleStorage(event: StorageEvent) {
      if (event.key !== key) return
      const parsed = parseJSON(event.newValue)
      setValue(parsed === undefined ? fallback : sanitizeRef.current(parsed))
    }
    window.addEventListener('storage', handleStorage)
    return () => window.removeEventListener('storage', handleStorage)
  }, [key, fallback])

  return [value, setValue]
}
