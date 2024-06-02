import * as runtimeDom from '@vue/runtime-dom'
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
