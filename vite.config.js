import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    environmentOptions: {
      jsdom: { url: 'http://localhost' },
    },
    setupFiles: './src/test/setup.js',
    globals: true,
    pool: 'threads',
    // This sandboxed environment is consistently slow (crypto.subtle hashing
    // and multi-step flows can take several seconds), so the 5s default
    // times out legitimate tests rather than catching hangs.
    testTimeout: 20000,
  },
})
