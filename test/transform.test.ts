import { compile } from '@vue/compiler-dom'
import { createI18n } from 'vue-i18n'
import { defineTransformVT } from '../src/index'
import { getReportMessage, ReportCodes } from '../src/report'

function getMessage(code, ...args) {
  return `[vue-i18n-extensions] ${getReportMessage(code, ...args)}`
}

let spyWarn
beforeEach(() => {
  spyWarn = jest.spyOn(global.console, 'warn')
})

afterEach(() => {
  // jest.clearAllMocks()
  // jest.resetAllMocks()
  jest.restoreAllMocks()
})

test('string literal', () => {
  const i18n = createI18n({
    locale: 'ja',
    messages: {
      ja: { hello: 'こんにちは！' },
      en: { hello: 'hello!' }
    }
  })
  const transformVT = defineTransformVT(i18n)
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

test('object literal', () => {
  const i18n = createI18n({
    locale: 'en',
    messages: {
      en: { hello: 'hello, {name}!' },
      ja: { hello: 'こんにちは、{name}！' }
    }
  })
  const transformVT = defineTransformVT(i18n)
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

  const transformVT = defineTransformVT(i18n)
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

test('data binding', () => {
  spyWarn.mockImplementation(x => x)

  const i18n = createI18n({
    locale: 'ja',
    messages: {
      ja: { hello: 'こんにちは！' },
      en: { hello: 'hello!' }
    }
  })
  const transformVT = defineTransformVT(i18n)
  const source = `<div v-t="hello"/>`
  const { code, ast } = compile(source, {
    mode: 'function',
    hoistStatic: true,
    prefixIdentifiers: true,
    directiveTransforms: { t: transformVT }
  })
  expect(code).toMatchSnapshot(source)
  expect(ast).toMatchSnapshot(source)
  expect(spyWarn.mock.calls[0][0]).toEqual(
    getMessage(ReportCodes.NOT_SUPPORTED_BINDING_PRE_TRANSLATION, source)
  )
})

test('preserve modifier', () => {
  spyWarn.mockImplementation(x => x)

  const i18n = createI18n({
    locale: 'ja',
    messages: {
      ja: { hello: 'こんにちは！' },
      en: { hello: 'hello!' }
    }
  })
  const transformVT = defineTransformVT(i18n)
  const source = `<div v-t.preserve="'hello'"/>`
  const { code, ast } = compile(source, {
    mode: 'function',
    hoistStatic: true,
    prefixIdentifiers: true,
    directiveTransforms: { t: transformVT }
  })
  expect(code).toMatchSnapshot(source)
  expect(ast).toMatchSnapshot(source)
  expect(spyWarn.mock.calls[0][0]).toEqual(
    getMessage(ReportCodes.NOT_SUPPORTED_PRESERVE, source)
  )
})

test('no specify', () => {
  spyWarn.mockImplementation(x => x)

  const i18n = createI18n({
    locale: 'ja',
    messages: {}
  })
  const transformVT = defineTransformVT(i18n)
  const source = `<div v-t=""/>`
  const { code, ast } = compile(source, {
    mode: 'function',
    hoistStatic: true,
    prefixIdentifiers: true,
    directiveTransforms: { t: transformVT }
  })
  expect(code).toMatchSnapshot(source)
  expect(ast).toMatchSnapshot(source)
  expect(spyWarn.mock.calls[0][0]).toEqual(
    getMessage(ReportCodes.NOT_SUPPORTED_BINDING_PRE_TRANSLATION, source)
  )
})

test('JavaScript syntax', () => {
  const i18n = createI18n({
    locale: 'ja',
    messages: {}
  })
  const transformVT = defineTransformVT(i18n)
  const source = `<p v-t="while(true){alert('!');"></p>`
  expect(() => {
    compile(source, {
      mode: 'function',
      hoistStatic: true,
      prefixIdentifiers: true,
      directiveTransforms: { t: transformVT }
    })
  }).toThrow() // `Error parsing JavaScript expression: Unexpected token (1:1)`
})

test('invalid expression', () => {
  spyWarn.mockImplementation(x => x)

  const i18n = createI18n({
    locale: 'ja',
    messages: {}
  })
  const transformVT = defineTransformVT(i18n)
  const source = `<p v-t="[0]"></p>`
  const { code, ast } = compile(source, {
    mode: 'function',
    hoistStatic: true,
    prefixIdentifiers: true,
    directiveTransforms: { t: transformVT }
  })
  expect(code).toMatchSnapshot(source)
  expect(ast).toMatchSnapshot(source)
  expect(spyWarn.mock.calls[0][0]).toEqual(
    getMessage(ReportCodes.FAILED_VALUE_EVALUATION, source)
  )
})

test('have child elements', () => {
  const i18n = createI18n({
    locale: 'ja',
    messages: {
      ja: 'hello'
    }
  })
  const transformVT = defineTransformVT(i18n)
  const source = `<p v-t="'hello'"><span>foo</span></p>`
  expect(() => {
    compile(source, {
      mode: 'function',
      hoistStatic: true,
      prefixIdentifiers: true,
      directiveTransforms: { t: transformVT }
    })
  }).toThrowError(
    getReportMessage(ReportCodes.ORVERRIDE_ELEMENT_CHILDREN, source)
  )
})

test('missing translation', () => {
  spyWarn.mockImplementation(x => x)

  const i18n = createI18n({
    locale: 'ja',
    messages: {}
  })
  const transformVT = defineTransformVT(i18n)
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
    `[vue-i18n] Not found 'foo.bar' key in 'ja' locale messages.`
  )
})
