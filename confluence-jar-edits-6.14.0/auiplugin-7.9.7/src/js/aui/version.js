// src/js/aui/version.js
(typeof window === 'undefined' ? global : window).__d55b17f777e9bed0264078626d52c7fc = (function () {
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
  
  // @note: this value is set via webpack and gulp
  // eslint-disable-next-line
  var version = '7.9.7';
  
  (0, _globalize2.default)('version', version);
  
  exports.default = version;
  module.exports = exports['default'];
  
  return module.exports;
}).call(this);