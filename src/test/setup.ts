import '@testing-library/jest-dom/vitest'
import { webcrypto } from 'node:crypto'
import { cleanup, configure } from '@testing-library/react'
import { afterEach, beforeEach } from 'vitest'

// jsdom does not implement Web Crypto's `subtle`; Node's does.
Object.defineProperty(globalThis, 'crypto', { value: webcrypto, configurable: true })

// findBy* / waitFor default to 1s, which is too tight for async hashing under parallel load.
configure({ asyncUtilTimeout: 5000 })

// jsdom has no layout engine, so scrolling APIs are no-ops.
window.scrollTo = () => {}

beforeEach(() => {
  window.localStorage.clear()
})

afterEach(() => {
  cleanup()
})
