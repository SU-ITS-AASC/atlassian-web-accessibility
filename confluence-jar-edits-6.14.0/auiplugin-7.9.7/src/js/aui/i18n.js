// src/js/aui/i18n.js
(typeof window === 'undefined' ? global : window).__fa714f1b12d7502957e4e0b6196321bf = (function () {
  var module = {
    exports: {}
  };
  var exports = module.exports;
  
  'use strict';
  
  Object.defineProperty(exports, "__esModule", {
      value: true
  });
  
  var _format = __d31562b45156ec0db003c1af006240d5;
  
  var _format2 = _interopRequireDefault(_format);
  
  var _globalize = __28c84e7bb75f6c3b0ba124d57bd69571;
  
  var _globalize2 = _interopRequireDefault(_globalize);
  
  var _aui = __7200bf779bc91779c4bd25c87402f30d;
  
  var _aui2 = _interopRequireDefault(_aui);
  
  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
  
  /**
   * Returns the value defined in AJS.I18n.keys for the given key. If AJS.I18n.keys does not exist, or if the given key does not exist,
   * the key is returned - this could occur in plugin mode if the I18n transform is not performed;
   * or in flatpack mode if the i18n JS file is not loaded.
   */
  var i18n = {
      keys: _aui2.default,
      getText: function getText(key) {
          var params = Array.prototype.slice.call(arguments, 1);
  
          if (Object.prototype.hasOwnProperty.call(this.keys, key)) {
              return _format2.default.apply(null, [this.keys[key]].concat(params));
          }
  
          return key;
      }
  };
  
  (0, _globalize2.default)('I18n', i18n);
  
  exports.default = i18n;
  module.exports = exports['default'];
  
  return module.exports;
}).call(this);