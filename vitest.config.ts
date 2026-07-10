import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  test: {
    environment: 'node',
    exclude: ['**/node_modules/**', '**/tests/e2e/**'],
    globals: true,
    setupFiles: ['./tests/setup.ts'],
  },
})
