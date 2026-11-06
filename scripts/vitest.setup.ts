import { afterAll, beforeAll } from 'vite-plus/test'
import playwright from 'playwright'

import type { Browser, Page, LaunchOptions } from 'playwright'

// TODO: extract to shim.d.ts
declare global {
  var browser: Browser
  var page: Page
}

type BrowserType = 'chromium' | 'firefox' | 'webkit'

beforeAll(async () => {
  const type: BrowserType = (process.env.E2E_BROWSER || 'chromium') as BrowserType
  const launchOptions: LaunchOptions = { headless: true }
  if (!process.env.CI && !process.env.E2E_BROWSER) {
    launchOptions.channel = 'chrome'
  }

  global.browser = await playwright[type].launch(launchOptions)
  global.page = await global.browser.newPage()
})

afterAll(async () => {
  await global.page?.close()
  await global.browser?.close()
})
