import { getText } from './helper'
import { ServerContext, startServer } from './setup-server'

let ctx: ServerContext
describe(`pre-compilation`, () => {
  beforeAll(async () => {
    ctx = await startServer()
    await page.goto(ctx.url('/'))
  })

  test('rendering', async () => {
    expect(await getText(page, '#directive-string')).toMatch(
      'こんにちは、世界！'
    )
    await expect(await getText(page, '#directive-object')).toMatch(
      'hello, world!'
    )

    await ctx.serverProcess.kill()
  })
})
