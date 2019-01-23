// src/js/aui/internal/has-touch.js
(typeof window === 'undefined' ? global : window).__6c4fb3940d6fd500a61aec90cc3f93dc = (function () {
  var module = {
    exports: {}
  };
  var exports = module.exports;
  
  'use strict';
  
  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  var DocumentTouch = window.DocumentTouch;
  var hasTouch = 'ontouchstart' in window || DocumentTouch && document instanceof DocumentTouch;
  exports.default = hasTouch;
  module.exports = exports['default'];
  
  return module.exports;
}).call(this);