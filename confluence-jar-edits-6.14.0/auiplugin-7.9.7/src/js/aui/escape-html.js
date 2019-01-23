// src/js/aui/escape-html.js
(typeof window === 'undefined' ? global : window).__48697fd7ae587e40e44fef53ab10460c = (function () {
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
  
  function escapeHtml(str) {
      return str.replace(/[&"'<>`]/g, function (str) {
          var special = {
              '<': '&lt;',
              '>': '&gt;',
              '&': '&amp;',
              '\'': '&#39;',
              '`': '&#96;'
          };
  
          if (typeof special[str] === 'string') {
              return special[str];
          }
  
          return '&quot;';
      });
  }
  
  (0, _globalize2.default)('escapeHtml', escapeHtml);
  
  exports.default = escapeHtml;
  module.exports = exports['default'];
  
  return module.exports;
}).call(this);