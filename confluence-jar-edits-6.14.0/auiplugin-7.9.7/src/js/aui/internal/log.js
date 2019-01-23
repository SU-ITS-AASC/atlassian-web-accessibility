// src/js/aui/internal/log.js
(typeof window === 'undefined' ? global : window).__c1e961001275c079e48525ad3a48c8c2 = (function () {
  var module = {
    exports: {}
  };
  var exports = module.exports;
  
  'use strict';
  
  Object.defineProperty(exports, "__esModule", {
      value: true
  });
  exports.error = exports.warn = exports.log = undefined;
  
  var _globalize = __28c84e7bb75f6c3b0ba124d57bd69571;
  
  var _globalize2 = _interopRequireDefault(_globalize);
  
  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
  
  function polyfillConsole(prop) {
      return function () {
          if (typeof console !== 'undefined' && console[prop]) {
              Function.prototype.apply.call(console[prop], console, arguments);
          }
      };
  }
  
  var log = polyfillConsole('log');
  var warn = polyfillConsole('warn');
  var error = polyfillConsole('error');
  
  (0, _globalize2.default)('error', error);
  (0, _globalize2.default)('log', log);
  (0, _globalize2.default)('warn', warn);
  
  exports.log = log;
  exports.warn = warn;
  exports.error = error;
  
  return module.exports;
}).call(this);