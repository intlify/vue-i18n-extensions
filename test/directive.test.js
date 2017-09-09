import test from 'ava'
import sinon from 'sinon'
import Vue from 'vue'
import VueI18n from 'vue-i18n'
import { createRenderer } from 'vue-server-renderer'
import { directive } from '../src/index'

Vue.use(VueI18n)

const options = {
  locale: 'en',
  messages: {
    en: {
      hello: 'hello',
      named: 'hi {name}!',
      list: 'hi {0}!'
    },
    ja: {
      hello: 'こんにちは',
      named: 'やあ、{name}！',
      list: 'やあ、{0}！'
    }
  }
}

const i18n = new VueI18n(options)
const renderer = createRenderer({
  directives: { t: directive }
})

test('string literal', t => {
  const app = new Vue({
    i18n,
    render (h) {
      // <p v-t="'hello'"></p>
      return h('p', {
        directives: [{
          name: 't', rawName: 'v-t',
          value: ('hello'), expression: "'hello'"
        }]
      })
    }
  })

  renderer.renderToString(app, (err, html) => {
    t.falsy(err)
    t.is(html, '<p data-server-rendered=\"true\">hello</p>')
  })
})

test('object', t => {
  const app = new Vue({
    i18n,
    data: { msgPath: 'named' },
    render (h) {
      // <p v-t="{ path: msgPath, locale: 'ja', args: { name: 'kazupon' } }"></p>
      return h('p', {
        directives: [{
          name: 't', rawName: 'v-t',
          value: ({ path: this.msgPath, locale: 'ja', args: { name: 'kazupon' } }),
          expression: "{ path: msgPath, locale: 'ja', args: { name: 'kazupon' } }"
        }]
      })
    }
  })

  renderer.renderToString(app, (err, html) => {
    t.falsy(err)
    t.is(html, '<p data-server-rendered=\"true\">やあ、kazupon！</p>')
  })
})

test('has some children', t => {
  const app = new Vue({
    i18n,
    render (h) {
      return h('div', {
        /*
         * <div v-t="'hello'">
         *   <p>child1</p>
         *   <p>child2</p>
         * </div>
         */
        directives: [{
          name: 't', rawName: 'v-t',
          value: ('hello'), expression: "'hello'"
        }]
      }, [h('p', ['child1']), h('p', ['child2'])])
    }
  })

  renderer.renderToString(app, (err, html) => {
    t.falsy(err)
    t.is(html, '<div data-server-rendered=\"true\">hello</div>')
  })
})

test('not support value type warning', t => {
  const spy = sinon.spy(console, 'warn')

  const app = new Vue({
    i18n,
    render (h) {
      // <p v-t="[1]"></p>
      return h('p', {
        directives: [{
          name: 't', rawName: 'v-t', value: ([1]), expression: '[1]'
        }]
      })
    }
  })

  renderer.renderToString(app, (err, html) => {
    t.falsy(err)
    t.is(html, '<p data-server-rendered=\"true\"></p>')
    t.true(spy.withArgs('[vue-i18n-extensions] not support value type').calledOnce)
    spy.restore()
  })
})

test('required path warning', t => {
  const spy = sinon.spy(console, 'warn')

  const app = new Vue({
    i18n,
    data: { msgPath: 'named' },
    render (h) {
      // <p v-t="{ locale: 'ja', args: { name: 'kazupon' } }"></p>
      return h('p', {
        directives: [{
          name: 't', rawName: 'v-t',
          value: ({ locale: 'ja', args: { name: 'kazupon' } }),
          expression: "{ locale: 'ja', args: { name: 'kazupon' } }"
        }]
      })
    }
  })

  renderer.renderToString(app, (err, html) => {
    t.falsy(err)
    t.is(html, '<p data-server-rendered=\"true\"></p>')
    t.true(spy.withArgs('[vue-i18n-extensions] required `path` in v-t directive').calledOnce)
    spy.restore()
  })
})

test('not exist VueI18n instance warning', t => {
  const spy = sinon.spy(console, 'warn')

  const app = new Vue({
    render (h) {
      // <p v-t="'hello'"></p>
      return h('p', {
        directives: [{
          name: 't', rawName: 'v-t',
          value: ('hello'), expression: "'hello'"
        }]
      })
    }
  })

  renderer.renderToString(app, (err, html) => {
    t.falsy(err)
    t.is(html, '<p data-server-rendered=\"true\"></p>')
    t.true(spy.withArgs('[vue-i18n-extensions] not exist VueI18n instance in Vue instance').calledOnce)
    spy.restore()
  })
})

test('array args', t => {
  const app = new Vue({
    i18n,
    data: { msgPath: 'list' },
    render (h) {
      // <p v-t="{ path: msgPath, locale: 'ja', args: ['kazupon'] }"></p>
      return h('p', {
        directives: [{
          name: 't', rawName: 'v-t',
          value: ({ path: this.msgPath, locale: 'ja', args: ['kazupon'] }),
          expression: "{ path: msgPath, locale: 'ja', args: ['kazupon'] }"
        }]
      })
    }
  })

  renderer.renderToString(app, (err, html) => {
    t.falsy(err)
    t.is(html, '<p data-server-rendered=\"true\">やあ、kazupon！</p>')
  })
})
