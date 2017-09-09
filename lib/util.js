'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.warn = warn;
exports.isPlainObject = isPlainObject;
function warn(msg, err) {
  if (typeof console !== 'undefined') {
    console.warn('[vue-i18n-extensions] ' + msg);
    /* istanbul ignore if */
    if (err) {
      console.warn(err.stack);
    }
  }
}

var toString = Object.prototype.toString;
var OBJECT_STRING = '[object Object]';
function isPlainObject(obj) {
  return toString.call(obj) === OBJECT_STRING;
}