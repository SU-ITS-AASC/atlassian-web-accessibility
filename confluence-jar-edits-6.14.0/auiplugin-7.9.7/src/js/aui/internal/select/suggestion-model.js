// src/js/aui/internal/select/suggestion-model.js
(typeof window === 'undefined' ? global : window).__3612acbfe60f9cd2a88e38733670f664 = (function () {
  var module = {
    exports: {}
  };
  var exports = module.exports;
  
  'use strict';
  
  Object.defineProperty(exports, "__esModule", {
      value: true
  });
  
  var _backbone = __320e4ec293ac29d49b959aa9d46df68f;
  
  var _backbone2 = _interopRequireDefault(_backbone);
  
  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
  
  exports.default = _backbone2.default.Model.extend({
      idAttribute: 'label',
      getLabel: function getLabel() {
          return this.get('label') || this.get('value');
      }
  });
  module.exports = exports['default'];
  
  return module.exports;
}).call(this);