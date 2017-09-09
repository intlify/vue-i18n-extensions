import {
  warn,
  isPlainObject,
  addProp,
  getAttr,
  removeAttr,
  evaluateValue
} from './util'

export function directive (vnode, dir) {
  const value = dir.value

  const { path, locale, args } = parseValue(value)
  if (!path && !locale && !args) {
    warn('not support value type')
    return
  }

  const vm = vnode.context
  if (!path) {
    warn('required `path` in v-t directive')
    return
  }

  if (!vm) {
    warn('not exist Vue instance in VNode context')
    return
  }

  if (!vm.$i18n) {
    warn('not exist VueI18n instance in Vue instance')
    return
  }

  const params = makeParams(locale, args)
  vnode.children = [vm._v(vm.$i18n.t(path, ...params))]
}

export function module (i18n) {
  return {
    transformNode (el) {
      const exp = getAttr(el, 'v-t')
      if (!exp) { return }

      const { status, value } = evaluateValue(exp)
      if (status === 'ng') {
        warn('pre-localization with v-t support only static params')
        return
      }

      const { path, locale, args } = parseValue(value)
      if (!path && !locale && !args) {
        warn('not support value type')
        return
      }

      const params = makeParams(locale, args)
      el.i18n = i18n.t(path, ...params)

      removeAttr(el, 'v-t')
    },

    genData (el) {
      if (el.i18n) {
        addProp(el, 'textContent', `_s(${JSON.stringify(el.i18n)})`) // generate via 'domProps'
        el.children = [] // clear children, due to be inserted with textContet
      }
      return ''
    }
  }
}

function parseValue (value) {
  let path, locale, args

  if (typeof value === 'string') {
    path = value
  } else if (isPlainObject(value)) {
    path = value.path
    locale = value.locale
    args = value.args
  }

  return { path, locale, args }
}

function makeParams (locale, args) {
  const params = []

  locale && params.push(locale)
  if (args && (Array.isArray(args) || isPlainObject(args))) {
    params.push(args)
  }

  return params
}
