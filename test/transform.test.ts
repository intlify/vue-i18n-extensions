import * as runtimeDom from '@vue/runtime-dom'
import { compile } from '@vue/compiler-dom'
import { defineComponent } from 'vue'
import { createI18n, useI18n } from 'vue-i18n'
import { transformVTDirective } from '../src/transform'
import { getReportMessage, ReportCodes } from '../src/report'
import { mount } from './helper'

function getMessage(code: ReportCodes, ...args: unknown[]) {
  return `[vue-i18n-extensions] ${getReportMessage(code, ...args)}`
}

let spyWarn: ReturnType<typeof vi.spyOn>
beforeEach(() => {
  spyWarn = vi.spyOn(global.console, 'warn') as ReturnType<typeof vi.spyOn>
})

afterEach(() => {
  // vi.clearAllMocks()
  // vi.resetAllMocks()
  vi.restoreAllMocks()
})

describe('literal', () => {
  test('path', () => {
    const transformVT = transformVTDirective()
    const source = `<div v-t="'hello'"/>`
    const { code, ast } = compile(source, {
      mode: 'function',
      hoistStatic: false,
      prefixIdentifiers: true,
      directiveTransforms: { t: transformVT }
    })
    expect(code).toMatchSnapshot(source)
    expect(ast).toMatchSnapshot(source)
  })

  test('object: path, locale, args, plural', () => {
    const transformVT = transformVTDirective()
    const source = `<div v-t="{ path: 'dessert', locale: 'en', plural: 2, args: { name: 'banana' } }"/>`
    const { code, ast } = compile(source, {
      mode: 'function',
      hoistStatic: false,
      prefixIdentifiers: true,
      directiveTransforms: { t: transformVT }
    })
    expect(code).toMatchSnapshot(source)
    expect(ast).toMatchSnapshot(source)
  })
})

describe('binding', () => {
  test('simple variable', () => {
    const transformVT = transformVTDirective()
    const source = `<div v-t="hello"/>`
    const { code, ast } = compile(source, {
      mode: 'function',
      hoistStatic: false,
      prefixIdentifiers: true,
      directiveTransforms: { t: transformVT }
    })
    expect(code).toMatchSnapshot(source)
    expect(ast).toMatchSnapshot(source)
  })

  test('object', () => {
    const transformVT = transformVTDirective()
    const source = `<div v-t="{ path: foo.bar.buz, locale, plural: 2, args: { name: 'banana' } }"/>`
    const { code, ast } = compile(source, {
      mode: 'function',
      hoistStatic: false,
      prefixIdentifiers: true,
      directiveTransforms: { t: transformVT }
    })
    expect(code).toMatchSnapshot(source)
    expect(ast).toMatchSnapshot(source)
  })
})

test('preserve modifier', () => {
  spyWarn.mockImplementation(() => {})

  const transformVT = transformVTDirective()
  const source = `<div v-t.preserve="'hello'"/>`
  const { code, ast } = compile(source, {
    mode: 'function',
    hoistStatic: false,
    prefixIdentifiers: true,
    directiveTransforms: { t: transformVT }
  })
  expect(code).toMatchSnapshot(source)
  expect(ast).toMatchSnapshot(source)
  expect(spyWarn.mock.calls[0][0]).toEqual(getMessage(ReportCodes.NOT_SUPPORTED_PRESERVE, source))
})

test('no specify', () => {
  const transformVT = transformVTDirective()
  const source = `<div v-t=""/>`
  const { code, ast } = compile(source, {
    mode: 'function',
    hoistStatic: false,
    prefixIdentifiers: true,
    directiveTransforms: { t: transformVT }
  })
  expect(code).toMatchSnapshot(source)
  expect(ast).toMatchSnapshot(source)
})

test('JavaScript syntax', () => {
  const transformVT = transformVTDirective()
  const source = `<p v-t="while(true){alert('!');"></p>`
  expect(() => {
    compile(source, {
      mode: 'function',
      hoistStatic: false,
      prefixIdentifiers: true,
      directiveTransforms: { t: transformVT }
    })
  }).toThrow() // `Error parsing JavaScript expression: Unexpected token (1:1)`
})

test('invalid expression', () => {
  const transformVT = transformVTDirective()
  const source = `<p v-t="[0]"></p>`
  const { code, ast } = compile(source, {
    mode: 'function',
    hoistStatic: false,
    prefixIdentifiers: true,
    directiveTransforms: { t: transformVT }
  })
  expect(code).toMatchSnapshot(source)
  expect(ast).toMatchSnapshot(source)
})

