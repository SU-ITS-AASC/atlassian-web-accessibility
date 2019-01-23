// src/js/aui/internal/amdify.js
(typeof window === 'undefined' ? global : window).__65ca28a9d6b0f244027266ff8e6a6d1c = (function () {
  var module = {
    exports: {}
  };
  var exports = module.exports;
  
  'use strict';
  
  Object.defineProperty(exports, "__esModule", {
      value: true
  });
  
  exports.default = function (name, fn) {
      if (window.define) {
          var alias = window.define;
          alias(name, [], function () {
              return fn;
          });
      }
      return fn;
  };
  
  module.exports = exports['default'];
  
  return module.exports;
}).call(this);