import * as runtimeDom from '@vue/runtime-dom'
import { compile, BindingTypes } from '@vue/compiler-dom'
import { defineComponent } from 'vue'
import { createI18n, useI18n } from 'vue-i18n'
import { transformVTDirective } from '../src/transform'
import { getReportMessage, ReportCodes } from '../src/report'
import { mount } from './helper'

afterEach(() => {
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

test('script setup', () => {
  const transformVT = transformVTDirective()
  const source = `<div v-t="'hello'"/>`
  const bindingMetadata = {
    t: BindingTypes.SETUP_CONST
  }
  const { code, ast } = compile(source, {
    mode: 'function',
    hoistStatic: false,
    prefixIdentifiers: true,
    bindingMetadata,
    directiveTransforms: { t: transformVT }
  })
  expect(code).toMatchSnapshot(source)
  expect(ast).toMatchSnapshot(source)
})

test('script setup inline', () => {
  const transformVT = transformVTDirective()
  const source = `<div v-t="'hello'"/>`
  const bindingMetadata = {
    t: BindingTypes.SETUP_CONST
  }
  const { code, ast } = compile(source, {
    mode: 'function',
    hoistStatic: false,
    prefixIdentifiers: true,
    bindingMetadata,
    inline: true,
    directiveTransforms: { t: transformVT }
  })
  expect(code).toMatchSnapshot(source)
  expect(ast).toMatchSnapshot(source)
})

test('translation signature resolver', () => {
  const signatureMap = new Map<string, string>()
  signatureMap.set('inline', 'i18n.t')
  const source = `<div v-t="'hello'"/>`
  const transformVT = transformVTDirective({
    translationSignatures: context => {
      const signature = context.inline ? signatureMap.get('inline') || '$t' : 't'
      return `_ctx.${signature}`
    }
  })
  const { code, ast } = compile(source, {
    mode: 'function',
    directiveTransforms: { t: transformVT }
  })
  expect(code).toMatchSnapshot(source)
  expect(ast).toMatchSnapshot(source)
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
