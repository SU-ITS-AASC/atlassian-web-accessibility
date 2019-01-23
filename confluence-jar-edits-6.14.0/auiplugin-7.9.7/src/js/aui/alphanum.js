// src/js/aui/alphanum.js
(typeof window === 'undefined' ? global : window).__40ab0ec9dde6fa5e8252e2a0ff1128be = (function () {
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
   * Compare two strings in alphanumeric way
   * @method alphanum
   * @param {String} a first string to compare
   * @param {String} b second string to compare
   * @return {Number(-1|0|1)} -1 if a < b, 0 if a = b, 1 if a > b
   */
  function alphanum(a, b) {
      a = (a + '').toLowerCase();
      b = (b + '').toLowerCase();
  
      var chunks = /(\d+|\D+)/g;
      var am = a.match(chunks);
      var bm = b.match(chunks);
      var len = Math.max(am.length, bm.length);
  
      for (var i = 0; i < len; i++) {
          if (i === am.length) {
              return -1;
          }
  
          if (i === bm.length) {
              return 1;
          }
  
          var ad = parseInt(am[i], 10) + '';
          var bd = parseInt(bm[i], 10) + '';
  
          if (ad === am[i] && bd === bm[i] && ad !== bd) {
              return (ad - bd) / Math.abs(ad - bd);
          }
  
          if ((ad !== am[i] || bd !== bm[i]) && am[i] !== bm[i]) {
              return am[i] < bm[i] ? -1 : 1;
          }
      }
  
      return 0;
  }
  
  (0, _globalize2.default)('alphanum', alphanum);
  
  exports.default = alphanum;
  module.exports = exports['default'];
  
  return module.exports;
}).call(this);