'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _stringify = require('babel-runtime/core-js/json/stringify');

var _stringify2 = _interopRequireDefault(_stringify);

exports.warn = warn;
exports.isPlainObject = isPlainObject;
exports.addProp = addProp;
exports.getAttr = getAttr;
exports.removeAttr = removeAttr;
exports.evaluateValue = evaluateValue;

var _vm = require('vm2');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const vm = new _vm.VM();

function warn(msg, err) {
  if (typeof console !== 'undefined') {
    console.warn('[vue-i18n-extensions] ' + msg);
    /* istanbul ignore if */
    if (err) {
      console.warn(err.stack);
    }
  }
}

const toString = Object.prototype.toString;
const OBJECT_STRING = '[object Object]';
function isPlainObject(obj) {
  return toString.call(obj) === OBJECT_STRING;
}

function addProp(el, name, value) {
  (el.props || (el.props = [])).push({ name, value });
}

function getAttr(el, name) {
  return el.attrsMap[name];
}

function removeAttr(el, name) {
  if (el.attrsMap[name] !== null) {
    const list = el.attrsList;
    for (let i = 0, l = list.length; i < l; i++) {
      if (list[i].name === name) {
        list.splice(i, 1);
        break;
      }
    }
  }
}

function evaluateValue(expression) {
  const ret = { status: 'ng', value: undefined };
  try {
    const val = vm.run(`(new Function('return ' + ${(0, _stringify2.default)(expression)}))()`);
    ret.status = 'ok';
    ret.value = val;
  } catch (e) {}
  return ret;
}