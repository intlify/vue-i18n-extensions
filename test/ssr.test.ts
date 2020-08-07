import * as runtimeDom from '@vue/runtime-dom'
import { compile } from '@vue/compiler-ssr'
import { transformVTDirective } from '../src/index'
import { defineComponent, createSSRApp } from 'vue'
import { renderToString } from '@vue/server-renderer'
import { createI18n, useI18n } from 'vue-i18n'

test('v-t: composable', async () => {
  const i18n = createI18n({
    locale: 'ja',
    messages: {}
  })

  const transformVT = transformVTDirective({})
  const source = `<div v-t="{ path: 'dessert', locale: 'en', plural: 2, args: { name: 'banana' } }"/>`
  const { code } = compile(source, {
    mode: 'function',
    directiveTransforms: { t: transformVT }
  })
  const render = Function('require', 'Vue', code)(require, runtimeDom)
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
    legacy: true,
    locale: 'ja',
    messages: {}
  })

  const transformVT = transformVTDirective({ mode: 'legacy' })
  const source = `<div v-t="{ path: dessert, locale: 'en', plural: 2 }"/>`
  const { code } = compile(source, {
    mode: 'function',
    directiveTransforms: { t: transformVT }
  })
  const render = Function('require', 'Vue', code)(require, runtimeDom)
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
