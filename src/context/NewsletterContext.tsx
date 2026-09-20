import { createContext, useCallback, useContext, useMemo, type ReactNode } from 'react'
import { usePersistentState } from '../hooks/usePersistentState'
import { validateEmail } from '../lib/auth'
import { sanitizeSubscribers, subscribe as addSubscriber, unsubscribe as removeSubscriber, type Subscriber } from '../lib/newsletter'
import { STORAGE_KEYS, writeJSON } from '../lib/storage'

export type SubscribeResult = { ok: true; alreadySubscribed: boolean } | { ok: false; error: string }
export type UnsubscribeResult = { ok: true; wasSubscribed: boolean } | { ok: false; error: string }

interface NewsletterContextValue {
  subscribers: Subscriber[]
  subscribe: (email: string) => SubscribeResult
  unsubscribe: (email: string) => UnsubscribeResult
}

const NewsletterContext = createContext<NewsletterContextValue | null>(null)
const NO_SUBSCRIBERS: Subscriber[] = []

const NOT_SAVED = 'Your browser could not save that. Please try again.'

/** Demo newsletter list: addresses are kept in this browser only and nothing is ever sent. */
export function NewsletterProvider({ children }: { children: ReactNode }) {
  const [subscribers, setSubscribers] = usePersistentState<Subscriber[]>(STORAGE_KEYS.newsletter, NO_SUBSCRIBERS, sanitizeSubscribers)

  const subscribe = useCallback<NewsletterContextValue['subscribe']>(
    (email) => {
      const problem = validateEmail(email)
      if (problem) return { ok: false, error: problem }
      const { list, status } = addSubscriber(subscribers, email, new Date())
      if (status === 'full') return { ok: false, error: 'The demo mailing list is full. Please try again later.' }
      if (status === 'added') {
        if (!writeJSON(STORAGE_KEYS.newsletter, list)) return { ok: false, error: NOT_SAVED }
        setSubscribers(list)
      }
      return { ok: true, alreadySubscribed: status === 'already-subscribed' }
    },
    [subscribers, setSubscribers],
  )

  const unsubscribe = useCallback<NewsletterContextValue['unsubscribe']>(
    (email) => {
      const problem = validateEmail(email)
      if (problem) return { ok: false, error: problem }
      const { list, removed } = removeSubscriber(subscribers, email)
      if (removed) {
        if (!writeJSON(STORAGE_KEYS.newsletter, list)) return { ok: false, error: NOT_SAVED }
        setSubscribers(list)
      }
      return { ok: true, wasSubscribed: removed }
    },
    [subscribers, setSubscribers],
  )

  const value = useMemo<NewsletterContextValue>(() => ({ subscribers, subscribe, unsubscribe }), [subscribers, subscribe, unsubscribe])
  return <NewsletterContext.Provider value={value}>{children}</NewsletterContext.Provider>
}

export function useNewsletter(): NewsletterContextValue {
  const context = useContext(NewsletterContext)
  if (!context) throw new Error('useNewsletter must be used inside <NewsletterProvider>')
  return context
}
