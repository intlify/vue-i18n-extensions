# @intlify/vue-i18n-extensions API References

## Table Of Contents

- [Function](#function)
  - [transformVTDirective](#transformvtdirective)
- [Interface](#interface)
  - [TransformVTDirectiveOptions](#transformvtdirectiveoptions)

## Function

### transformVTDirective

Transform `v-t` custom directive

**Signature:**
```typescript
declare function transformVTDirective<Messages extends Record<string, unknown> = {}, // eslint-disable-line @typescript-eslint/ban-types -- TODO: fix this
DateTimeFormats extends Record<string, unknown> = {}, // eslint-disable-line @typescript-eslint/ban-types -- TODO: fix this
NumberFormats extends Record<string, unknown> = {}, // eslint-disable-line @typescript-eslint/ban-types -- TODO: fix this
Legacy extends boolean = true>(options?: TransformVTDirectiveOptions<Messages, DateTimeFormats, NumberFormats, Legacy>): DirectiveTransform;
```

#### Parameters

| Parameter | Type | Description |
| --- | --- | --- |
| options | TransformVTDirectiveOptions&lt;Messages, DateTimeFormats, NumberFormats, Legacy&gt; | `v-t` custom directive transform options, see [TransformVTDirectiveOptions](#transformvtdirectiveoptions) |

#### Returns

 Directive transform

#### Remarks

Transform that `v-t` custom directive is optimized vue-i18n code by Vue compiler. This transform can improve the performance by pre-translating, and it does support SSR.

#### Examples


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
// output ->
//   const { createVNode: _createVNode, openBlock: _openBlock, createBlock: _createBlock } = Vue
//   return function render(_ctx, _cache) {
//     return (_openBlock(), _createBlock(\\"div\\", null, \\"こんにちは！\\"))
//   }
```



## Interface

### TransformVTDirectiveOptions

Transform options for `v-t` custom directive

**Signature:**
```typescript
interface TransformVTDirectiveOptions<Messages extends Record<string, unknown> = {}, // eslint-disable-line @typescript-eslint/ban-types -- TODO: fix this
DateTimeFormats extends Record<string, unknown> = {}, // eslint-disable-line @typescript-eslint/ban-types -- TODO: fix this
NumberFormats extends Record<string, unknown> = {}, // eslint-disable-line @typescript-eslint/ban-types -- TODO: fix this
Legacy extends boolean = true> 
```


#### Properties

##### i18n

I18n instance

**Signature:**
```typescript
i18n?: I18n<Messages, DateTimeFormats, NumberFormats, Legacy>;
```

#### Remarks

If this option is specified, `v-t` custom directive transform uses an I18n instance to pre-translate. The translation will use the global resources registered in the I18n instance, that is, `v-t` directive transform is also a limitation that the resources of each component cannot be used.

##### mode

I18n Mode

**Signature:**
```typescript
mode?: I18nMode;
```

#### Remarks

Specify the API style of vue-i18n. If you use legacy API style (e.g. `$t`) at vue-i18n, you need to specify `legacy`.

 'composition'

##### translationSignatures

Translation function signatures

**Signature:**
```typescript
translationSignatures?: string | string[];
```

#### Remarks

You can specify the signature of the translation function attached to the binding context when it is codegen in the Vue Compiler. If you have changed the signature to a non `t` signature in the `setup` hook or `<script setup>`, you can safely SSR it. If each Vue component has a different signature for the translation function, you can specify several in an array for safe SSR. This option value is `undefined` and the signature attached to the binding context is `t`.



