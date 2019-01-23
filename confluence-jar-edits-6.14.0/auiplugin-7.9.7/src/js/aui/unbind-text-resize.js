// src/js/aui/unbind-text-resize.js
(typeof window === 'undefined' ? global : window).__f3d381aba64bcc0398067b5549b26ea5 = (function () {
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
  
  var _onTextResize = __9a2cde50c39116ec3f36bd040c98b8ba;
  
  var _onTextResize2 = _interopRequireDefault(_onTextResize);
  
  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
  
  function unbindTextResize(f) {
      for (var i = 0, ii = _onTextResize2.default['on-text-resize'].length; i < ii; i++) {
          if (_onTextResize2.default['on-text-resize'][i] === f) {
              return _onTextResize2.default['on-text-resize'].splice(i, 1);
          }
      }
  }
  
  (0, _globalize2.default)('unbindTextResize', unbindTextResize);
  
  exports.default = unbindTextResize;
  module.exports = exports['default'];
  
  return module.exports;
}).call(this);