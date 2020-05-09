# :globe_with_meridians: @intlify/vue-i18n-extensions

[![CircleCI](https://circleci.com/gh/intlify/vue-i18n-extensions/tree/master.svg?style=svg)](https://circleci.com/gh/intlify/vue-i18n-extensions/tree/dev)
[![npm](https://img.shields.io/npm/v/@intlify/vue-i18n-extensions.svg)](https://www.npmjs.com/package/@intlify/vue-i18n-extensions)
[![vue-i18n-extensions Dev Token](https://badge.devtoken.rocks/vue-i18n-extensions)](https://devtoken.rocks/package/vue-i18n-extensions)

> Extensions for vue-i18n

**NOTE:** :warning: This `next` branch is development branch for Vue 3! The stable version is now in [`master`](https://github.com/intlify/vue-i18n-extensions/tree/master) branch!

## Status: Alpha ![Test](https://github.com/intlify/vue-i18n-extensions/workflows/Test/badge.svg)

This library exports the following extensions:

## :star: Features
- module: `v-t` custom directive compiler module for the following:
  - `@vue/compiler-core` (`options` at `baseCompile` function)
  - `@vue/compiler-dom` (`options` at `compile` function)
  - `@vue/compiler-sfc` (`compilerOptions` at `compileTemplate` function)
  - `vue-loader` (`compilerOptions` at `options`)

## :cd: Installation

```sh
$ npm i --save-dev @intlify/vue-i18n-extensions@alpha
```

## :rocket: Extensions

### module: `v-t` custom directive compiler module
This module is `v-t` custom directive module for vue compilers. You can specify it.

The following example that use `compile` function of `@vue/compiler-dom`:

```js
import { compile } from '@vue/compiler-dom'
import { createI18n } from 'vue-i18n'
import { defineTransformVT } from '@intlify/vue-i18n-extensions'

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
const transformVT = defineTransformVT(i18n)

const { code } = compile(`<p v-t="'hello'"></p>`, {
  mode: 'function',
  hoistStatic: true,
  prefixIdentifiers: true,
  directiveTransforms: { t: transformVT }
})
console.log(codel)
/* output -> 'hello'
  const { createVNode: _createVNode, openBlock: _openBlock, createBlock: _createBlock } = Vue

  const _hoisted_1 = { textContent: "こんにちは" }

  return function render(_ctx, _cache) {
    return (_openBlock(), _createBlock("p", _hoisted_1))
  }
*/
```

The following configration example of `vue-loader`:

```js
const { VueLoaderPlugin } = require('vue-loader')
const { createI18n } = require('vue-i18n')
const { defineTransformVT } = require('@intlify/vue-i18n-extensions')

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
const transformVT = defineTransformVT(i18n)

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

## :copyright: License

[MIT](http://opensource.org/licenses/MIT)
