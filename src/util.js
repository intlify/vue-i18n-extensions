export function warn (msg, err) {
  if (typeof console !== 'undefined') {
    console.warn('[vue-i18n-extensions] ' + msg)
    /* istanbul ignore if */
    if (err) {
      console.warn(err.stack)
    }
  }
}

const toString = Object.prototype.toString
const OBJECT_STRING = '[object Object]'
export function isPlainObject (obj) {
  return toString.call(obj) === OBJECT_STRING
}
