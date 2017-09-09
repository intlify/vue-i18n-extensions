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

export function addProp (el, name, value) {
  (el.props || (el.props = [])).push({ name, value })
}

export function getAttr (el, name) {
  return el.attrsMap[name]
}

export function removeAttr (el, name) {
  if ((el.attrsMap[name]) !== null) {
    const list = el.attrsList
    for (let i = 0, l = list.length; i < l; i++) {
      if (list[i].name === name) {
        list.splice(i, 1)
        break
      }
    }
  }
}

export function evaluateValue (expression) {
  const ret = { status: 'ng', value: undefined }
  try {
    const val = (new Function('return ' + expression))()
    ret.status = 'ok'
    ret.value = val
  } catch (e) { }
  return ret
}
