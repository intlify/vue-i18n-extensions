import type { Browser, Page } from 'playwright'

declare global {
  namespace globalThis {
    let browser: Browser
    let page: Page
  }

  namespace NodeJS {
    interface ProcessEnv {
      E2E_BROWSER?: 'chromium' | 'firefox' | 'webkit'
      CI?: string
      GITHUB_ACTIONS?: string
    }
  }
}

export {}
