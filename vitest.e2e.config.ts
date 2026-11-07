import config from './vite.config'

import type { UserConfig } from 'vite-plus'

export default {
  ...config,
  test: {
    ...config.test,
    environment: 'node',
    setupFiles: ['./scripts/vitest.setup.ts'],
    include: ['./e2e/**/*.spec.ts'],
    maxWorkers: 1
  }
} satisfies UserConfig
