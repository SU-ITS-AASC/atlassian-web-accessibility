// src/js/aui/backbone.js
(typeof window === 'undefined' ? global : window).__320e4ec293ac29d49b959aa9d46df68f = (function () {
  var module = {
    exports: {}
  };
  var exports = module.exports;
  
  'use strict';
  
  Object.defineProperty(exports, "__esModule", {
      value: true
  });
  
  var _underscore = __59c1c30030f41c99b6757d449d9a3a7b;
  
  var _underscore2 = _interopRequireDefault(_underscore);
  
  var _backbone = __b6ce661a78f7af3f026ea6e982ba4efe;
  
  var _backbone2 = _interopRequireDefault(_backbone);
  
  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
  
  // BEWARE: The following is an unused import with side-effects
  if (!window.Backbone) {
      window.Backbone = _backbone2.default;
  } // eslint-disable-line no-unused-vars
  exports.default = window.Backbone;
  module.exports = exports['default'];
  
  return module.exports;
}).call(this);