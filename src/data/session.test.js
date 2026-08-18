import { beforeEach, describe, expect, it } from 'vitest'
import { loadSession, saveSession } from './session'

beforeEach(() => {
  window.localStorage.clear()
})

describe('loadSession / saveSession', () => {
  it('returns null when nothing is stored', () => {
    expect(loadSession()).toBeNull()
  })

  it('round-trips a session through localStorage', () => {
    saveSession({ name: 'Ada', email: 'ada@example.com' })
    expect(loadSession()).toEqual({ name: 'Ada', email: 'ada@example.com' })
  })

  it('clears the session when saved with null', () => {
    saveSession({ name: 'Ada', email: 'ada@example.com' })
    saveSession(null)
    expect(loadSession()).toBeNull()
  })
})
