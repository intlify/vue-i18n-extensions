# :globe_with_meridians: @intlify/vue-i18n-extensions

[![CircleCI](https://circleci.com/gh/intlify/vue-i18n-extensions/tree/next.svg?style=svg)](https://circleci.com/gh/intlify/vue-i18n-extensions/tree/dev)
[![npm](https://img.shields.io/npm/v/@intlify/vue-i18n-extensions.svg)](https://www.npmjs.com/package/@intlify/vue-i18n-extensions)
[![vue-i18n-extensions Dev Token](https://badge.devtoken.rocks/vue-i18n-extensions)](https://devtoken.rocks/package/vue-i18n-extensions)

> Extensions for vue-i18n

**NOTE:** :warning: This `next` branch is development branch for Vue 3! The stable version is now in [`master`](https://github.com/intlify/vue-i18n-extensions/tree/master) branch!

## Status: RC ![Test](https://github.com/intlify/vue-i18n-extensions/workflows/Test/badge.svg)

This library exports the following extensions:


## :star: Features

- Server-side rendering for `v-t` custom directive
- Pre-Translation


## :cd: Installation

```sh
$ npm i --save-dev @intlify/vue-i18n-extensions@alpha
```


## :rocket: Extensions

### Server-side rendering for `v-t` custom directive

You can use tnrasform offered with this package, to support Server-side rendering for `v-t` custom directives.

In order to use this feature, you need to specify to Vue compiler option.
The following example that use `compile` of `@vue/compiler-ssr`:

```js
import * as runtimeDom from '@vue/runtime-dom'
import { compile } from '@vue/compiler-ssr'
import { defineComponent, createSSRApp } from 'vue'
import { renderToString } from '@vue/server-renderer'
import { createI18n, useI18n } from 'vue-i18n'
import { transformVTDirective } from '@intlify/vue-i18n-extensions'

// create i18n instance
const i18n = createI18n({
  locale: 'ja',
  messages: {}
})

// get transform from  `transformVTDirective` function
const transformVT = transformVTDirective()

// compile your source
const source = `<div v-t="{ path: 'dessert', locale: 'en', plural: 2, args: { name: 'banana' } }"/>`
const { code } = compile(source, {
  mode: 'function',
  directiveTransforms: { t: transformVT } // <- you need to specify to `directiveTransforms` option!
})

// render functionalization
const render = Function('require', 'Vue', code)(require, runtimeDom)

// e.g. set render function to App component
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

// create SSR app
const app = createSSRApp(App)

// install vue-i18n
app.use(i18n)

console.log(await renderToString(app))
// output -> <div>I eat 2 bananas!</div>`
```


### Pre-Translation with using `v-t` custom directive

You can pre-translation i18n locale messsages of vue-i18n.

> :warning: NOTE: Only the scope of global i18n locale messages can be pre-translated !!

> :warning: NOTE: Currently only `v-t` custom directive is supported !!

In order to use this feature, you need to specify to Vue compiler option.
The following example that use `compile` of `@vue/compiler-dom`:

```js
import { compile } from '@vue/compiler-dom'
import { createI18n } from 'vue-i18n'
import { transformVTDirective } from '@intlify/vue-i18n-extensions'

// create i18n instance
const i18n = createI18n({
  locale: 'ja',
  messages: {
    en: {
      hello: 'hello'
    },
    ja: {
      hello: 'こんにちは'
    }
  }
})

// get transform from  `transformVTDirective` function, with `i18n` option
const transformVT = transformVTDirective({ i18n })

const { code } = compile(`<p v-t="'hello'"></p>`, {
  mode: 'function',
  hoistStatic: true,
  prefixIdentifiers: true,
  directiveTransforms: { t: transformVT } // <- you need to specify to `directiveTransforms` option!
})
console.log(code)
/*
  output ->
    const { createVNode: _createVNode, openBlock: _openBlock, createBlock: _createBlock } = Vue

    return function render(_ctx, _cache) {
      return (_openBlock(), _createBlock(\\"div\\", null, \\"こんにちは！\\"))
    }
*/
```

The following configration example of `vue-loader`:

```js
const { VueLoaderPlugin } = require('vue-loader')
const { createI18n } = require('vue-i18n')
const { transformVTDirective } = require('@intlify/vue-i18n-extensions')

const i18n = createI18n({
  locale: 'ja',
  messages: {
    en: {
      hello: 'hello'
    },
    ja: {
      hello: 'こんにちは'
    }
  }
})
const transformVT = transformVTDirective(i18n)

module.exports = {
  module: {
    // ...
    rules: [
      {
        test: /\.vue$/,
        use: [
          {
            loader: 'vue-loader',
            options: {
              compilerOptions: {
                directiveTransforms: { t: transformVT }
              }
            }
          }
        ]
      },
      // ...
    ]
  },
  plugins: [new VueLoaderPlugin()]
}
```

You can specify the transform resulting from `transformVTDirective` in the compiler options for each package offered by vue-next, and tool chains:

- `@vue/compiler-core` (`options` at `baseCompile` function)
- `@vue/compiler-dom` (`options` at `compile` function)
- `@vue/compiler-ssr` (`options` at `compile` function)
- `@vue/compiler-sfc` (`compilerOptions` at `compileTemplate` function)
- `vue-loader` (`compilerOptions` at `options`)
- `rollup-plugin-vue` (`compilerOptions` at [`Options`](https://github.com/vuejs/rollup-plugin-vue/blob/next/src/index.ts#L50))
- `vite` (`vueCompilerOptions` at [`CoreOptions`](https://github.com/vitejs/vite/blob/master/src/node/config.ts#L154))


## API

About details, See [docs](./docs/@intlify/vue-i18n-extensions-api.md)


## :copyright: License

[MIT](http://opensource.org/licenses/MIT)
