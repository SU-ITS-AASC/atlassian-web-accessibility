// src/js/aui/internal/is-input.js
(typeof window === 'undefined' ? global : window).__dff830f45baf5eb0b8447c97bbcc4699 = (function () {
  var module = {
    exports: {}
  };
  var exports = module.exports;
  
  'use strict';
  
  Object.defineProperty(exports, "__esModule", {
      value: true
  });
  
  exports.default = function (el) {
      return 'value' in el || el.isContentEditable;
  };
  
  module.exports = exports['default'];
  
  return module.exports;
}).call(this);