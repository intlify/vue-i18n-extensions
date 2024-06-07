import * as runtimeDom from '@vue/runtime-dom'
import { BindingTypes, DirectiveTransform } from '@vue/compiler-dom'
import { compile } from '@vue/compiler-ssr'
import { transformVTDirective } from '../src/transform'
import { defineComponent, createSSRApp } from 'vue'
import { renderToString } from '@vue/server-renderer'
import { createI18n, useI18n } from 'vue-i18n'

test('v-t: composition', async () => {
  const i18n = createI18n({
    legacy: false,
    locale: 'ja',
    messages: {}
  })

  const transformVT = transformVTDirective({})
  const source = `<div v-t="{ path: 'dessert', locale: 'en', plural: 2, args: { name: 'banana' } }"/>`
  const { code } = compile(source, {
    mode: 'function',
    directiveTransforms: { t: transformVT }
  })
  // prettier-ignore
  // eslint-disable-next-line @typescript-eslint/no-implied-eval, @typescript-eslint/ban-types
  const render = Function('require', 'Vue', code)(require, runtimeDom) as Function
  const App = defineComponent({
    setup() {
      return useI18n({
        locale: 'en',
        inheritLocale: false,
        messages: {
          en: {
            apple: 'no apples | one apple | {count} apples',
            banana: 'no bananas | {n} banana | {n} bananas',
            dessert: 'I eat @:{name}!'
          }
        }
      })
    },
    ssrRender: render
  })
  const app = createSSRApp(App)
  app.use(i18n)
  expect(await renderToString(app)).toMatch(`<div>I eat 2 bananas!</div>`)
})

test('v-t: legacy', async () => {
  const i18n = createI18n({
    locale: 'ja',
    messages: {}
  })

  const transformVT = transformVTDirective({ mode: 'legacy' })
  const source = `<div v-t="{ path: dessert, locale: 'en', plural: 2 }"/>`
  const { code } = compile(source, {
    mode: 'function',
    directiveTransforms: { t: transformVT }
  })
  // prettier-ignore
  // eslint-disable-next-line @typescript-eslint/no-implied-eval, @typescript-eslint/ban-types
  const render = Function('require', 'Vue', code)(require, runtimeDom) as Function
  const App = defineComponent({
    data: () => ({ dessert: 'banana' }),
    i18n: {
      locale: 'en',
      messages: {
        en: {
          apple: 'no apples | one apple | {count} apples',
          banana: 'no bananas | {n} banana | {n} bananas'
        }
      }
    },
    ssrRender: render
  })
  const app = createSSRApp(App)
  app.use(i18n)
  expect(await renderToString(app)).toMatch(`<div>2 bananas</div>`)
})

test('script setup', async () => {
  const i18n = createI18n({
    legacy: false,
    locale: 'ja',
    messages: {}
  })

  const transformVT = transformVTDirective({})
  const source = `<div v-t="{ path: 'dessert', locale: 'en', plural: 2, args: { name: 'banana' } }"/>`
  const { code } = compile(source, {
    mode: 'function',
    bindingMetadata: {
      t: BindingTypes.SETUP_CONST
    },
    directiveTransforms: { t: transformVT }
  })
  // prettier-ignore
  // eslint-disable-next-line @typescript-eslint/no-implied-eval, @typescript-eslint/ban-types
  const render = Function('require', 'Vue', code)(require, runtimeDom) as Function
  const App = defineComponent({
    setup() {
      const { t } = useI18n({
        locale: 'en',
        inheritLocale: false,
        messages: {
          en: {
            apple: 'no apples | one apple | {count} apples',
            banana: 'no bananas | {n} banana | {n} bananas',
            dessert: 'I eat @:{name}!'
          }
        }
      })
      // @ts-ignore -- script setup mocking
      return { __isScriptSetup: true, t }
    },
    ssrRender: render
  })
  const app = createSSRApp(App)
  app.use(i18n)
  expect(await renderToString(app)).toMatch(`<div>I eat 2 bananas!</div>`)
})

test('differenct translation signatures', async () => {
  const i18n = createI18n({
    legacy: false,
    locale: 'en',
    messages: {
      en: {
        hello: 'hello global!'
      }
    }
  })

  const transformVT = transformVTDirective({
    translationSignatures: ['t1', 't2']
  })

  const compileWithCustomDirective = (source: string, direcive: DirectiveTransform) => {
    const { code } = compile(source, {
      mode: 'function',
      bindingMetadata: {
        t1: BindingTypes.SETUP_CONST,
        t2: BindingTypes.SETUP_CONST,
        foo: BindingTypes.SETUP_CONST
      },
      directiveTransforms: { t: direcive }
    })
    // eslint-disable-next-line @typescript-eslint/no-implied-eval, @typescript-eslint/ban-types
    return Function('require', 'Vue', code)(require, runtimeDom) as Function
  }

  const Comp1 = defineComponent({
    setup() {
      const { t: t1 } = useI18n({
        inheritLocale: true,
        messages: {
          en: {
            hello: 'hello local 1!'
          }
        }
      })
      // @ts-ignore -- script setup mocking
      return { t1, foo: 1, __isScriptSetup: true }
    },
    ssrRender: compileWithCustomDirective(
      `<div v-t="{ path: 'hello', args: { foo } }"/>`,
      transformVT
    )
  })

  const Comp2 = defineComponent({
    setup() {
      const { t: t2 } = useI18n({
        inheritLocale: true,
        messages: {
          en: {
            hello: 'hello local 2!'
          }
        }
      })
      return { t2 }
    },
    ssrRender: compileWithCustomDirective(`<div v-t="{ path: 'hello' }"/>`, transformVT)
  })

  const App = defineComponent({
    components: { Comp1, Comp2 },
    ssrRender: compileWithCustomDirective(
      `
<div v-t="{ path: 'hello' }"/>
<Comp1 />
<Comp2 />`,
      transformVT
    )
  })

  const app = createSSRApp(App)
  app.use(i18n)
  expect(await renderToString(app)).include(
    `<div>hello global!</div><div>hello local 1!</div><div>hello local 2!</div`
  )
})
