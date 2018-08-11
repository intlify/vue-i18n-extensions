/*
import test from 'ava'
import sinon from 'sinon'
import Vue from 'vue'
import VueI18n from 'vue-i18n'
import { compile } from 'vue-template-compiler'
import { module } from '../src/index'

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
const i18nModule = module(i18n)

test('transform with static string literal', t => {
  const { ast, render, errors } = compile(`<p v-t="'hello'"></p>`, { modules: [i18nModule] })
  t.is(ast.i18n, 'hello')
  t.is(render, `with(this){return _c('p',{domProps:{"textContent":_s("hello")}})}`)
  t.deepEqual(errors, [])
})

test('transform with static object literal', t => {
  const { ast, render, errors } = compile(`<p v-t="{ path: 'named', locale: 'ja', args: { name: 'kazupon' } }"></p>`, { modules: [i18nModule] })
  t.is(ast.i18n, 'やあ、kazupon！')
  t.is(render, `with(this){return _c('p',{domProps:{"textContent":_s("やあ、kazupon！")}})}`)
  t.deepEqual(errors, [])
})

test('not transform with dynamic params', t => {
  const spy = sinon.spy(console, 'warn')
  const { ast, render, errors } = compile(`<p v-t="hello"></p>`, { modules: [i18nModule] })
  t.falsy(ast.i18n)
  t.is(render, `with(this){return _c('p',{directives:[{name:"t",rawName:"v-t",value:(hello),expression:"hello"}]})}`)
  t.deepEqual(errors, [])
  t.truthy(spy.withArgs('[vue-i18n-extensions] pre-localization with v-t support only static params').calledOnce)
  spy.restore()
})

test('not support value warning', t => {
  const spy = sinon.spy(console, 'warn')
  const { ast, render, errors } = compile(`<p v-t="[1]"></p>`, { modules: [i18nModule] })
  t.falsy(ast.i18n)
  t.is(render, `with(this){return _c('p',{directives:[{name:"t",rawName:"v-t",value:([1]),expression:"[1]"}]})}`)
  t.deepEqual(errors, [])
  t.truthy(spy.withArgs('[vue-i18n-extensions] not support value type').calledOnce)
  spy.restore()
})

test('detect missing translation', t => {
  i18n.missing = (locale, key, vm) => {
    t.is(locale, 'en')
    t.is(key, 'foo.bar')
    t.is(vm, null)
  }
  const { ast, render, errors } = compile(`<p v-t="'foo.bar'"></p>`, { modules: [i18nModule] })
  t.is(ast.i18n, 'foo.bar')
  t.is(render, `with(this){return _c(\'p\',{domProps:{"textContent":_s("foo.bar")}})}`)
  t.deepEqual(errors, [])
})

test('fallback custom directive', t => {
  const { ast, render, errors } = compile(`<p v-t="'foo.bar'"></p>`)
  t.falsy(ast.i18n)
  t.deepEqual(ast.directives[0], { name: 't', rawName: 'v-t', value: '\'foo.bar\'', arg: null, modifiers: undefined })
  t.deepEqual(errors, [])
})
*/
