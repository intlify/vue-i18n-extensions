const VueI18n = require('vue-i18n')
const { createLocalVue } = require('@vue/test-utils')
const { createRenderer } = require('vue-server-renderer')
const { directive } = require('../src/index')

const Vue = createLocalVue()
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

it('string literal', () => {
  const app = new Vue({
    i18n,
    render: (h) => {
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
    if (err) throw new Error(err)
    expect(html).toMatchSnapshot()
  })
})

it('object', () => {
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
    if (err) throw new Error(err)
    expect(html).toMatchSnapshot()
  })
})

it('has some children', () => {
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
    if (err) throw new Error(err)
    expect(html).toMatchSnapshot()
  })
})

it('not support value type warning', () => {
  const spy = jest.spyOn(global.console, 'warn')
  spy.mockImplementation(x => x)

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
    if (err) throw new Error(err)
    expect(html).toMatchSnapshot()
    expect(spy.mock.calls[0][0]).toBe('[vue-i18n-extensions] not support value type')
    spy.mockReset()
    spy.mockRestore()
  })
})

it('required path warning', () => {
  const spy = jest.spyOn(global.console, 'warn')
  spy.mockImplementation(x => x)

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
    if (err) throw new Error(err)
    expect(html).toMatchSnapshot()
    expect(spy.mock.calls[0][0]).toBe('[vue-i18n-extensions] required `path` in v-t directive')
    spy.mockReset()
    spy.mockRestore()
  })
})

it('VueI18n instance does not exists warning', () => {
  const spy = jest.spyOn(global.console, 'warn')
  spy.mockImplementation(x => x)

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
    if (err) throw new Error(err)
    expect(html).toMatchSnapshot()
    expect(spy.mock.calls[0][0]).toBe('[vue-i18n-extensions] VueI18n instance does not exists in Vue instance')
    spy.mockReset()
    spy.mockRestore()
  })
})

it('array args', () => {
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
    if (err) throw new Error(err)
    expect(html).toMatchSnapshot()
  })
})
