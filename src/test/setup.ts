import '@testing-library/jest-dom/vitest'
import { webcrypto } from 'node:crypto'
import { cleanup } from '@testing-library/react'
import { afterEach, beforeEach } from 'vitest'

// jsdom does not implement Web Crypto's `subtle`; Node's does.
Object.defineProperty(globalThis, 'crypto', { value: webcrypto, configurable: true })

// jsdom has no layout engine, so scrolling APIs are no-ops.
window.scrollTo = () => {}

beforeEach(() => {
  window.localStorage.clear()
})

afterEach(() => {
  cleanup()
})
