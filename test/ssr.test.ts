import { compile } from '@vue/compiler-dom'
import * as runtimeDom from '@vue/runtime-dom'
import { defineComponent, createSSRApp } from 'vue'
import { renderToString } from '@vue/server-renderer'
import { defineTransformVT } from '../src/index'
import { createI18n } from 'vue-i18n'

test('rendering', async () => {
  const i18n = createI18n({
    locale: 'ja',
    messages: {
      ja: { hello: 'こんにちは！' },
      en: { hello: 'hello!' }
    }
  })
  const transformVT = defineTransformVT(i18n)
  const source = `<div v-t="'hello'"/>`
  const { code } = compile(source, {
    mode: 'function',
    hoistStatic: true,
    prefixIdentifiers: true,
    directiveTransforms: { t: transformVT }
  })

  const render = new Function('Vue', code)(runtimeDom)
  const App = defineComponent({ render })
  const app = createSSRApp(App)

  expect(await renderToString(app)).toMatch(`<div>こんにちは！</div>`)
})
