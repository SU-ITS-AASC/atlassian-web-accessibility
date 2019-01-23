// src/js/aui/internal/globalize.js
(typeof window === 'undefined' ? global : window).__28c84e7bb75f6c3b0ba124d57bd69571 = (function () {
  var module = {
    exports: {}
  };
  var exports = module.exports;
  
  'use strict';
  
  Object.defineProperty(exports, "__esModule", {
      value: true
  });
  exports.default = globalize;
  
  var _createElement = __bc7785911e746c80e8029c2e254e3b9c;
  
  var _createElement2 = _interopRequireDefault(_createElement);
  
  var _objectAssign = __dd206a36bdd8311f4bbdc75033adb612;
  
  var _objectAssign2 = _interopRequireDefault(_objectAssign);
  
  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
  
  function auiNamespace() {
      return _createElement2.default.apply(undefined, arguments);
  };
  var NAMESPACE = 'AJS';
  
  function globalize(name, value) {
      if (window[NAMESPACE] !== auiNamespace) {
          window[NAMESPACE] = (0, _objectAssign2.default)(auiNamespace, window[NAMESPACE]);
      }
  
      return window[NAMESPACE][name] = value;
  }
  module.exports = exports['default'];
  
  return module.exports;
}).call(this);