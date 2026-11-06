import { defineConfig } from 'vite-plus'
import {
  defaultIgnoreFilesOfEnforceHeaderCommentRule,
  defineFmtConfig,
  defineLintConfig
} from '@kazupon/vp-config'

export default defineConfig({
  staged: {
    '*': 'vp check --fix'
  },
  pack: {
    entry: ['src/index.ts'],
    outDir: 'dist',
    format: ['esm', 'cjs'],
    fixedExtension: true,
    dts: true,
    clean: true
  },
  test: {
    // Vitest v4 compatibility: preserve mock call history.
    // https://viteplus.dev/guide/vitest-v5#remove-unneeded-compatibility-settings
    clearMocks: false,
    globals: true,
    environment: 'jsdom',
    pool: process.env.GITHUB_ACTIONS ? undefined : 'threads',
    include: ['./test/**/*.test.ts']
  },
  lint: defineLintConfig({
    ignorePatterns: [
      'coverage',
      'dist/**',
      'docs/**',
      'example/**',
      'lib/**',
      'temp/**',
      'CHANGELOG.md',
      'pnpm-lock.yaml',
      'tsconfig.json',
      'tsconfig.base.json'
    ],
    comments: {
      enForceHeaderComment: {
        ignoreFiles: [...defaultIgnoreFilesOfEnforceHeaderCommentRule, 'scripts/**', 'e2e/**']
      }
    },
    jsdoc: {
      typescript: 'syntax'
    },
    regexp: {},
    vitest: {},
    overrides: [
      {
        // tests and scripts do not need JSDoc
        files: ['test/**', 'e2e/**', 'scripts/**'],
        rules: { 'ox-jsdoc/require-jsdoc': 'off' }
      }
    ]
  }),
  fmt: defineFmtConfig({
    printWidth: 100,
    ignorePatterns: [
      'CHANGELOG.md',
      'coverage',
      'dist',
      'docs/@intlify/vue-i18n-extensions-api.md',
      'lib',
      'pnpm-lock.yaml',
      'tsconfig.json',
      'tsconfig.base.json'
    ]
  })
})
