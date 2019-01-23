// src/js/aui/contains.js
(typeof window === 'undefined' ? global : window).__314cfd19ff44fc21aa5412fc0dd1f9c1 = (function () {
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
  
  var _indexOf = __3e63601581c20cf62a12c1c11776baa0;
  
  var _indexOf2 = _interopRequireDefault(_indexOf);
  
  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
  
  /**
   * Looks for an element inside the array.
   *
   * @param {Array} array The array being searched.
   * @param {Array} item The current item.
   *
   * @return {Boolean}
   */
  function contains(array, item) {
    return (0, _indexOf2.default)(array, item) > -1;
  }
  
  (0, _globalize2.default)('contains', contains);
  
  exports.default = contains;
  module.exports = exports['default'];
  
  return module.exports;
}).call(this);