test('have child elements', () => {
  const transformVT = transformVTDirective()
  const source = `<p v-t="'hello'"><span>foo</span></p>`
  expect(() => {
    compile(source, {
      mode: 'function',
      hoistStatic: false,
      prefixIdentifiers: true,
      directiveTransforms: { t: transformVT }
    })
  }).toThrowError(getReportMessage(ReportCodes.OVERRIDE_ELEMENT_CHILDREN, source))
})

describe('legacy', () => {
  test('path', () => {
    const transformVT = transformVTDirective({ mode: 'legacy' })
    const source = `<div v-t="'hello'"/>`
    const { code, ast } = compile(source, {
      mode: 'function',
      hoistStatic: false,
      prefixIdentifiers: true,
      directiveTransforms: { t: transformVT }
    })
    expect(code).toMatchSnapshot(source)
    expect(ast).toMatchSnapshot(source)
  })

  test('path, plural', () => {
    const transformVT = transformVTDirective({ mode: 'legacy' })
    const source = `<div v-t="{ path: 'dessert', choice: 2 }"/>`
    const { code, ast } = compile(source, {
      mode: 'function',
      hoistStatic: false,
      prefixIdentifiers: true,
      directiveTransforms: { t: transformVT }
    })
    expect(code).toMatchSnapshot(source)
    expect(ast).toMatchSnapshot(source)
  })

  test('path, plural, locale', () => {
    const transformVT = transformVTDirective({ mode: 'legacy' })
    const source = `<div v-t="{ path: 'dessert', locale: 'en', choice: 2 }"/>`
    const { code, ast } = compile(source, {
      mode: 'function',
      hoistStatic: false,
      prefixIdentifiers: true,
      directiveTransforms: { t: transformVT }
    })
    expect(code).toMatchSnapshot(source)
    expect(ast).toMatchSnapshot(source)
  })

  test('path, plural, named', () => {
    const transformVT = transformVTDirective({ mode: 'legacy' })
    const source = `<div v-t="{ path: 'dessert', choice: 2, args: { name: 'kazupon' } }"/>`
    const { code, ast } = compile(source, {
      mode: 'function',
      hoistStatic: false,
      prefixIdentifiers: true,
      directiveTransforms: { t: transformVT }
    })
    expect(code).toMatchSnapshot(source)
    expect(ast).toMatchSnapshot(source)
  })

  test('path, locale, named', () => {
    const transformVT = transformVTDirective({ mode: 'legacy' })
    const source = `<div v-t="{ path: 'dessert', locale: 'ja', args: { name: 'kazupon' } }"/>`
    const { code, ast } = compile(source, {
      mode: 'function',
      hoistStatic: false,
      prefixIdentifiers: true,
      directiveTransforms: { t: transformVT }
    })
    expect(code).toMatchSnapshot(source)
    expect(ast).toMatchSnapshot(source)
  })
})

test('hoistStatic option: on', () => {
  const transformVT = transformVTDirective()
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

test('prefixIdentifiers option: off', () => {
  const transformVT = transformVTDirective()
  const source = `<div v-t="'hello'"/>`
  const { code, ast } = compile(source, {
    mode: 'function',
    hoistStatic: true,
    prefixIdentifiers: false,
    directiveTransforms: { t: transformVT }
  })
  expect(code).toMatchSnapshot(source)
  expect(ast).toMatchSnapshot(source)
})

test('render in app', async () => {
  const i18n = createI18n({ legacy: false })

  const transformVT = transformVTDirective()
  const source = `<div v-t="{ path: 'dessert', locale: 'en', plural: 2, args: { name: 'banana' } }"/>`
  const { code } = compile(source, {
    mode: 'function',
    prefixIdentifiers: true,
    directiveTransforms: { t: transformVT }
  })
  // eslint-disable-next-line @typescript-eslint/no-implied-eval, @typescript-eslint/ban-types
  const render = new Function('Vue', code)(runtimeDom) as Function
  const App = defineComponent({
    render,
    setup() {
      return useI18n({
        locale: 'ja',
        messages: {
          en: {
            apple: 'no apples | one apple | {count} apples',
            banana: 'no bananas | {n} banana | {n} bananas',
            dessert: 'I eat @:{name}!'
          }
        }
      })
    }
  })
  const wrapper = await mount(App, i18n)
  expect(wrapper.html()).toEqual(`<div>I eat 2 bananas!</div>`)
})
