// src/js/aui/escape.js
(typeof window === 'undefined' ? global : window).__358322a372d0f4ddd93ba2e992bb9c50 = (function () {
  var module = {
    exports: {}
  };
  var exports = module.exports;
  
  'use strict';
  
  Object.defineProperty(exports, "__esModule", {
      value: true
  });
  
  var _globalize = __28c84e7bb75f6c3b0ba124d57bd69571;
  
  var _globalize2 = _interopRequireDefault(_globalize);
  
  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
  
  /**
   * Similar to Javascript's in-built escape() function, but where the built-in escape()
   * might encode unicode charaters as %uHHHH, this function will leave them as-is.
   *
   * NOTE: this function does not do html-escaping, see escapeHtml().
   */
  var jsEscape = window.escape;
  
  function escape(string) {
      return jsEscape(string).replace(/%u\w{4}/gi, function (w) {
          return unescape(w);
      });
  }
  
  (0, _globalize2.default)('escape', escape);
  
  exports.default = escape;
  module.exports = exports['default'];
  
  return module.exports;
}).call(this);