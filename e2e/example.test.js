describe(`pre-compilation`, () => {
  beforeAll(async () => {
    await page.goto(`http://localhost:8080/`)
  })

  test('rendering', async () => {
    await expect(page).toMatch('こんにちは、世界！')
    await expect(page).toMatch('hello, world!')
  })
})
