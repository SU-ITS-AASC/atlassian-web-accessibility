// src/js/aui/layer-manager.js
(typeof window === 'undefined' ? global : window).__390cf96dd9cd56462d8fa8c8e223fa6a = (function () {
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
  
  var _layer = __3ada4a8272640e5242be87f12c7e0fdf;
  
  var _layer2 = _interopRequireDefault(_layer);
  
  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
  
  (0, _globalize2.default)('LayerManager', _layer2.default.Manager);
  
  exports.default = _layer2.default.Manager;
  module.exports = exports['default'];
  
  return module.exports;
}).call(this);