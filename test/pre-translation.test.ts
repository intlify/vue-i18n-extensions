import { compile } from '@vue/compiler-dom'
import { createI18n } from 'vue-i18n'
import { transformVTDirective } from '../src/transform'

let spyWarn: any // eslint-disable-line @typescript-eslint/no-explicit-any
beforeEach(() => {
  spyWarn = vi.spyOn(global.console, 'warn')
})

afterEach(() => {
  // vi.clearAllMocks()
  // vi.resetAllMocks()
  vi.restoreAllMocks()
})

test('basic', () => {
  const i18n = createI18n({
    locale: 'ja',
    messages: {
      ja: { hello: 'こんにちは！' },
      en: { hello: 'hello!' }
    }
  })
  const transformVT = transformVTDirective({ i18n })
  const source = `<div v-t="'hello'"/>`
  const { code, ast } = compile(source, {
    mode: 'function',
    hoistStatic: true,
    prefixIdentifiers: true,
    directiveTransforms: { t: transformVT }
  })
  expect(code).toMatchSnapshot(source)
  expect(ast).toMatchSnapshot(source)
})

test('named', () => {
  const i18n = createI18n({
    locale: 'en',
    messages: {
      en: { hello: 'hello, {name}!' },
      ja: { hello: 'こんにちは、{name}！' }
    }
  })
  const transformVT = transformVTDirective({ i18n })
  const source = `<div v-t="{ path: 'hello', locale: 'ja', args: { name: 'kazupon' } }"/>`
  const { code, ast } = compile(source, {
    mode: 'function',
    hoistStatic: true,
    prefixIdentifiers: true,
    directiveTransforms: { t: transformVT }
  })
  expect(code).toMatchSnapshot(source)
  expect(ast).toMatchSnapshot(source)
})

test('plural', () => {
  const i18n = createI18n({
    locale: 'en',
    messages: {
      en: {
        banana: 'no bananas | {n} banana | {n} bananas'
      }
    }
  })

  const transformVT = transformVTDirective({ i18n })
  const source = `<div v-t="{ path: 'banana', choice: 2 }"/>`
  const { code, ast } = compile(source, {
    mode: 'function',
    hoistStatic: true,
    prefixIdentifiers: true,
    directiveTransforms: { t: transformVT }
  })
  expect(code).toMatchSnapshot(source)
  expect(ast).toMatchSnapshot(source)
})

test('missing translation', () => {
  spyWarn.mockImplementation(() => {}) // eslint-disable-line @typescript-eslint/no-empty-function

  const i18n = createI18n({
    legacy: false,
    locale: 'ja',
    messages: {
      ja: {}
    }
  })
  const transformVT = transformVTDirective({ i18n })
  const source = `<div v-t="'foo.bar'"/>`
  const { code, ast } = compile(source, {
    mode: 'function',
    hoistStatic: true,
    prefixIdentifiers: true,
    directiveTransforms: { t: transformVT }
  })
  expect(code).toMatchSnapshot(source)
  expect(ast).toMatchSnapshot(source)
  expect(spyWarn.mock.calls[0][0]).toEqual(
    `[intlify] Not found 'foo.bar' key in 'ja' locale messages.`
  )
})
