'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.directive = directive;

var _util = require('./util');

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function directive(vnode, dir) {
  var _vm$$i18n;

  var value = dir.value;

  var path = void 0,
      locale = void 0,
      args = void 0;
  if (typeof value === 'string') {
    path = value;
  } else if ((0, _util.isPlainObject)(value)) {
    path = value.path;
    locale = value.locale;
    args = value.args;
  } else {
    (0, _util.warn)('not support value type');
    return;
  }

  var vm = vnode.context;
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

  var params = [];
  locale && params.push(locale);

  if (args) {
    if (Array.isArray(args)) {
      params = params.concat(args);
    } else if ((0, _util.isPlainObject)(args)) {
      params.push(args);
    }
  }

  vnode.children = [vm._v((_vm$$i18n = vm.$i18n).t.apply(_vm$$i18n, [path].concat(_toConsumableArray(params))))];
}