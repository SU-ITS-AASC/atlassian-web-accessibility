// src/js/aui/include.js
(typeof window === 'undefined' ? global : window).__b47fe435d7d231cd9ccf33cd539d9888 = (function () {
  var module = {
    exports: {}
  };
  var exports = module.exports;
  
  'use strict';
  
  Object.defineProperty(exports, "__esModule", {
      value: true
  });
  
  var _jquery = __700a145ba3db9966cc95664c892049f8;
  
  var _jquery2 = _interopRequireDefault(_jquery);
  
  var _deprecation = __921ad9514d56376fef992861d9ec0f51;
  
  var _contains = __314cfd19ff44fc21aa5412fc0dd1f9c1;
  
  var _contains2 = _interopRequireDefault(_contains);
  
  var _globalize = __28c84e7bb75f6c3b0ba124d57bd69571;
  
  var _globalize2 = _interopRequireDefault(_globalize);
  
  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
  
  var included = [];
  
  function include(url) {
      if (!(0, _contains2.default)(included, url)) {
          included.push(url);
          var s = document.createElement('script');
          s.src = url;
          (0, _jquery2.default)('body').append(s);
      }
  }
  
  var include = (0, _deprecation.fn)(include, 'include', {
      sinceVersion: '5.9.0',
      extraInfo: 'No alternative will be provided. Use a proper module loader instead.'
  });
  
  (0, _globalize2.default)('include', include);
  
  exports.default = include;
  module.exports = exports['default'];
  
  return module.exports;
}).call(this);