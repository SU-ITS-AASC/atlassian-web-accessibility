// src/js/aui/debounce.js
(typeof window === 'undefined' ? global : window).__ee62e24d4acb40214d4f9e21b1a58bfc = (function () {
  var module = {
    exports: {}
  };
  var exports = module.exports;
  
  'use strict';
  
  Object.defineProperty(exports, "__esModule", {
      value: true
  });
  exports.default = debounce;
  exports.debounceImmediate = debounceImmediate;
  
  var _globalize = __28c84e7bb75f6c3b0ba124d57bd69571;
  
  var _globalize2 = _interopRequireDefault(_globalize);
  
  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
  
  function debounce(func, wait) {
      var timeout;
      var result;
  
      return function () {
          var args = arguments;
          var context = this;
          var later = function later() {
              result = func.apply(context, args);
              context = args = null;
          };
  
          clearTimeout(timeout);
          timeout = setTimeout(later, wait);
  
          return result;
      };
  }
  
  (0, _globalize2.default)('debounce', debounce);
  
  function debounceImmediate(func, wait) {
      var timeout = null;
      var result;
  
      return function () {
          var context = this;
          var args = arguments;
          var later = function later() {
              timeout = context = args = null;
          };
  
          if (timeout === null) {
              result = func.apply(context, args);
          }
  
          clearTimeout(timeout);
          timeout = setTimeout(later, wait);
  
          return result;
      };
  }
  
  (0, _globalize2.default)('debounceImmediate', debounceImmediate);
  
  return module.exports;
}).call(this);