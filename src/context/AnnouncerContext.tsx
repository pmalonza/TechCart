import { createContext, useCallback, useContext, useRef, useState, type ReactNode } from 'react'

type Announce = (message: string) => void

const AnnouncerContext = createContext<Announce>(() => {})

/**
 * One shared, visually hidden polite live region. Components call `useAnnounce()`
 * to tell screen-reader users about changes that have no visible focus target
 * (e.g. "Item added to cart"). A single region is used because live regions
 * inside buttons are not exposed to assistive tech, and one per card would be noise.
 */
export function AnnouncerProvider({ children }: { children: ReactNode }) {
  const [message, setMessage] = useState('')
  const toggle = useRef(false)

  const announce = useCallback<Announce>((text) => {
    // Alternate a trailing zero-width space so an identical message is announced again.
    toggle.current = !toggle.current
    setMessage(toggle.current ? text : `${text}​`)
  }, [])

  return (
    <AnnouncerContext.Provider value={announce}>
      {children}
      <div className="visually-hidden" aria-live="polite" aria-atomic="true" data-testid="announcer">
        {message}
      </div>
    </AnnouncerContext.Provider>
  )
}

export function useAnnounce(): Announce {
  return useContext(AnnouncerContext)
}
