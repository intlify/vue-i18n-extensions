const VueI18n = require('vue-i18n')
const { createLocalVue } = require('@vue/test-utils')
const { compile } = require('vue-template-compiler')
const I18nModule = require('../src/index').module

const Vue = createLocalVue()
Vue.use(VueI18n)

const options = {
  locale: 'en',
  messages: {
    en: {
      hello: 'hello',
      named: 'hi {name}!'
    },
    ja: {
      hello: 'こんにちは',
      named: 'やあ、{name}！'
    }
  }
}

const i18n = new VueI18n(options)
const i18nModule = I18nModule(i18n)

it('transform with static string literal', () => {
  const { ast, render, errors } = compile(`<p v-t="'hello'"></p>`, { modules: [i18nModule] })
  expect(ast.i18n).toEqual('hello')
  expect(render).toEqual(`with(this){return _c('p',{domProps:{"textContent":_s("hello")}})}`)
  expect(errors).toEqual([])
})

it('transform with static object literal', () => {
  const { ast, render, errors } = compile(`<p v-t="{ path: 'named', locale: 'ja', args: { name: 'kazupon' } }"></p>`, { modules: [i18nModule] })
  expect(ast.i18n).toEqual('やあ、kazupon！')
  expect(render).toEqual(`with(this){return _c('p',{domProps:{"textContent":_s("やあ、kazupon！")}})}`)
  expect(errors).toEqual([])
})

it('not transform with dynamic params', () => {
  const spy = jest.spyOn(global.console, 'warn')
  spy.mockImplementation(x => x)
  const { ast, render, errors } = compile(`<p v-t="hello"></p>`, { modules: [i18nModule] })
  expect(ast.i18n).toBeFalsy()
  expect(render).toEqual(`with(this){return _c('p',{directives:[{name:"t",rawName:"v-t",value:(hello),expression:"hello"}]})}`)
  expect(errors).toEqual([])
  expect(spy.mock.calls[0][0]).toEqual('[vue-i18n-extensions] pre-localization with v-t support only static params')
  spy.mockReset()
  spy.mockRestore()
})

it('not support value warning', () => {
  const spy = jest.spyOn(global.console, 'warn')
  spy.mockImplementation(x => x)
  const { ast, render, errors } = compile(`<p v-t="[1]"></p>`, { modules: [i18nModule] })
  expect(ast.i18n).toBeFalsy()
  expect(render).toEqual(`with(this){return _c('p',{directives:[{name:"t",rawName:"v-t",value:([1]),expression:"[1]"}]})}`)
  expect(errors).toEqual([])
  expect(spy.mock.calls[0][0]).toEqual('[vue-i18n-extensions] not support value type')
  spy.mockReset()
  spy.mockRestore()
})

it('detect missing translation', done => {
  i18n.missing = (locale, key, vm) => {
    expect(locale).toEqual('en')
    expect(key).toEqual('foo.bar')
    expect(vm).toBeNull()
    done()
  }
  const { ast, render, errors } = compile(`<p v-t="'foo.bar'"></p>`, { modules: [i18nModule] })
  expect(ast.i18n).toEqual('foo.bar')
  expect(render).toEqual(`with(this){return _c(\'p\',{domProps:{"textContent":_s("foo.bar")}})}`)
  expect(errors).toEqual([])
})

it('fallback custom directive', () => {
  const { ast, render, errors } = compile(`<p v-t="'foo.bar'"></p>`)
  expect(ast.i18n).toBeFalsy()
  expect(ast.directives[0]).toEqual({ name: 't', rawName: 'v-t', value: '\'foo.bar\'', arg: null, modifiers: undefined })
  expect(errors).toEqual([])
})