'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.module = undefined;

var _stringify = require('babel-runtime/core-js/json/stringify');

var _stringify2 = _interopRequireDefault(_stringify);

exports.directive = directive;

var _util = require('./util');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function directive(vnode, dir) {
  const value = dir.value;

  const { path, locale, args } = parseValue(value);
  if (!path && !locale && !args) {
    (0, _util.warn)('not support value type');
    return;
  }

  const vm = vnode.context;
  if (!path) {
    (0, _util.warn)('required `path` in v-t directive');
    return;
  }

  if (!vm) {
    (0, _util.warn)('not exist Vue instance in VNode context');
    return;
  }

  if (!vm.$i18n) {
    (0, _util.warn)('not exist VueI18n instance in Vue instance');
    return;
  }

  const params = makeParams(locale, args);
  vnode.children = [vm._v(vm.$i18n.t(path, ...params))];
}

function _module(i18n) {
  return {
    transformNode(el) {
      const exp = (0, _util.getAttr)(el, 'v-t');
      if (!exp) {
        return;
      }

      const { status, value } = (0, _util.evaluateValue)(exp);
      if (status === 'ng') {
        (0, _util.warn)('pre-localization with v-t support only static params');
        return;
      }

      const { path, locale, args } = parseValue(value);
      if (!path && !locale && !args) {
        (0, _util.warn)('not support value type');
        return;
      }

      const params = makeParams(locale, args);
      el.i18n = i18n.t(path, ...params);

      (0, _util.removeAttr)(el, 'v-t');
    },

    genData(el) {
      if (el.i18n) {
        (0, _util.addProp)(el, 'textContent', `_s(${(0, _stringify2.default)(el.i18n)})`); // generate via 'domProps'
        el.children = []; // clear children, due to be inserted with textContet
      }
      return '';
    }
  };
}

exports.module = _module;
function parseValue(value) {
  let path, locale, args;

  if (typeof value === 'string') {
    path = value;
  } else if ((0, _util.isPlainObject)(value)) {
    path = value.path;
    locale = value.locale;
    args = value.args;
  }

  return { path, locale, args };
}

function makeParams(locale, args) {
  const params = [];

  locale && params.push(locale);
  if (args && (Array.isArray(args) || (0, _util.isPlainObject)(args))) {
    params.push(args);
  }

  return params;
}