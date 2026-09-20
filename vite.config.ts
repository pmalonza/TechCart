import react from '@vitejs/plugin-react'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './src/test/setup.ts',
    css: false,
    pool: 'threads',
    // Multi-step sign-up flows (typing + async password hashing) can be slow when many test files run in parallel.
    testTimeout: 20_000,
  },
})
