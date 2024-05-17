import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    pool: process.env.GITHUB_ACTIONS ? undefined : 'threads',
    include: ['./test/**/*.test.ts']
  }
})
