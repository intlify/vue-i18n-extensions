import { getText } from './helper'
import type { ServerContext } from './setup-server'
import { startServer } from './setup-server'

import type { Browser, Page } from 'playwright'

// TODO: extract to shim.d.ts
declare global {
  var browser: Browser
  var page: Page
}

let ctx: ServerContext
describe(`pre-compilation`, () => {
  beforeAll(async () => {
    ctx = await startServer()
    await global.page.goto(ctx.url('/'))
  })

  test('rendering', async () => {
    expect(await getText(global.page, '#directive-string')).toMatch('こんにちは、世界！')
    expect(await getText(global.page, '#directive-object')).toMatch('hello, world!')

    ctx.serverProcess.kill()
  })
})
