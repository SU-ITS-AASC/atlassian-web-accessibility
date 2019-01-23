// src/js/aui/index-of.js
(typeof window === 'undefined' ? global : window).__3e63601581c20cf62a12c1c11776baa0 = (function () {
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
   * Finds the index of an element in the array.
   *
   * @param {Array} The array being searched.
   * @param {Mixed} item Element which will be searched for.
   * @param {Integer} fromIndex The index from which the item will be searched. Negative values will search from the end of the array.
   *
   * @returns {Integer}
   */
  function indexOf(array, item, fromIndex) {
      var length = array.length;
  
      if (!fromIndex) {
          fromIndex = 0;
      } else if (fromIndex < 0) {
          fromIndex = Math.max(0, length + fromIndex);
      }
  
      for (var i = fromIndex; i < length; i++) {
          if (array[i] === item) {
              return i;
          }
      }
  
      return -1;
  }
  
  (0, _globalize2.default)('indexOf', indexOf);
  
  exports.default = indexOf;
  module.exports = exports['default'];
  
  return module.exports;
}).call(this);