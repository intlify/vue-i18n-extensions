import { compile } from '@vue/compiler-dom'
import { defineTransformVT } from '../src/index'
import { createI18n } from 'vue-i18n'

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
  const { code } = compile(source, {
    mode: 'function',
    hoistStatic: true,
    prefixIdentifiers: true,
    directiveTransforms: { t: transformVT }
  })
  expect(code).toMatchSnapshot(source)
})

test.todo('object literal')
test.todo('plural')
test.todo('none expression')
test.todo('invalid expression')
test.todo('preserve modifier')
test.todo('have child elements')
test.todo('missing translation')
