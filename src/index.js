import { warn, isPlainObject } from './util'

export function directive (vnode, dir) {
  const value = dir.value

  let path, locale, args
  if (typeof value === 'string') {
    path = value
  } else if (isPlainObject(value)) {
    path = value.path
    locale = value.locale
    args = value.args
  } else {
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

  const params = []
  locale && params.push(locale)

  if (args && (Array.isArray(args) || isPlainObject(args))) {
    params.push(args)
  }

  vnode.children = [vm._v(vm.$i18n.t(path, ...params))]
}
