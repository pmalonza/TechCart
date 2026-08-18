import '@testing-library/jest-dom/vitest'

// jsdom's built-in localStorage getter can return undefined depending on the
// host Node version, so provide a minimal in-memory fallback for tests.
if (!window.localStorage) {
  const store = new Map()
  Object.defineProperty(window, 'localStorage', {
    configurable: true,
    value: {
      getItem: (key) => (store.has(key) ? store.get(key) : null),
      setItem: (key, value) => store.set(key, String(value)),
      removeItem: (key) => store.delete(key),
      clear: () => store.clear(),
    },
  })
}
